import os
import json
import boto3
from botocore.exceptions import ClientError

# Environment variables
USERS_TABLE = os.getenv('USERS_TABLE', 'UsersTable')

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(USERS_TABLE)

def lambda_handler(event, context):
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',  # Allow requests from any origin
        'Access-Control-Allow-Methods': 'OPTIONS,GET',  # Allow specific HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    if event['httpMethod'] == 'OPTIONS':
        # Handle CORS preflight requests
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    if event['httpMethod'] == 'GET':
        try:
            # Retrieve userId from query parameters
            user_id = event['queryStringParameters'].get('userId')
            
            # Validate userId
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'Missing userId parameter'})
                }

            # Query the DynamoDB table
            response = table.get_item(
                Key={'userId': user_id}  # Assuming userId is the email in this context
            )

            # Check if the user exists
            if 'Item' not in response:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'message': 'User not found'})
                }

            # Return the user data
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(response['Item'])
            }

        except ClientError as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': f'Error retrieving user data: {e.response["Error"]["Message"]}'})
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': f'Internal server error: {str(e)}'})
            }
    
    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'message': 'Method not allowed'})
        }
