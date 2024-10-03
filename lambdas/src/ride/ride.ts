import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const RECENT_TRIPS_TABLE = process.env.RECENT_TRIPS_TABLE || 'TripsTable';
const PAGE_LIMIT = Number(process.env.PAGE_LIMIT) || 5;  // Ensure PAGE_LIMIT is an integer

const dynamodb = new AWS.DynamoDB.DocumentClient();

const decimalToFloat = (obj: any) => {
    if (typeof obj === 'number') return obj;
    throw new TypeError("Object of type Decimal is not JSON serializable");
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Received event: ${JSON.stringify(JSON.parse(event.body || '{}'))}`);
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',  // Allow requests from any origin
        'Access-Control-Allow-Methods': 'OPTIONS,GET',  // Allow GET and OPTIONS methods
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',  // Allow specific headers
        'Access-Control-Allow-Credentials': 'true'
    };
    

    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' }),
        };
    }

    // Handle GET requests
    if (event.httpMethod === 'GET') {
        try {
            const userId = event.queryStringParameters?.userId;
            if (!userId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'userId parameter is required' }),
                };
            }

            const limit = Number(event.queryStringParameters?.limit) || PAGE_LIMIT;
            const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey ? JSON.parse(event.queryStringParameters.lastEvaluatedKey) : undefined;

            const table = RECENT_TRIPS_TABLE;

            // Building the query parameters
            const queryParams: AWS.DynamoDB.DocumentClient.QueryInput = {
                TableName: table,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
                Limit: limit,
            };

            // Add the ExclusiveStartKey if pagination is being used
            if (lastEvaluatedKey) {
                queryParams.ExclusiveStartKey = lastEvaluatedKey;
            }

            // Query the DynamoDB table
            const response = await dynamodb.query(queryParams).promise();

            // Prepare the result with pagination information
            const result = {
                trips: response.Items?.map(item => {
                    return {
                        ...item,
                        // You may handle any additional decimal to float conversion here if needed
                    };
                }) || [],
            } as any;

            // If there are more items to be fetched, include the LastEvaluatedKey
            if (response.LastEvaluatedKey) {
                result['lastEvaluatedKey'] = JSON.stringify(response.LastEvaluatedKey);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result),
            };
        } catch (error) {
            console.error(`Exception occurred: ${error}`);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Error fetching trips', error: (error as Error).message }),
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
