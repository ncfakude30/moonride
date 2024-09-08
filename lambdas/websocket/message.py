import os
import json
import geohash
import boto3
from uuid import uuid4
from datetime import datetime

GEOHASH_PRECISION = 5
DRIVERS_TABLE = os.getenv('DRIVERS_TABLE', 'DriversTable')
CONNECTIONS_TABLE = os.getenv('CONNECTIONS_TABLE', 'ConnectionsTable')
MESSAGES_TABLE = os.getenv('MESSAGES_TABLE', 'MessagesTable')
WEBSOCKET_ENDPOINT = os.getenv('WEBSOCKET_ENDPOINT', 'YOUR_WEBSOCKET_ENDPOINT')

dynamodb = boto3.resource('dynamodb')
drivers_table = dynamodb.Table(DRIVERS_TABLE)
connections_table = dynamodb.Table(CONNECTIONS_TABLE)
messages_table = dynamodb.Table(MESSAGES_TABLE)
apigatewaymanagementapi = boto3.client('apigatewaymanagementapi', endpoint_url=WEBSOCKET_ENDPOINT)

def handler(event, context):
    print(f'Received event: {event}')
    connection_id = event['requestContext']['connectionId']
    body = json.loads(event['body'])

    # Determine the type of message
    message_type = body.get('type')

    if message_type == 'ride_request':
        handle_ride_request(body, connection_id)
    elif message_type == 'chat_message':
        handle_chat_message(body, connection_id)
    else:
        print(f'Unknown message type: {message_type}')
        send_error_response(connection_id, "Unknown message type.")

def handle_ride_request(message, connection_id):
    pickup_location = message['pickup']
    # Use python-geohash to encode the latitude and longitude
    geohash_value = geohash.encode(pickup_location['latitude'], pickup_location['longitude'], GEOHASH_PRECISION)

    # Query DynamoDB for drivers in the geohash range
    drivers = query_drivers_in_geohash_range(geohash_value)

    # Notify drivers
    notify_drivers(drivers, message)

def query_drivers_in_geohash_range(geohash_value):
    response = drivers_table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('geohash').begins_with(geohash_value)
    )
    return response['Items']

def notify_drivers(drivers, message):
    for driver in drivers:
        connection_id = driver['connectionId']
        try:
            apigatewaymanagementapi.post_to_connection(
                ConnectionId=connection_id,
                Data=json.dumps(message)
            )
        except apigatewaymanagementapi.exceptions.GoneException:
            print(f'Connection {connection_id} is no longer valid.')

def handle_chat_message(message, connection_id):
    recipient_id = message['recipientId']
    recipient_connection_id = get_connection_id_by_user_id(recipient_id)

    if recipient_connection_id:
        chat_message = {
            'messageId': str(uuid4()),
            'senderConnectionId': connection_id,
            'recipientConnectionId': recipient_connection_id,
            'message': message['text'],
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Store the chat message in DynamoDB
        messages_table.put_item(Item=chat_message)

        # Relay the chat message to the recipient
        try:
            apigatewaymanagementapi.post_to_connection(
                ConnectionId=recipient_connection_id,
                Data=json.dumps(chat_message)
            )
        except apigatewaymanagementapi.exceptions.GoneException:
            print(f'Recipient connection {recipient_connection_id} is no longer valid.')
    else:
        print(f'No connection found for recipient {recipient_id}.')
        send_error_response(connection_id, "Recipient is not connected.")

def get_connection_id_by_user_id(user_id):
    response = connections_table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
    )
    items = response.get('Items', [])
    if items:
        return items[0].get('connectionId')
    return None

def send_error_response(connection_id, error_message):
    error_response = {
        'error': error_message
    }
    try:
        apigatewaymanagementapi.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(error_response)
        )
    except apigatewaymanagementapi.exceptions.GoneException:
        print(f'Connection {connection_id} is no longer valid.')
