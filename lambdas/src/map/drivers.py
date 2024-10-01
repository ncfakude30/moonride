import os
import json

def handler(event, context):
    print(f"Received event: {event}")

    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Credentials': 'true',
    }

    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    if event['httpMethod'] == 'POST':
        try:
            body = json.loads(event['body'])
            pickupCoordinates = body.get('pickupCoordinates')

            if not pickupCoordinates:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'message': 'pickupCoordinates must be provided'})
                }

            # Simulating driver data for the example
            # In production, query the database for available drivers near the coordinates
            drivers = [
                {'service': 'UberX', 'imgUrl': 'https://i.ibb.co/cyvcpfF/uberx.png', 'multiplier': 1},
                {'service': 'UberXL', 'imgUrl': 'https://i.ibb.co/YDYMKny/uberxl.png', 'multiplier': 1.5},
                {'service': 'Black', 'imgUrl': 'https://i.ibb.co/Xx4G91m/uberblack.png', 'multiplier': 2},
                {'service': 'Comfort', 'imgUrl': 'https://i.ibb.co/cyvcpfF/uberx.png', 'multiplier': 1.2},
                {'service': 'Black SUV', 'imgUrl': 'https://i.ibb.co/1nStPWT/uberblacksuv.png', 'multiplier': 2.8}
            ]

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'drivers': drivers})
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'message': 'Error fetching drivers', 'error': str(e)})
            }

    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'message': 'Method not allowed'})
        }
