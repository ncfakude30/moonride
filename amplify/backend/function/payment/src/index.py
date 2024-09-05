import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Trips')

def handler(event, context):
    user_id = event.get('queryStringParameters', {}).get('user_id')
    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'user_id is required'})
        }
    
    try:
        # Query trips by user_id
        response = table.query(
            IndexName='UserIdIndex',  # Assuming you have a GSI on user_id
            KeyConditionExpression=Key('user_id').eq(user_id)
        )
        trips = response.get('Items', [])
        return {
            'statusCode': 200,
            'body': json.dumps(trips)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
