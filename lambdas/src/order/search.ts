import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import { Configuration, OpenAIApi } from 'openai';

// CORS headers
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

const vendorsTable = process.env.VENDORS_TABLE || 'VendorsTable';

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Initialize OpenAI API client using your environment variable
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  // Parse the request body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Invalid JSON in request body' }),
    };
  }

  const { query } = body;
  if (!query) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Query parameter is required' }),
    };
  }

  try {
    // Use OpenAI to refine the search query
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Refine this search query for vendors: "${query}"`,
      max_tokens: 50,
      temperature: 0.7,
    });
    const refinedQuery = completion.data.choices[0].text.trim();

    // Search the vendors table for items whose name or description contains the refined query.
    // Adjust the FilterExpression as per your table schema.
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: vendorsTable,
      FilterExpression: 'contains(#name, :q) OR contains(description, :q)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':q': refinedQuery,
      },
    };

    const result = await dynamodb.scan(params).promise();
    const vendors = result.Items || [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ refinedQuery, vendors }),
    };
  } catch (error) {
    console.error(`Error in vendor search lambda: ${error}`);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Error processing search',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
