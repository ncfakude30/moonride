import os
import boto3

CONNECTIONS_TABLE = os.getenv('CONNECTIONS_TABLE', 'ConnectionsTable')

dynamodb = boto3.resource('dynamodb')
connections_table = dynamodb.Table(CONNECTIONS_TABLE)

def handler(event, context):
    connection_id = event['requestContext']['connectionId']
    print(f'New connection: {connection_id}')
    
    # Extract additional information if available (e.g., userId or driverId)
    query_string_parameters = event.get('queryStringParameters', {})
    user_id = query_string_parameters.get('userId')  # Assuming the client sends userId as a query parameter
    
    # Store the connection details in DynamoDB
    connection_item = {
        'connectionId': connection_id,
        'userId': user_id,  # Store userId if available
        'connectedAt': event['requestContext']['connectedAt']  # Time of connection
    }
    
    # Save the connection in DynamoDB
    connections_table.put_item(Item=connection_item)
    
    return {
        'statusCode': 200,
        'body': 'Connected successfully.'
    }
