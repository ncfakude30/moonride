import { APIGatewayEvent, Context } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as geohash from 'ngeohash';

const DRIVERS_TABLE = process.env.DRIVERS_TABLE || 'DriversTable';
const TRIPS_TABLE = process.env.TRIPS_TABLE || 'TripsTable';
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || 'ConnectionsTable';
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT || 'https://j4a86rv3rd.execute-api.us-east-1.amazonaws.com/dev';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({ endpoint: WEBSOCKET_ENDPOINT });

export const handler = async (event: APIGatewayEvent, context: Context) => {
    const connectionId = event.requestContext.connectionId;
    
    try {
        const body = JSON.parse(event.body || '{}');
        const { type } = body;

        switch (type) {
            case 'driver_location_update':
                return await handleDriverLocationUpdate(body, connectionId);
            case 'track_driver':
                return await handleTrackDriverRequest(body, connectionId);
            case 'trip_status_update':
                return await handleTripStatusUpdate(body, connectionId);
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Unknown message type' })
                };
        }
    } catch (error) {
        console.error('Error in real-time tracking:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};

async function handleDriverLocationUpdate(body: any, connectionId: string) {
    const { driverId, location } = body;
    
    if (!driverId || !location || !location.lat || !location.lng) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid location data' })
        };
    }

    try {
        // Generate geohash for the location
        const locationGeohash = geohash.encode(location.lat, location.lng, 6);
        
        // Update driver location in DynamoDB
        await dynamodb.put({
            TableName: DRIVERS_TABLE,
            Item: {
                geohash: locationGeohash,
                driverId,
                lat: location.lat,
                lng: location.lng,
                heading: location.heading || 0,
                timestamp: new Date().toISOString(),
                isOnline: true,
                connectionId
            }
        }).promise();

        // Find active trips for this driver
        const tripsResponse = await dynamodb.query({
            TableName: TRIPS_TABLE,
            IndexName: 'DriverIndex', // Assuming you have a GSI on driverId
            KeyConditionExpression: 'driverId = :driverId',
            FilterExpression: '#status IN (:active, :enroute)',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':driverId': driverId,
                ':active': 'active',
                ':enroute': 'en_route'
            }
        }).promise();

        // Notify riders tracking this driver
        if (tripsResponse.Items && tripsResponse.Items.length > 0) {
            const notificationPromises = tripsResponse.Items.map(async (trip) => {
                try {
                    // Get rider's connection ID
                    const riderConnectionResponse = await dynamodb.query({
                        TableName: CONNECTIONS_TABLE,
                        KeyConditionExpression: 'userId = :userId',
                        ExpressionAttributeValues: {
                            ':userId': trip.userId
                        }
                    }).promise();

                    if (riderConnectionResponse.Items && riderConnectionResponse.Items.length > 0) {
                        const riderConnectionId = riderConnectionResponse.Items[0].connectionId;
                        
                        // Send location update to rider
                        await apigatewaymanagementapi.postToConnection({
                            ConnectionId: riderConnectionId,
                            Data: JSON.stringify({
                                type: 'driver_location_update',
                                data: {
                                    driverId,
                                    location,
                                    tripId: trip.tripId,
                                    estimatedArrival: calculateETA(location, trip.pickupCoordinates)
                                }
                            })
                        }).promise();
                    }
                } catch (error) {
                    console.error(`Error notifying rider for trip ${trip.tripId}:`, error);
                }
            });

            await Promise.all(notificationPromises);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Location updated successfully' })
        };
    } catch (error) {
        console.error('Error updating driver location:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error updating location' })
        };
    }
}

async function handleTrackDriverRequest(body: any, connectionId: string) {
    const { tripId, driverId } = body;
    
    if (!tripId || !driverId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Trip ID and Driver ID are required' })
        };
    }

    try {
        // Get current driver location
        const driverResponse = await dynamodb.query({
            TableName: DRIVERS_TABLE,
            KeyConditionExpression: 'driverId = :driverId',
            ExpressionAttributeValues: {
                ':driverId': driverId
            },
            ScanIndexForward: false,
            Limit: 1
        }).promise();

        if (driverResponse.Items && driverResponse.Items.length > 0) {
            const driverLocation = driverResponse.Items[0];
            
            // Send current location to rider
            await apigatewaymanagementapi.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify({
                    type: 'driver_location_update',
                    data: {
                        driverId,
                        location: {
                            lat: driverLocation.lat,
                            lng: driverLocation.lng,
                            heading: driverLocation.heading
                        },
                        tripId,
                        timestamp: driverLocation.timestamp
                    }
                })
            }).promise();
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Tracking started' })
        };
    } catch (error) {
        console.error('Error starting driver tracking:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error starting tracking' })
        };
    }
}

async function handleTripStatusUpdate(body: any, connectionId: string) {
    const { tripId, status, driverId, userId } = body;
    
    if (!tripId || !status) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Trip ID and status are required' })
        };
    }

    try {
        // Update trip status in database
        await dynamodb.update({
            TableName: TRIPS_TABLE,
            Key: { tripId },
            UpdateExpression: 'SET #status = :status, updatedAt = :timestamp',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':timestamp': new Date().toISOString()
            }
        }).promise();

        // Notify both driver and rider of status change
        const notificationPromises = [];

        if (driverId) {
            const driverConnectionResponse = await dynamodb.query({
                TableName: CONNECTIONS_TABLE,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': driverId
                }
            }).promise();

            if (driverConnectionResponse.Items && driverConnectionResponse.Items.length > 0) {
                const driverConnectionId = driverConnectionResponse.Items[0].connectionId;
                notificationPromises.push(
                    apigatewaymanagementapi.postToConnection({
                        ConnectionId: driverConnectionId,
                        Data: JSON.stringify({
                            type: 'trip_status_update',
                            data: { tripId, status }
                        })
                    }).promise()
                );
            }
        }

        if (userId) {
            const riderConnectionResponse = await dynamodb.query({
                TableName: CONNECTIONS_TABLE,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            }).promise();

            if (riderConnectionResponse.Items && riderConnectionResponse.Items.length > 0) {
                const riderConnectionId = riderConnectionResponse.Items[0].connectionId;
                notificationPromises.push(
                    apigatewaymanagementapi.postToConnection({
                        ConnectionId: riderConnectionId,
                        Data: JSON.stringify({
                            type: 'trip_status_update',
                            data: { tripId, status }
                        })
                    }).promise()
                );
            }
        }

        await Promise.all(notificationPromises);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Trip status updated' })
        };
    } catch (error) {
        console.error('Error updating trip status:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error updating trip status' })
        };
    }
}

function calculateETA(driverLocation: any, destination: any): number {
    if (!destination || !destination.lat || !destination.lng) {
        return 0;
    }

    // Simple distance calculation (in reality, you'd use routing API)
    const distance = calculateDistance(
        driverLocation.lat, driverLocation.lng,
        destination.lat, destination.lng
    );

    // Assume average speed of 30 km/h in city traffic
    const averageSpeed = 30;
    const etaMinutes = Math.round((distance / averageSpeed) * 60);
    
    return Math.max(1, etaMinutes); // Minimum 1 minute
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}