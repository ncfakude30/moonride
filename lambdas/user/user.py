import json

def handler(event, context):
    user_location = event['queryStringParameters']['location']

    # Mock logic to determine currency based on location
    currency = "ZAR" if user_location == "South Africa" else "USD"

    return {
        'statusCode': 200,
        'body': json.dumps({
            'location': user_location,
            'currency': currency
        })
    }
