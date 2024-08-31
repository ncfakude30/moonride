import json

def handler(event, context):
    body = json.loads(event['body'])

    payment_info = body.get('paymentInfo')
    user_id = body.get('userId')
    amount = body.get('amount')
    
    # Mock payment processing logic here

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Payment processed successfully!',
            'userId': user_id,
            'amount': amount
        })
    }
