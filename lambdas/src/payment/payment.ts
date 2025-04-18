import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

const PAYMENT_TABLE = process.env.TRANSACTIONS_TABLE || 'TransactionsTable';
const OZOW_API_URL = process.env.OZOW_API_URL || 'https://api.ozow.com';
const OZOW_SITE_CODE = process.env.OZOW_SITE_CODE || 'NCF-NCF-001';
const OZOW_API_KEY = process.env.OZOW_API_KEY || '667a79c009bd458c866666d98d8b2a75';
const OZOW_PRIVATE_KEY = process.env.OZOW_PRIVATE_KEY || '9bc47fe01bbe475a9995a887dcb1e73a';
const OZOW_SECRET = process.env.OZOW_SECRET || '9bc47fe01bbe475a9995a887dcb1e73a';
const SUCCESS_URL = process.env.SUCCESS_URL || 'https://www.moonride.co.za/success';
const CANCEL_URL = process.env.CANCEL_URL || 'https://www.moonride.co.za/cancel';
const NOTIFY_URL = process.env.NOTIFY_URL || 'https://www.moonride.co.za/notify';
const ERROR_URL = process.env.ERROR_URL || 'https://www.moonride.co.za/error';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Received event: ${JSON.stringify(JSON.parse(event.body || '{}'))}`);
    
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

            let paymentResponse = null;

            switch(body.paymentGateway?.toLowerCase()) {
                case 'cash':
                    paymentResponse = await handleCashTransaction();
                    break;
                case 'ozow':
                    paymentResponse = await handleOzowTransaction(body, paymentId);
                    break;
                default:
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ message: `Unsupported payment option for transaction: ${paymentId}, Payment gateway: ${JSON.stringify(body.paymentGateway)}`}),
                    };
            }
            
            if (!paymentResponse?.paymentRequestId || !paymentResponse?.url) {
                throw new Error('Failed to initiate payment');
            }

            // Store the payment record in DynamoDB
            const item = {
                transactionId: paymentId,
                paymentId,
                userId: body.userId,
                amount: String(body.amount),
                paymentUrl: paymentResponse?.url,
                paymentRequestId: paymentResponse?.paymentRequestId,
                paymentDate,
                status: 'PENDING',
                vendorId: body?.vendorId || 'vendor',
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
                    paymentUrl: paymentResponse?.url,
                    paymentId,
                    status: 200,
                }),
            };
        } catch (error) {
            console.error(`Exception occurred: ${error}`);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Error initiating payment', error: (error as any)?.message }),
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

async function handleCashTransaction(): Promise<any> {
    return { paymentRequestId: uuidv4(), url: 'cash' };
}

async function handleOzowTransaction(body: any, paymentId: string): Promise<any> {
    // Prepare the payment data for Ozow
    const ozowPayload = getPayload(
        body.amount,
        paymentId,
        body.bankReference
    );
    const hashCheck = generateHashCheck(ozowPayload);
    const { paymentRequestId, url } = await initTransaction({...ozowPayload, hashCheck});
    return { paymentRequestId, url };
}

async function initTransaction(payment: any): Promise<{ paymentRequestId: string; url: string }> {
    console.log(`Attempting to request a new payment url from Ozow: ${JSON.stringify(payment)}`);

    try {
        const response = await axios.post(`${OZOW_API_URL}/PostPaymentRequest`, payment, {
            headers: {
                'Accept': 'application/json',
                'ApiKey': OZOW_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        console.log(`Response from Ozow: ${JSON.stringify(response?.data)}`);

        const responseData = response.data;

        if (responseData.errorMessage) {
            console.error(`Error response from Ozow for paymentId: ${payment.transactionReference}, ${responseData.errorMessage}`);
            throw new Error(responseData.errorMessage);
        }

        console.log(`Response from Ozow 2: ${JSON.stringify(responseData)}`);
        return {
            paymentRequestId: responseData.paymentRequestId,
            url: responseData.url,
        };
    } catch (error) {
        console.error(error);
        console.error(`Error while making request to Ozow: `, error);
        throw error;
    }
}

function getExpiryDateUTC(limit: number): string {
    const currentDateUTC = new Date();
    currentDateUTC.setUTCMinutes(currentDateUTC.getUTCMinutes() + limit);
    const formattedDateTimeUTC = currentDateUTC.toISOString().slice(0, 16).replace('T', ' ');
    return formattedDateTimeUTC;
}

function generateHashCheck(payload: any): string {
    const hashSequence = [
        'siteCode',
        'countryCode',
        'currencyCode',
        'amount',
        'transactionReference',
        'bankReference',
        'customer',
        'cancelUrl',
        'errorUrl',
        'successUrl',
        'notifyUrl',
        'isTest',
        'selectedBankId',
        'expiryDateUtc',
        'CustomerIdentifier'
    ];

    const inputString = hashSequence.reduce((str, key) => `${str}${payload[key]?.toString() || ''}`, '').concat(OZOW_PRIVATE_KEY).toLowerCase();

    console.log(`inputString: ${inputString}`);
    return crypto.createHash('sha512')
                        .update(inputString)
                        .digest("hex");
}

function getPayload(amount: number, transactionReference: string, bankReference: string): any {
    const payload: any = {
        siteCode: OZOW_SITE_CODE,
        countryCode: 'ZA',
        currencyCode: 'ZAR',
        customer: '',
        amount,
        transactionReference,
        bankReference,
        cancelUrl: CANCEL_URL,
        errorUrl: ERROR_URL,
        successUrl: SUCCESS_URL,
        notifyUrl: NOTIFY_URL,
        isTest: false,
        expiryDateUtc: getExpiryDateUTC(15),
        allowVariableAmount: false,
        CustomerIdentifier: '9407205736083'
    };
    return payload;
}
