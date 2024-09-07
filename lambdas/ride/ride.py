import os
import boto3
from boto3.dynamodb.conditions import Key
import json

RECENT_TRIPS_TABLE = os.getenv('RECENT_TRIPS_TABLE', 'TripsTable')
PAGE_LIMIT = os.getenv('PAGE_LIMIT', 5)

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    print(f'Received event: {event}')
    
    user_id = event['queryStringParameters']['userId']
    limit = int(event['queryStringParameters'].get('limit', PAGE_LIMIT))  # Number of items per page
    last_evaluated_key = event['queryStringParameters'].get('lastEvaluatedKey')  # For pagination

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
        'body': json.dumps(result),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Credentials': True,
        }
    }