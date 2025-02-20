import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

const ordersTable = process.env.ORDERS_TABLE || 'OrdersTable';
const dynamodb = new AWS.DynamoDB.DocumentClient();

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

  const { vendorId, userId, product, price } = body;
  if (!vendorId || !userId || !product || price === undefined) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Missing required fields: vendorId, userId, product, and price are required' }),
    };
  }

  try {
    const orderId = `${userId}-${Date.now()}`;
    const orderItem = {
      orderId,
      vendorId,
      userId,
      product,
      price,
      orderDate: new Date().toISOString(),
      status: 'pending',
    };

    await dynamodb.put({ TableName: ordersTable, Item: orderItem }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Order created successfully', order: orderItem }),
    };
  } catch (error) {
    console.error(`Error in order creation lambda: ${error}`);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Error creating order',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
