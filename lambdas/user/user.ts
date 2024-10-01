import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

// Environment variable
const USERS_TABLE = process.env.USERS_TABLE || 'UsersTable';

// Initialize DynamoDB DocumentClient
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',  // Allow requests from any origin
        'Access-Control-Allow-Methods': 'OPTIONS,GET',  // Allow specific HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        // Handle CORS preflight requests
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' }),
        };
    }

    if (event.httpMethod === 'GET') {
        try {
            // Retrieve userId from query parameters
            const userId = event.queryStringParameters?.userId;

            // Validate userId
            if (!userId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Missing userId parameter' }),
                };
            }

            // Query the DynamoDB table
            const response = await dynamodb.get({
                TableName: USERS_TABLE,
                Key: { userId },
            }).promise();

            // Check if the user exists
            if (!response.Item) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ message: 'User not found' }),
                };
            }

            // Return the user data
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(response.Item),
            };
        } catch (error) {
            console.error('Error retrieving user data:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Internal server error' }),
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
