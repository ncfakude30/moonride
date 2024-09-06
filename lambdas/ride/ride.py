import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('RECENT_TRIPS_TABLE')
table = dynamodb.Table(table_name)

def handler(event, context):
    user_id = event['queryStringParameters']['userId']

    response = table.query(
        KeyConditionExpression=Key('userId').eq(user_id)
    )

    return {
        'statusCode': 200,
        'body': {
            'recentTrips': response['Items']
        }
    }