import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const DRIVER_SETTINGS_TABLE = process.env.DRIVER_SETTINGS_TABLE || 'DriverSettingsTable';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',  // Allow requests from any origin
      'Access-Control-Allow-Methods': 'OPTIONS,GET',  // Allow POST and OPTIONS methods
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

  if (event.httpMethod === 'GET') {
    try{
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
        TableName: DRIVER_SETTINGS_TABLE,
        Key: { userId },
    }).promise();

    // Check if the user exists
    if (!response.Item) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Settings not found' }),
        };
    }

    // Return the user data
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.Item),
    };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'failed' }),
          };
        }
      }

  return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
  };
};
