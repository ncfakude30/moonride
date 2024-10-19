import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const DRIVER_SETTINGS_TABLE = process.env.DRIVER_SETTINGS_TABLE || 'DriverSettingsTable';

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
        const body = JSON.parse(event.body || '{}');
        const { userId, profile, carDetails, bankingDetails  } = body;

        const params = {
          TableName: DRIVER_SETTINGS_TABLE,
          Key: { userId },
          UpdateExpression:
            "SET profile = :profile, carDetails = :carDetails, bankingDetails = :bankingDetails",
          ExpressionAttributeValues: {
            ":profile": profile,
            ":carDetails": carDetails,
            ":bankingDetails": bankingDetails,
          },
          ReturnValues: "ALL_NEW",
        };

        try {
          const result = await dynamodb.update(params).promise();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "Settings updated", data: result.Attributes }),
          };
        } catch (error) {
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
