import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const TRIP_TABLE = process.env.TRIP_TABLE || 'TripsTable';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Received event: ${JSON.stringify(event)}`);

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };

    if (event.httpMethod === 'OPTIONS') {
        // Handle CORS preflight requests
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' }),
        };
    }

    if (event.httpMethod === 'POST') {
        try {
            // Parse the incoming request body
            const body = JSON.parse(event.body || '{}');

            // Generate a unique tripId
            const tripId = uuidv4();

            // Get the current date and time for tripDate
            const tripDate = new Date().toISOString();  // ISO 8601 format

            // Construct the item to be added to DynamoDB
            const item = {
                tripId,
                userId: body.userId,
                pickup: body.pickup,
                dropoff: body.dropoff,
                price: body.price,
                time: body.time,
                rating: body.rating,
                driverProfile: body.driverProfile,
                pickupName: body.pickupName,
                dropoffName: body.dropoffName,
                tripDate,
                pickupCoordinates: body.pickupCoordinates,
                dropoffCoordinates: body.dropoffCoordinates,
            };

            // Add the item to DynamoDB
            await dynamodb.put({
                TableName: TRIP_TABLE,
                Item: item,
            }).promise();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'Trip successfully added',
                    tripId,
                    status: 200,
                }),
            };
        } catch (error) {
            console.error(`Exception occurred: ${error}`);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Error adding trip', error: error.message }),
            };
        }
    } else {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
};
