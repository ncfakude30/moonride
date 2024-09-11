import os
import boto3
import requests
import json
from uuid import uuid4
from datetime import datetime

PAYMENT_TABLE = os.getenv('PAYMENT_TABLE', 'PaymentsTable')
OZOW_API_URL = os.getenv('OZOW_API_URL', 'https://api.ozow.com/payments/create')
OZOW_SITE_CODE = os.getenv('OZOW_SITE_CODE', 'your_site_code')
OZOW_API_KEY = os.getenv('OZOW_API_KEY', 'your_api_key')
OZOW_PRIVATE_KEY = os.getenv('OZOW_PRIVATE_KEY', 'your_api_key')
OZOW_SECRET = os.getenv('OZOW_SECRET', 'your_secret')
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

            # Create the payment request to Ozow
            response = requests.post(OZOW_API_URL, json=ozow_payload, headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {OZOW_API_KEY}'
            })

            if response.status_code != 200:
                raise Exception(f'Ozow API error: {response.text}')

            ozow_response = response.json()
            payment_url = ozow_response.get('PaymentUrl')

            # Store the payment record in DynamoDB
            item = {
                'paymentId': payment_id,
                'userId': body.get('userId'),
                'amount': body.get('amount'),
                'paymentUrl': payment_url,
                'paymentDate': payment_date,
                'status': 'PENDING'
            }
            
            table.put_item(Item=item)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'message': 'Payment successfully initiated',
                    'paymentUrl': payment_url,
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
