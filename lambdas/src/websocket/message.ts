import { APIGatewayEvent, Context } from 'aws-lambda';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as geohash from 'ngeohash';

const GEOHASH_PRECISION = 5;
const driversTable = process.env.DRIVERS_TABLE || 'DriversTable';
const connectionsTable = process.env.CONNECTIONS_TABLE || 'ConnectionsTable';
const messagesTable = process.env.MESSAGES_TABLE || 'MessagesTable';
const websocketEndpoint = process.env.WEBSOCKET_ENDPOINT || 'https://j4a86rv3rd.execute-api.us-east-1.amazonaws.com/dev';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({ endpoint: websocketEndpoint });

export const handler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Handler entry with event: ${JSON.stringify(event)}`);
    const connectionId = event.requestContext.connectionId as any;

    let body;
    try {
        body = JSON.parse(event.body!);
    } catch (e) {
        console.error('Error decoding JSON:', e);
        await sendErrorResponse(connectionId, 'Invalid request format.');
        return;
    }

    const messageType = body.type;

    switch (messageType) {
        case 'ride_request':
            await handleRideRequest(body, connectionId);
            break;
        case 'chat_message':
            await handleChatMessage(body, connectionId);
            break;
        default:
            console.warn(`Unknown message type: ${messageType}`);
            await sendErrorResponse(connectionId, 'Unknown message type.');
    }
};

const handleRideRequest = async (message: any, connectionId: string) => {
    console.log(`handleRideRequest entry with message: ${JSON.stringify(message)}, connectionId: ${connectionId}`);
    const pickupLocation = message.pickup;

    if (!pickupLocation) {
        console.warn('Pickup location not provided in ride request.');
        await sendErrorResponse(connectionId, 'Pickup location missing.');
        return;
    }

    let latitude: number;
    let longitude: number;

    try {
        [latitude, longitude] = pickupLocation.split(',').map(Number);
    } catch (e) {
        console.warn('Invalid pickup location format.');
        await sendErrorResponse(connectionId, 'Invalid pickup location format.');
        return;
    }

    let geohashValue: string;
    try {
        geohashValue = geohash.encode(latitude, longitude, GEOHASH_PRECISION);
    } catch (e) {
        console.error('Error encoding geohash:', e);
        await sendErrorResponse(connectionId, 'Error processing location.');
        return;
    }

    const drivers = await queryDriversInGeohashRange(geohashValue);
    const driverConnections = await bulkQueryGeolocatedDriverConnections(drivers) as any;
    driverConnections.push({ connectionId });
    await notifyDrivers(driverConnections, message);
};

const bulkQueryGeolocatedDriverConnections = async (drivers: any[]) => {
    console.log(`bulkQueryGeolocatedDriverConnections entry with drivers: ${JSON.stringify(drivers)}`);

    if (drivers.length === 0) {
        console.warn('No drivers provided for bulk query.');
        return [];
    }

    const driverIds = drivers.map(driver => driver.driverId).filter(Boolean);

    if (driverIds.length === 0) {
        console.warn('No valid driver IDs found.');
        return [];
    }

    const connectionIds: string[] = [];

    for (const driverId of driverIds) {
        try {
            const response = await dynamodb.query({
                TableName: connectionsTable,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': driverId
                },
                ProjectionExpression: 'connectionId'
            }).promise();

            const items = response.Items || [];
            items.forEach(item => {
                if (item.connectionId) connectionIds.push(item.connectionId);
            });
        } catch (e) {
            console.error('Error querying connections table:', e);
        }
    }

    console.log(`Found connection IDs: ${connectionIds}`);
    return connectionIds;
};

const queryDriversInGeohashRange = async (geohashValue: string) => {
    console.log(`queryDriversInGeohashRange entry with geohashValue: ${geohashValue}`);
    try {
        const response = await dynamodb.query({
            TableName: driversTable,
            KeyConditionExpression: 'geohash = :geohash',
            ExpressionAttributeValues: {
                ':geohash': geohashValue
            }
        }).promise();

        console.log(`Query result: ${JSON.stringify(response)}`);
        return response.Items || [];
    } catch (e) {
        console.error('Error querying drivers table:', e);
        return [];
    }
};

const notifyDrivers = async (drivers: any[], message: any) => {
    console.log(`notifyDrivers entry with drivers: ${JSON.stringify(drivers)}, message: ${JSON.stringify(message)}`);
    for (const driver of drivers) {
        const connectionId = driver.connectionId;

        if (!connectionId) {
            console.warn('Driver missing connectionId.');
            continue;
        }

        try {
            await apigatewaymanagementapi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(message) }).promise();
            console.log(`Notification sent to driver ${connectionId}`);
        } catch (e) {
            if ((e as any).statusCode === 410) {
                console.warn(`Connection ${connectionId} is no longer valid.`);
            } else {
                console.error(`Error notifying driver ${connectionId}:`, e);
            }
        }
    }
};

const handleChatMessage = async (message: any, connectionId: string) => {
    console.log(`handleChatMessage entry with message: ${JSON.stringify(message)}, connectionId: ${connectionId}`);
    const recipientId = message.recipientId || message.userId;
    const text = message.text;

    if (!recipientId || !text) {
        console.warn('Recipient ID or message text missing in chat message.');
        await sendErrorResponse(connectionId, 'Recipient ID or message text missing.');
        return;
    }

    const recipientConnectionId = await getConnectionIdByUserId(recipientId);

    if (recipientConnectionId) {
        const chatMessage = {
            messageId: uuidv4(),
            senderConnectionId: connectionId,
            recipientConnectionId,
            message: text,
            timestamp: new Date().toISOString()
        };

        try {
            await dynamodb.put({
                TableName: messagesTable,
                Item: chatMessage
            }).promise();
            await apigatewaymanagementapi.postToConnection({ ConnectionId: recipientConnectionId, Data: JSON.stringify(chatMessage) }).promise();
            console.log(`Chat message sent to recipient ${recipientConnectionId}`);
        } catch (e) {
            if ((e as any).statusCode === 410) {
                console.warn(`Recipient connection ${recipientConnectionId} is no longer valid.`);
            } else {
                console.error('Error handling chat message:', e);
            }
        }
    } else {
        console.warn(`No connection found for recipient ${recipientId}.`);
        await sendErrorResponse(connectionId, 'Recipient is not connected.');
    }
};

const getConnectionIdByUserId = async (userId: string) => {
    console.log(`getConnectionIdByUserId entry with userId: ${userId}`);
    try {
        const response = await dynamodb.query({
            TableName: connectionsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = response.Items || [];
        if (items.length > 0) {
            const connectionId = items[0].connectionId;
            console.log(`Found connection ID: ${connectionId}`);
            return connectionId;
        }
    } catch (e) {
        console.error('Error querying connections table:', e);
    }

    console.log('getConnectionIdByUserId exit with no connection found');
    return null;
};

const sendErrorResponse = async (connectionId: string, errorMessage: string) => {
    console.log(`sendErrorResponse entry with connectionId: ${connectionId}, errorMessage: ${errorMessage}`);
    const errorResponse = {
        error: errorMessage
    };

    try {
        await apigatewaymanagementapi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(errorResponse) }).promise();
        console.log(`Error response sent to connection ${connectionId}`);
    } catch (e) {
        if ((e as any).statusCode === 410) {
            console.warn(`Connection ${connectionId} is no longer valid.`);
        } else {
            console.error('Error sending error response:', e);
        }
    }
};
