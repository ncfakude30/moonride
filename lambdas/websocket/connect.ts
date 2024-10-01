import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

// Environment variable
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || 'ConnectionsTable';

// Initialize DynamoDB DocumentClient
const dynamodb = new AWS.DynamoDB.DocumentClient();
const connectionsTable = CONNECTIONS_TABLE;

export const lambdaHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const connectionId = event.requestContext.connectionId;
    console.log(`New connection: ${connectionId}`);

    // Extract additional information if available (e.g., userId)
    const queryStringParameters = event.queryStringParameters || {};
    const userId = queryStringParameters.userId;  // Assuming the client sends userId as a query parameter

    // Store the connection details in DynamoDB
    const connectionItem = {
        connectionId,
        userId,  // Store userId if available
        connectedAt: event.requestContext.connectedAt,  // Time of connection
    };

    try {
        // Save the connection in DynamoDB
        await dynamodb.put({
            TableName: connectionsTable,
            Item: connectionItem,
        }).promise();

        return {
            statusCode: 200,
            body: 'Connected successfully.',
        };
    } catch (error) {
        console.error('Error saving connection:', error);
        return {
            statusCode: 500,
            body: 'Failed to connect.',
        };
    }
};
