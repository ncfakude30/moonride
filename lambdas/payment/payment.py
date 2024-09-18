import hashlib
import os
import boto3
import requests
import json
from uuid import uuid4
from datetime import datetime, timedelta

PAYMENT_TABLE = os.getenv('TRANSACTIONS_TABLE', 'TransactionsTable')
OZOW_API_URL = os.getenv('OZOW_API_URL', 'https://api.ozow.com')
OZOW_SITE_CODE = os.getenv('OZOW_SITE_CODE', 'NCF-NCF-001')
OZOW_API_KEY = os.getenv('OZOW_API_KEY', '667a79c009bd458c866666d98d8b2a75')
OZOW_PRIVATE_KEY = os.getenv('OZOW_PRIVATE_KEY', '9bc47fe01bbe475a9995a887dcb1e73a')
OZOW_SECRET = os.getenv('OZOW_SECRET', '9bc47fe01bbe475a9995a887dcb1e73a')
SUCCESS_URL = os.getenv('SUCCESS_URL', 'https://www.moonride.co.za/success')
CANCEL_URL = os.getenv('CANCEL_URL', 'https://www.moonride.co.za/cancel')
NOTIFY_URL = os.getenv('NOTIFY_URL', 'https://www.moonride.co.za/notify')
ERROR_URL = os.getenv('ERROR_URL', 'https://www.moonride.co.za/error')

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(PAYMENT_TABLE)

def handler(event, context):
    print(f'Received event: {event}')
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Credentials': 'true'
    }

    if event['httpMethod'] == 'OPTIONS':
        # Handle CORS preflight requests
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    if event['httpMethod'] == 'POST':
        try:
            # Parse the incoming request body
            body = json.loads(event['body'])
            
            # Generate a unique paymentId
            payment_id = str(uuid4())
            
            # Get the current date and time for paymentDate
            payment_date = datetime.utcnow().isoformat()  # ISO 8601 format
            
            
            # Prepare the payment data for Ozow
            ozow_payload = {
                'SiteCode': OZOW_SITE_CODE,
                'CountryCode': 'ZA',
                'CurrencyCode': 'ZAR',
                'Amount': body.get('amount'),
                'TransactionReference': payment_id,
                'BankReference': body.get('bankReference'),
                'Customer': {
                    'FirstName': body.get('firstName'),
                    'LastName': body.get('lastName'),
                    'EmailAddress': body.get('email')
                },
                'IsTest': False,
                'SuccessUrl': SUCCESS_URL,
                'ErrorUrl': ERROR_URL,
                'CancelUrl': CANCEL_URL,
                'NotifyUrl': NOTIFY_URL,
                'Secret': OZOW_SECRET
            }


            ozow_payload = get_payload(body.get('amount'),
                 payment_id,
                body.get('bankReference'),
            )

            paymentRequestId, url = init_transaction(ozow_payload)

            if not (paymentRequestId and url ):
                print(f"Exception occurred: {str(e)}")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'message': 'Error initiating payment', 'error': str(e)})
                }

            # Store the payment record in DynamoDB
            item = {
                'paymentId': payment_id,
                'userId': body.get('userId'),
                'amount': body.get('amount'),
                'paymentUrl': url,
                'paymentRequestId': paymentRequestId,
                'paymentDate': payment_date,
                'status': 'PENDING'
            }
            
            table.put_item(Item=item)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'message': 'Payment successfully initiated',
                    'paymentUrl': url,
                    'paymentId': payment_id,
                    'status': 200,
                })
            }
        except Exception as e:
            print(f"Exception occurred: {str(e)}")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': 'Error initiating payment', 'error': str(e)})
            }
    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'message': 'Method not allowed'})
        }


def init_transaction(payment) -> dict:
    print(f"Attempting to request a new payment url from Ozow. {json.dumps(payment)}")
    
    try:
        headers = {
            'Accept': 'application/json',
            'ApiKey': OZOW_API_KEY,
            'Content-Type': 'application/json',
        }
        response = requests.post(
            f"{OZOW_API_URL}/PostPaymentRequest",
            json=payment,
            headers=headers
        )
        response_data = response.json()

        if response_data.get('errorMessage'):
            print(f"Error response from Ozow for paymentId: {payment.get('transactionReference')}, {response_data['errorMessage']}")
            raise Exception(response_data['errorMessage'])
        print(f"Response from Ozow. {json.dumps(response_data)}")
        return {
            'paymentRequestId': response_data.get('paymentRequestId'),
            'url': response_data.get('url'),
        }
    except requests.RequestException as e:
        print(f"Error while making request to Ozow. {json.dumps({'responseBody': e.response.json() if e.response else None, 'error': str(e)})}")
        raise

def get_expiry_date_utc(expiry_limit: int) -> str:
    current_date_utc = datetime.utcnow()
    expiry_date_utc = current_date_utc + timedelta(minutes=expiry_limit)
    return expiry_date_utc.strftime('%Y-%m-%d %H:%M')

def generate_hash_check(payload):
    hash_sequence = [
        'siteCode', 'countryCode', 'currencyCode', 'amount', 'transactionReference',
        'bankReference', 'customer', 'cancelUrl', 'errorUrl', 'successUrl',
        'notifyUrl', 'isTest', 'selectedBankId', 'expiryDateUtc'
    ]

    input_string = ''.join(str(payload.get(key, '')) for key in hash_sequence)
    input_string += OZOW_PRIVATE_KEY
    input_string = input_string.lower()
    
    return hashlib.sha512(input_string.encode('utf-8')).hexdigest()

def get_payload(amount: float, transaction_reference: str,
                bank_reference: str):
    payload = {
        'siteCode': OZOW_SITE_CODE,
        'countryCode': 'ZA',
        'currencyCode': 'ZAR',
        'amount': amount,
        'transactionReference': transaction_reference,
        'bankReference': bank_reference,
        'customer': '',
        'cancelUrl': CANCEL_URL,
        'errorUrl': ERROR_URL,
        'successUrl': SUCCESS_URL,
        'notifyUrl': NOTIFY_URL,
        'isTest': True,
        'expiryDateUtc': get_expiry_date_utc(15) if 15 > 0 else None,
        'allowVariableAmount': False,
    }

    payload['hashCheck'] = generate_hash_check(payload, OZOW_PRIVATE_KEY)
    
    return payload
