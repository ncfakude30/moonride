import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const PAYMENT_TABLE = process.env.PAYMENT_TABLE || 'PaymentsTable';
const OZOW_API_URL = process.env.OZOW_API_URL || 'https://api.ozow.com/payments/create';
const OZOW_SITE_CODE = process.env.OZOW_SITE_CODE || 'your_site_code';
const OZOW_API_KEY = process.env.OZOW_API_KEY || 'your_api_key';
const OZOW_SECRET = process.env.OZOW_SECRET || 'your_secret';
const SUCCESS_URL = process.env.SUCCESS_URL || 'https://www.moonride.co.za/success';
const CANCEL_URL = process.env.CANCEL_URL || 'https://www.moonride.co.za/cancel';
const NOTIFY_URL = process.env.NOTIFY_URL || 'https://www.moonride.co.za/notify';
const ERROR_URL = process.env.ERROR_URL || 'https://www.moonride.co.za/error';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Received event: ${JSON.stringify(event)}`);
    
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
            // Parse the incoming request body
            const body = JSON.parse(event.body || '{}');

            // Generate a unique paymentId
            const paymentId = uuidv4();

            // Get the current date and time for paymentDate
            const paymentDate = new Date().toISOString();  // ISO 8601 format

            // Prepare the payment data for Ozow
            const ozowPayload = {
                SiteCode: OZOW_SITE_CODE,
                CountryCode: 'ZA',
                CurrencyCode: 'ZAR',
                Amount: body.amount,
                TransactionReference: paymentId,
                BankReference: body.bankReference,
                Customer: {
                    FirstName: body.firstName,
                    LastName: body.lastName,
                    EmailAddress: body.email,
                },
                IsTest: false,
                SuccessUrl: SUCCESS_URL,
                ErrorUrl: ERROR_URL,
                CancelUrl: CANCEL_URL,
                NotifyUrl: NOTIFY_URL,
                Secret: OZOW_SECRET,
            };

            // Create the payment request to Ozow
            const response = await axios.post(OZOW_API_URL, ozowPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OZOW_API_KEY}`,
                },
            });

            const paymentUrl = response.data.PaymentUrl;

            // Store the payment record in DynamoDB
            const item = {
                paymentId,
                userId: body.userId,
                amount: body.amount,
                paymentUrl,
                paymentDate,
                status: 'PENDING',
            };

            await dynamodb.put({
                TableName: PAYMENT_TABLE,
                Item: item,
            }).promise();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'Payment successfully initiated',
                    paymentUrl,
                    paymentId,
                    status: 200,
                }),
            };
        } catch (error) {
            console.error(`Exception occurred: ${error}`);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Error initiating payment', error: (error as any).message }),
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
