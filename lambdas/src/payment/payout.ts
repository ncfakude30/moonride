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
const NOTIFY_URL = process.env.NOTIFY_URL || 'https://www.moonride.co.za/payout/notify';
const ERROR_URL = process.env.ERROR_URL || 'https://www.moonride.co.za/error';

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Define interfaces for the request and response payloads
interface BankDetails {
    BankGroupId: string;
    AccountNumber: string; // Encrypted account number
    BranchCode: string;
  }
  
  interface PayoutRequest {
    PayoutId: string;
    SiteCode: string;
    Amount: number;
    MerchantReference: string;
    CustomerBankReference: string;
    IsRtc: boolean;
    NotifyUrl: string;
    BankingDetails: BankDetails;
    HashCheck: string;
  }
  
  interface PayoutResponse {
    PayoutId: string;
    IsVerified: boolean;
    AccountNumberDecryptionKey: string;
    Reason: string;
  }

// Generate a SHA512 hash to validate the request or response
const generateHash = (input: string): string => {
    const hash = crypto.createHash('sha512');
    hash.update(input.toLowerCase());
    return hash.digest('hex');
  };

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

            let { tripId, driverId, amount, bankDetails } = JSON.parse(event.body || '{}');

            bankDetails = {
                ...bankDetails,
                BankGroupId: "test",
                AccountNumber: "test",
                BranchCode: "test",

            }
            // Generate unique payout ID
            const payoutId = uuidv4();

            // Calculate payout amount after deducting commission
            const commission = 0.1; // 10% commission
            const payoutAmount = amount * (1 - commission);

            // Prepare payout request payload
            const payoutRequest: PayoutRequest = {
                PayoutId: payoutId,
                SiteCode: OZOW_SITE_CODE,
                Amount: payoutAmount,
                MerchantReference: `trip-${tripId}`,
                CustomerBankReference: `driver-${driverId}`,
                IsRtc: true,
                NotifyUrl: NOTIFY_URL,
                BankingDetails: {
                BankGroupId: bankDetails.BankGroupId,
                AccountNumber: bankDetails.AccountNumber, // Encrypted
                BranchCode: bankDetails.BranchCode,
                },
                HashCheck: '', // We'll generate this hash below
            };

            // Create the input string for hash check (concatenating the fields in order)
            const inputString = `${payoutRequest.PayoutId}${payoutRequest.SiteCode}${Math.floor(payoutRequest.Amount * 100)}${payoutRequest.MerchantReference}${payoutRequest.CustomerBankReference}${payoutRequest.IsRtc}${payoutRequest.NotifyUrl}${bankDetails.BankGroupId}${bankDetails.AccountNumber}${bankDetails.BranchCode}${OZOW_PRIVATE_KEY}`;

            // Generate the hash
            payoutRequest.HashCheck = generateHash(inputString);

            try {
                // Make the API call to Ozow to initiate the payout
                const response = await axios.post(`${OZOW_API_URL}/payout`, payoutRequest);
                return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'Payout initiated successfully',
                    data: response.data,
                }),
                };
            } catch (error) {
                console.error('Error initiating payout:', error);
                return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ message: 'Error initiating payout' }),
                };
            }
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


