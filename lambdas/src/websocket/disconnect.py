import os
import json
import boto3

CONNECTIONS_TABLE = os.getenv('CONNECTIONS_TABLE', 'ConnectionsTable')
WEBSOCKET_ENDPOINT = os.getenv('WEBSOCKET_ENDPOINT', 'YOUR_WEBSOCKET_ENDPOINT')

dynamodb = boto3.resource('dynamodb')
connections_table = dynamodb.Table(CONNECTIONS_TABLE)
apigatewaymanagementapi = boto3.client('apigatewaymanagementapi', endpoint_url=WEBSOCKET_ENDPOINT)

def handler(event, context):
    print(f'Received event: {event}')
    connection_id = event['requestContext']['connectionId']

    # Delete the connection from DynamoDB
    delete_connection(connection_id)

def delete_connection(connection_id):
    try:
        response = connections_table.delete_item(
            Key={
                'connectionId': connection_id
            }
        )
        print(f'Successfully deleted connection {connection_id}')
    except Exception as e:
        print(f'Error deleting connection {connection_id}: {str(e)}')

