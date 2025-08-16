import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as geohash from 'ngeohash';

const DRIVERS_TABLE = process.env.DRIVERS_TABLE || 'DriversTable';
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || 'ConnectionsTable';
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT || 'https://j4a86rv3rd.execute-api.us-east-1.amazonaws.com/dev';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({ endpoint: WEBSOCKET_ENDPOINT });

interface DriverLocation {
    driverId: string;
    lat: number;
    lng: number;
    isOnline: boolean;
    connectionId?: string;
}

interface RideRequest {
    requestId: string;
    riderId: string;
    pickup: { lat: number; lng: number };
    dropoff: { lat: number; lng: number };
    fare: number;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' }),
        };
    }

    if (event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body || '{}');
            const { type } = body;

            switch (type) {
                case 'find_drivers':
                    return await findNearbyDrivers(body, headers);
                case 'notify_drivers':
                    return await notifyDriversOfRequest(body, headers);
                case 'accept_ride':
                    return await handleRideAcceptance(body, headers);
                default:
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ message: 'Invalid request type' }),
                    };
            }
        } catch (error) {
            console.error('Error in driver matching:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Internal server error' }),
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' }),
    };
};

async function findNearbyDrivers(body: any, headers: any): Promise<APIGatewayProxyResult> {
    const { pickup, radius = 5 } = body;
    
    if (!pickup || !pickup.lat || !pickup.lng) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Pickup location is required' }),
        };
    }

    try {
        // Generate geohash for the pickup location
        const pickupGeohash = geohash.encode(pickup.lat, pickup.lng, 6);
        
        // Find nearby drivers using geohash
        const nearbyDrivers = await findDriversInRadius(pickup, radius);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                drivers: nearbyDrivers,
                count: nearbyDrivers.length
            }),
        };
    } catch (error) {
        console.error('Error finding nearby drivers:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Error finding drivers' }),
        };
    }
}

async function notifyDriversOfRequest(body: any, headers: any): Promise<APIGatewayProxyResult> {
    const { rideRequest, driverIds } = body;
    
    if (!rideRequest || !driverIds || !Array.isArray(driverIds)) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Invalid request data' }),
        };
    }

    try {
        const notificationPromises = driverIds.map(async (driverId: string) => {
            try {
                // Get driver's connection ID
                const connectionResponse = await dynamodb.query({
                    TableName: CONNECTIONS_TABLE,
                    KeyConditionExpression: 'userId = :userId',
                    ExpressionAttributeValues: {
                        ':userId': driverId
                    }
                }).promise();

                if (connectionResponse.Items && connectionResponse.Items.length > 0) {
                    const connectionId = connectionResponse.Items[0].connectionId;
                    
                    // Send ride request notification
                    await apigatewaymanagementapi.postToConnection({
                        ConnectionId: connectionId,
                        Data: JSON.stringify({
                            type: 'ride_request',
                            data: rideRequest
                        })
                    }).promise();
                    
                    return { driverId, status: 'sent' };
                } else {
                    return { driverId, status: 'offline' };
                }
            } catch (error) {
                console.error(`Error notifying driver ${driverId}:`, error);
                return { driverId, status: 'error' };
            }
        });

        const results = await Promise.all(notificationPromises);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Notifications sent',
                results
            }),
        };
    } catch (error) {
        console.error('Error notifying drivers:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Error sending notifications' }),
        };
    }
}

async function handleRideAcceptance(body: any, headers: any): Promise<APIGatewayProxyResult> {
    const { driverId, requestId, riderConnectionId } = body;
    
    if (!driverId || !requestId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Driver ID and request ID are required' }),
        };
    }

    try {
        // Notify the rider that their request was accepted
        if (riderConnectionId) {
            await apigatewaymanagementapi.postToConnection({
                ConnectionId: riderConnectionId,
                Data: JSON.stringify({
                    type: 'ride_accepted',
                    data: {
                        driverId,
                        requestId,
                        message: 'Your ride has been accepted!'
                    }
                })
            }).promise();
        }

        // Update ride status in database
        // This would typically update a rides table with the matched driver
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Ride acceptance processed',
                driverId,
                requestId
            }),
        };
    } catch (error) {
        console.error('Error handling ride acceptance:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Error processing ride acceptance' }),
        };
    }
}

async function findDriversInRadius(center: { lat: number; lng: number }, radiusKm: number): Promise<DriverLocation[]> {
    // Generate multiple geohashes to cover the radius
    const geohashes = generateGeohashesInRadius(center, radiusKm);
    const drivers: DriverLocation[] = [];

    for (const hash of geohashes) {
        try {
            const response = await dynamodb.query({
                TableName: DRIVERS_TABLE,
                KeyConditionExpression: 'geohash = :geohash',
                ExpressionAttributeValues: {
                    ':geohash': hash
                }
            }).promise();

            if (response.Items) {
                response.Items.forEach(item => {
                    const distance = calculateDistance(
                        center.lat, center.lng,
                        item.lat, item.lng
                    );
                    
                    if (distance <= radiusKm && item.isOnline) {
                        drivers.push({
                            driverId: item.driverId,
                            lat: item.lat,
                            lng: item.lng,
                            isOnline: item.isOnline,
                            connectionId: item.connectionId
                        });
                    }
                });
            }
        } catch (error) {
            console.error(`Error querying geohash ${hash}:`, error);
        }
    }

    // Sort by distance and return closest drivers
    return drivers
        .map(driver => ({
            ...driver,
            distance: calculateDistance(center.lat, center.lng, driver.lat, driver.lng)
        }))
        .sort((a, b) => (a as any).distance - (b as any).distance)
        .slice(0, 10); // Return top 10 closest drivers
}

function generateGeohashesInRadius(center: { lat: number; lng: number }, radiusKm: number): string[] {
    // Simple implementation - generate geohashes in a grid around the center
    const precision = 6;
    const centerHash = geohash.encode(center.lat, center.lng, precision);
    const neighbors = geohash.neighbors(centerHash);
    
    return [centerHash, ...neighbors];
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