import os
import json
import boto3
from botocore.exceptions import ClientError

USERS_TABLE = os.getenv('USERS_TABLE', 'moonrides-users')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(USERS_TABLE)

def handler(event, context):
    print(f'Received event: {event}')
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': True,
    }

    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    if event['httpMethod'] == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            email = body.get('email')
            displayName = body.get('displayName')
            photoURL = body.get('photoURL')
            userId = body.get('id')

            if not all([userId, email, displayName, photoURL]):
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'Missing required fields'})
                }

            response = table.get_item(Key={'userId': userId})

            if 'Item' in response:
                return {
                    'statusCode': 409,
                    'headers': headers,
                    'body': json.dumps({'message': 'User already exists'})
                }

            table.put_item(
                Item={
                    'userId': userId,
                    'email': email,
                    'displayName': displayName,
                    'photoURL': photoURL
                }
            )

            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'message': 'User data stored successfully'})
            }

        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Invalid JSON format'})
            }

        except ClientError as e:
            print(f'ClientError: {e}')
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': f'Error storing user data: {e.response["Error"]["Message"]}'})
            }

        except Exception as e:
            print(f'Exception: {str(e)}')
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': f'Internal server error: {str(e)}'})
            }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'message': 'Method not allowed'})
    }
