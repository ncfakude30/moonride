import os
import boto3
from boto3.dynamodb.conditions import Key
import os
import boto3 

RECENT_TRIPS_TABLE = os.getenv('RECENT_TRIPS_TABLE', 'TripsTable')

dynamodb = boto3.resource('dynamodb')

def handler(event, context):

    print(f'My event: {event}')
    user_id = event['queryStringParameters']['userId']

    table = dynamodb.Table(RECENT_TRIPS_TABLE)
    response = table.query(
        KeyConditionExpression=Key('userId').eq(user_id)
    )

    return {
        'statusCode': 200,
        'body': {
            'recentTrips': response['Items']
        }
    }