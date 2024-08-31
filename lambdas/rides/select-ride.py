import json

def handler(event, context):
    body = json.loads(event['body'])

    ride_id = body.get('rideId')
    user_id = body.get('userId')
    # Additional logic can be added here

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Ride selected successfully!',
            'rideId': ride_id,
            'userId': user_id
        })
    }
