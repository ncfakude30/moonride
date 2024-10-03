import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const USERS_TABLE = process.env.USERS_TABLE || 'UsersTable';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Received event: ${JSON.stringify(JSON.parse(event.body || '{}'))}`);

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
            const { email, displayName, photoURL, id: userId } = body;

            // Validate required fields
            if (!userId || !email || !displayName || !photoURL) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Missing required fields' }),
                };
            }

            const response = await dynamodb.get({
                TableName: USERS_TABLE,
                Key: { userId },
            }).promise();

            if (response.Item) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ message: 'User already exists', success: true }),
                };
            }

            await dynamodb.put({
                TableName: USERS_TABLE,
                Item: {
                    userId,
                    email,
                    displayName,
                    photoURL,
                },
            }).promise();

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ message: 'User data stored successfully', success: true }),
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
