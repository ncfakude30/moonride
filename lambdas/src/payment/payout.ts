import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PAYMENT_TABLE = process.env.TRANSACTIONS_TABLE || 'TransactionsTable';
const OZOW_API_URL = process.env.OZOW_API_URL || 'https://stagingpayoutsapi.ozow.com/mock';
const OZOW_SITE_CODE = process.env.OZOW_SITE_CODE || 'NCF-NCF-001';
const OZOW_API_KEY = process.env.OZOW_API_KEY || '667a79c009bd458c866666d98d8b2a75';
const OZOW_PRIVATE_KEY = process.env.OZOW_PRIVATE_KEY || '9bc47fe01bbe475a9995a887dcb1e73a';
const OZOW_SECRET = process.env.OZOW_SECRET || '9bc47fe01bbe475a...';

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
        return submitPayoutRequest(event, headers);
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' }),
    };
}
        
// Helper function to calculate SHA512 hash
function getSha512Hash(input: string): string {
    return crypto.createHash('sha512').update(input, 'utf8').digest('hex');
}

// AES-256-CBC encryption for bank account number
function encryptAccountNumber(accountNumber: string, encryptionKey: string, ivString: string): string {
    const key = crypto.scryptSync(encryptionKey, 'salt', 32); // Generate key from encryptionKey
    const iv = Buffer.from(getSha512Hash(ivString).substring(0, 16), 'utf8'); // Get first 16 bytes of IV

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(accountNumber, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return encrypted;
}

// Generate payout hash check as per Ozow's API documentation
function generatePayoutRequestHash(
    siteCode: string,
    amount: number,
    merchantReference: string,
    customerBankReference: string,
    isRtc: boolean,
    notifyUrl: string,
    bankGroupId: string,
    accountNumber: string,
    branchCode: string,
    apiKey: string
): string {
    const inputString = [
        siteCode,
        Math.round(amount * 100),
        merchantReference,
        customerBankReference,
        isRtc,
        notifyUrl,
        bankGroupId,
        accountNumber,
        branchCode,
        apiKey
    ].join('').toLowerCase();

    return getSha512Hash(inputString);
}

// Function to handle the payout request
const submitPayoutRequest = async (event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> => {
    try {
        const body = JSON.parse(event.body || '{}');
        const { amount, customerBankReference, bankGroupId, accountNumber, branchCode, notifyUrl, isRtc } = body;

        // Validate input parameters
        if (!amount || !customerBankReference || !bankGroupId || !accountNumber || !branchCode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid input parameters' }),
            };
        }

        // Generate unique references
        const merchantReference = uuidv4();

        // Encrypt account number using AES-256-CBC
        const ivString = merchantReference + Math.round(amount * 100) + OZOW_PRIVATE_KEY;
        const encryptedAccountNumber = encryptAccountNumber(accountNumber, OZOW_PRIVATE_KEY, ivString);

        // Generate the hash check for the payout request
        const hashCheck = generatePayoutRequestHash(
            OZOW_SITE_CODE,
            amount,
            merchantReference,
            customerBankReference,
            isRtc,
            notifyUrl || '',
            bankGroupId,
            encryptedAccountNumber,
            branchCode,
            OZOW_API_KEY
        );

        // Payout request payload
        const payoutPayload = {
            SiteCode: OZOW_SITE_CODE,
            Amount: amount,
            MerchantReference: merchantReference,
            CustomerBankReference: customerBankReference,
            IsRtc: isRtc || false, // Set to false if not provided
            NotifyUrl: notifyUrl || '',
            BankingDetails: {
                BankGroupId: bankGroupId,
                AccountNumber: encryptedAccountNumber,
                BranchCode: branchCode,
            },
            HashCheck: hashCheck,
        };

        // Make the payout request to Ozow API
        const response = await axios.post(`${OZOW_API_URL}/requestpayout`, payoutPayload, {
            headers: {
                'ApiKey': OZOW_API_KEY,
                'SiteCode': OZOW_SITE_CODE,
                'Content-Type': 'application/json',
            },
        });

        const { data } = response;

        // Save the payout request in DynamoDB for tracking purposes
        await dynamoDB.put({
            TableName: PAYMENT_TABLE,
            Item: {
                id: merchantReference,
                amount,
                customerBankReference,
                bankGroupId,
                branchCode,
                status: data.payoutStatus.status,
                subStatus: data.payoutStatus.subStatus,
                payoutId: data.payoutId,
                timestamp: new Date().toISOString(),
            },
        }).promise();

        // Return the successful response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Payout request submitted successfully',
                payoutId: data.payoutId,
                payoutStatus: data.payoutStatus,
            }),
        };
    } catch (error) {
        console.error('Error submitting payout request:', error);

        // Return error response
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Failed to submit payout request',
                error: (error as any).message || 'Unknown error',
            }),
        };
    }
};
