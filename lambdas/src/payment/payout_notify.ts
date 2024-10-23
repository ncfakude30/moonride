import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';
import querystring from 'querystring'; // Import the querystring module

const PAYMENT_TABLE = process.env.TRANSACTIONS_TABLE || 'TransactionsTable';
const OZOW_PRIVATE_KEY = process.env.OZOW_PRIVATE_KEY || '9bc47fe01bbe475a9995a887dcb1e73a';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' }),
        };
    }

    if (event.httpMethod === 'POST') {
        try {
            // Parse the body from x-www-form-urlencoded format
            const body = querystring.parse(event.body || '') as Record<string, string>;
            console.log('Parsed notification:', body);

            const payload: OzowPayoutNotification = JSON.parse(event.body || '{}');
  
            // Validate the hash
            if (!validateOzowHash(payload)) {
                return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Invalid hash check' }),
                };
            }

            // Process the payout notification (e.g., update the database, log the payout status)
            const { PayoutId, PayoutStatus } = payload;

            // Logic to update the payout status in your system
            console.log(`Payout ${PayoutId} has status ${PayoutStatus}`);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Payout status received and processed' }),
            };

        } catch (error) {
            console.error('Error processing notification:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Error processing payment notification', error: (error as any).message }),
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

interface OzowPayoutNotification {
    PayoutId: string;
    SiteCode: string;
    MerchantReference: string;
    CustomerMerchantReference: string;
    PayoutStatus: string; // or an enum for more clarity
    HashCheck: string;
  }

// Step 1: Validate the hash received from Ozow
const validateOzowHash = (payload: OzowPayoutNotification): boolean => {
  const { PayoutId, SiteCode, MerchantReference, CustomerMerchantReference, PayoutStatus, HashCheck } = payload;

  // Concatenate the required fields to create the string for the hash
  const inputString = `${PayoutId}${SiteCode}${MerchantReference}${CustomerMerchantReference}${PayoutStatus}${OZOW_PRIVATE_KEY}`;
  
  // Generate SHA512 hash
  const generatedHash = crypto.createHash('sha512').update(inputString.toLowerCase()).digest('hex');
  
  // Compare the generated hash with the one received from Ozow
  return generatedHash === HashCheck;
};

// Step 3: Update the payment status in DynamoDB
async function updatePaymentStatus(transactionReference: string, status: string): Promise<void> {
    const params = {
        TableName: PAYMENT_TABLE,
        Key: {
            transactionId: transactionReference
        },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':status': status
        },
        ReturnValues: 'UPDATED_NEW'
    };

    await dynamodb.update(params).promise();
    console.log(`Updated transaction ${transactionReference} to status: ${status}`);
}
