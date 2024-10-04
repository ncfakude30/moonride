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

            // Step 1: Validate the hash
            const isValidHash = validateHash(body);
            if (!isValidHash) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Invalid hash check' }),
                };
            }

            // Step 2: Extract transaction details from the notification
            const { TransactionReference, Status } = body;
            
            if (!TransactionReference || !Status) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Missing required fields in notification' }),
                };
            }

            // Step 3: Update the payment status in DynamoDB
            await updatePaymentStatus(TransactionReference, Status);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: `Payment status updated for transaction ${TransactionReference}` }),
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

// Step 1: Validate the hash received from Ozow
function validateHash(body: Record<string, string>): boolean {
    const hashSequence = [
        body.SiteCode,
        body.TransactionId,
        body.TransactionReference,
        body.Amount,
        body.Status,
        body.Optional1 || '',
        body.Optional2 || '',
        body.Optional3 || '',
        body.Optional4 || '',
        body.Optional5 || '',
        body.CurrencyCode,
        body.IsTest?.toString() || 'false', // Ensure this is a string
        body.StatusMessage || ''
    ];

    const inputString = hashSequence.join('').concat(OZOW_PRIVATE_KEY).toLowerCase();
    const calculatedHash = crypto.createHash('sha512').update(inputString).digest('hex');

    console.log('Calculated hash:', calculatedHash);
    console.log('Received hash:', body.Hash);

    return calculatedHash === body.Hash;
}

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
            ':status': status?.toUpperCase()
        },
        ReturnValues: 'UPDATED_NEW'
    };

    await dynamodb.update(params).promise();
    console.log(`Updated transaction ${transactionReference} to status: ${status}`);
}
