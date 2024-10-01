import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

// Environment variables
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || 'ConnectionsTable';
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT || 'YOUR_WEBSOCKET_ENDPOINT';

// Initialize DynamoDB DocumentClient and API Gateway Management API
const dynamodb = new AWS.DynamoDB.DocumentClient();
const connectionsTable = CONNECTIONS_TABLE;
const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({ endpoint: WEBSOCKET_ENDPOINT });

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Received event: ${JSON.stringify(event)}`);
    const connectionId = event.requestContext.connectionId;

    // Delete the connection from DynamoDB
    await deleteConnection(connectionId as string);

    return {
        statusCode: 200,
        body: 'Disconnected successfully.',
    };
};

const deleteConnection = async (connectionId: string): Promise<void> => {
    try {
        await dynamodb.delete({
            TableName: connectionsTable,
            Key: {
                connectionId,
            },
        }).promise();
        console.log(`Successfully deleted connection ${connectionId}`);
    } catch (error) {
        console.error(`Error deleting connection ${connectionId}:`, error);
    }
};
