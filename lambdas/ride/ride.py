import os
import boto3
from boto3.dynamodb.conditions import Key
import json

RECENT_TRIPS_TABLE = os.getenv('RECENT_TRIPS_TABLE', 'TripsTable')
PAGE_LIMIT = int(os.getenv('PAGE_LIMIT', 5))  # Ensure PAGE_LIMIT is an integer

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    print(f'Received event: {event}')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
        'Access-Control-Allow-Methods': 'OPTIONS,GET',  # Allow GET and OPTIONS methods
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',  # Allow specific headers
        'Access-Control-Allow-Credentials': 'true'
    }
    
    # Handle CORS preflight requests
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    # Handle GET requests
    if event['httpMethod'] == 'GET':
        try:
            user_id = event['queryStringParameters'].get('userId')
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'userId parameter is required'})
                }

            limit = int(event['queryStringParameters'].get('limit', PAGE_LIMIT))
            last_evaluated_key = event['queryStringParameters'].get('lastEvaluatedKey')
    
            table = dynamodb.Table(RECENT_TRIPS_TABLE)
    
            # Building the query parameters
            query_params = {
                'KeyConditionExpression': Key('userId').eq(user_id),
                'Limit': limit
            }
    
            # Add the ExclusiveStartKey if pagination is being used
            if last_evaluated_key:
                query_params['ExclusiveStartKey'] = json.loads(last_evaluated_key)
    
            # Query the DynamoDB table
            response = table.query(**query_params)
    
            # Prepare the result with pagination information
            result = {
                'trips': response['Items']
            }
    
            # If there are more items to be fetched, include the LastEvaluatedKey
            if 'LastEvaluatedKey' in response:
                result['lastEvaluatedKey'] = json.dumps(response['LastEvaluatedKey'])
    
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result)
            }
        except Exception as e:
            print(f"Exception occurred: {str(e)}")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': 'Error fetching trips', 'error': str(e)})
            }
    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'message': 'Method not allowed'})
        }
