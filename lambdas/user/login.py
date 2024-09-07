import os
import json
import boto3
from botocore.exceptions import ClientError

# Environment variables
USERS_TABLE = os.getenv('USERS_TABLE', 'UsersTable')

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(USERS_TABLE)

def handler(event, context):
    # CORS headers
    allowed_origins = ['https://www.moonride.co.za', 'http://localhost:3000']
    origin = event.get('headers', {}).get('origin')
    
    response_headers = {
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Origin': origin if origin in allowed_origins else 'https://www.moonride.co.za',
        'Access-Control-Allow-Credentials': 'true'
    }

    if event['httpMethod'] == 'OPTIONS':
        # Handle CORS preflight requests
        return {
            'statusCode': 200,
            'headers': response_headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    if event['httpMethod'] == 'POST':
        try:
            # Parse the incoming request body
            body = json.loads(event.get('body', '{}'))
            email = body.get('email')
            displayName = body.get('displayName')
            photoURL = body.get('photoURL')
            userId = body.get('id')

            # Validate required fields
            if not all([userId, email, displayName, photoURL]):
                return {
                    'statusCode': 400,
                    'headers': response_headers,
                    'body': json.dumps({'message': 'Missing required fields'})
                }

            # Check if the user already exists
            response = table.get_item(
                Key={'userId': userId}
            )

            if 'Item' in response:
                return {
                    'statusCode': 409,
                    'headers': response_headers,
                    'body': json.dumps({'message': 'User already exists'})
                }

            # Store user information in DynamoDB
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
                'headers': response_headers,
                'body': json.dumps({'message': 'User data stored successfully'})
            }

        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'headers': response_headers,
                'body': json.dumps({'message': 'Invalid JSON format'})
            }

        except ClientError as e:
            return {
                'statusCode': 500,
                'headers': response_headers,
                'body': json.dumps({'message': f'Error storing user data: {e.response["Error"]["Message"]}'})
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': response_headers,
                'body': json.dumps({'message': f'Internal server error: {str(e)}'})
            }
    
    else:
        return {
            'statusCode': 405,
            'headers': response_headers,
            'body': json.dumps({'message': 'Method not allowed'})
        }
