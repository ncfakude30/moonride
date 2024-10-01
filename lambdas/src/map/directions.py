import os
import json
import requests

# Google Directions API Key stored as environment variable
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', 'AIzaSyAhU-s47LJFmxiPK4X5zD4oWfccyUN8kEU')

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
            origin = body.get('origin')
            destination = body.get('destination')

            if not origin or not destination:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'Origin and destination must be provided'})
                }

            # Make request to Google Directions API
            url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={GOOGLE_API_KEY}"
            response = requests.get(url)
            
            if response.status_code != 200:
                return {
                    'statusCode': response.status_code,
                    'headers': headers,
                    'body': json.dumps({'message': 'Error from Google Directions API'})
                }

            directions = response.json()

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'directions': directions})
            }
        except Exception as e:
            print(f"Exception occurred: {str(e)}")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': 'Error fetching directions', 'error': str(e)})
            }
    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'message': 'Method not allowed'})
        }
