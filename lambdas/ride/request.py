import os
import boto3
from uuid import uuid4
import json

TRIP_TABLE = os.getenv('TRIP_TABLE', 'TripsTable')

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TRIP_TABLE)

def handler(event, context):
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
        'Access-Control-Allow-Methods': 'OPTIONS,POST',  # Allow specific HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type'
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
            
            # Generate a unique tripId
            trip_id = str(uuid4())
            
            # Construct the item to be added to DynamoDB
            item = {
                'tripId': trip_id,
                'pickup': body.get('pickup'),
                'dropoff': body.get('dropoff'),
                'price': body.get('price'),
                'time': body.get('time'),
                'rating': body.get('rating'),
                'driverProfile': body.get('driverProfile'),
            }
            
            # Add the item to DynamoDB
            table.put_item(Item=item)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'message': 'Trip successfully added',
                    'tripId': trip_id
                })
            }
        except Exception as e:
            print(e)
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': 'Error adding trip'})
            }
    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'message': 'Method not allowed'})
        }
