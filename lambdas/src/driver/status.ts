import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const USERS_TABLE = process.env.USERS_TABLE || 'UsersTable';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',  // Allow requests from any origin
        'Access-Control-Allow-Methods': 'OPTIONS,POST',  // Allow POST and OPTIONS methods
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',  // Allow specific headers
        'Access-Control-Allow-Credentials': 'true'
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
            const body = JSON.parse(event.body || '{}');
            const { userId, status } = body;

            // Validate required fields
            if (!userId || typeof status !== 'boolean') {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Missing or invalid required fields' }),
                };
            }

            // Check if the user exists
            const userResponse = await dynamodb.get({
                TableName: USERS_TABLE,
                Key: { userId },
            }).promise();

            if (!userResponse.Item) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ message: 'User not found' }),
                };
            }

            // Update the user's status in the table
            await dynamodb.update({
                TableName: USERS_TABLE,
                Key: { userId },
                UpdateExpression: 'set onlineStatus = :status',
                ExpressionAttributeValues: {
                    ':status': status,
                },
            }).promise();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'User status updated successfully', success: true }),
            };
        } catch (error: unknown) {
            // Handle errors
            if (error instanceof SyntaxError) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Invalid JSON format' }),
                };
            } else if (error instanceof Error) {
                console.error(`Exception: ${error.message}`);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ message: `Internal server error: ${error.message}` }),
                };
            } else {
                console.error(`Unknown error: ${error}`);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ message: 'An unknown error occurred' }),
                };
            }
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' }),
    };
};
