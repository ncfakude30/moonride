import os
import json
import boto3
import logging
from uuid import uuid4
from datetime import datetime

try:
    import geohash
except ImportError:
    logging.warning('Using custom geo hashing.')
    geohash = None

# Constants
GEOHASH_PRECISION = 5
DRIVERS_TABLE = os.getenv('DRIVERS_TABLE', 'DriversTable')
CONNECTIONS_TABLE = os.getenv('CONNECTIONS_TABLE', 'ConnectionsTable')
MESSAGES_TABLE = os.getenv('MESSAGES_TABLE', 'MessagesTable')
WEBSOCKET_ENDPOINT = os.getenv('WEBSOCKET_ENDPOINT', 'https://j4a86rv3rd.execute-api.us-east-1.amazonaws.com/dev/@connections')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
drivers_table = dynamodb.Table(DRIVERS_TABLE)
connections_table = dynamodb.Table(CONNECTIONS_TABLE)
messages_table = dynamodb.Table(MESSAGES_TABLE)
apigatewaymanagementapi = boto3.client('apigatewaymanagementapi', endpoint_url=WEBSOCKET_ENDPOINT)

# Geohash base32 mapping
_base32 = '0123456789bcdefghjkmnpqrstuvwxyz'

def handler(event, context):
    print(f'handler: Entry with event: {event}')
    connection_id = event['requestContext']['connectionId']
    try:
        body = json.loads(event['body'])
    except json.JSONDecodeError as e:
        print(f'Error decoding JSON: {e}')
        send_error_response(connection_id, "Invalid request format.")
        print('handler: Exit with error response for invalid JSON')
        return

    message_type = body.get('type')

    if message_type == 'ride_request':
        handle_ride_request(body, connection_id)
    elif message_type == 'chat_message':
        handle_chat_message(body, connection_id)
    else:
       print(f'Unknown message type: {message_type}')
        send_error_response(connection_id, "Unknown message type.")
    
    print('handler: Exit')

def handle_ride_request(message, connection_id):
    print(f'handle_ride_request: Entry with message: {message}, connection_id: {connection_id}')
    pickup_location = message.get('pickup')
    if not pickup_location:
       print('Pickup location not provided in ride request.')
        send_error_response(connection_id, "Pickup location missing.")
        print('handle_ride_request: Exit with error response for missing pickup location.')
        return

    latitude = pickup_location.get('latitude')
    longitude = pickup_location.get('longitude')

    if latitude is None or longitude is None:
       print('Latitude or longitude missing in pickup location.')
        send_error_response(connection_id, "Invalid pickup location.")
        print('handle_ride_request: Exit with error response for invalid pickup location.')
        return

    try:
        geohash_value = geohash.encode(latitude, longitude, GEOHASH_PRECISION) if geohash else encode(latitude, longitude, GEOHASH_PRECISION)
        print(f'Encoded geohash: {geohash_value}')
    except Exception as e:
        print(f'Error encoding geohash: {e}')
        send_error_response(connection_id, "Error processing location.")
        print('handle_ride_request: Exit with error response for geohash encoding error.')
        return

    drivers = query_drivers_in_geohash_range(geohash_value)
    drivers = bulk_query_geolocated_driver_connections(drivers)
    notify_drivers(drivers, message)
    
    print('handle_ride_request: Exit')

def bulk_query_geolocated_driver_connections(drivers):
    print(f'bulk_query_geolocated_driver_connections: Entry with drivers: {drivers}')
    if not drivers:
       print('No drivers provided for bulk query.')
        return []

    driver_ids = [driver['driverId'] for driver in drivers if 'driverId' in driver]
    if not driver_ids:
       print('No valid driver IDs found.')
        return []

    # Prepare the request for batch_get_item
    keys = [{'userId': driver_id} for driver_id in driver_ids]
    
    # DynamoDB requires a maximum of 100 items per batch request
    MAX_BATCH_SIZE = 100
    connection_ids = []
    
    # Batch processing in chunks of 100
    for i in range(0, len(keys), MAX_BATCH_SIZE):
        batch_keys = keys[i:i + MAX_BATCH_SIZE]
        
        try:
            response = dynamodb.batch_get_item(
                RequestItems={
                    CONNECTIONS_TABLE: {
                        'Keys': batch_keys,
                        'ProjectionExpression': 'connectionId'
                    }
                }
            )
            
            items = response.get('Responses', {}).get(CONNECTIONS_TABLE, [])
            connection_ids.extend([item['connectionId'] for item in items if 'connectionId' in item])
            
        except Exception as e:
            print(f'Error querying connections in batch: {e}')

    print(f'Found connection IDs: {connection_ids}')
    print('bulk_query_geolocated_driver_connections: Exit')
    return connection_ids

def query_drivers_in_geohash_range(geohash_value):
    print(f'query_drivers_in_geohash_range: Entry with geohash_value: {geohash_value}')
    try:
        response = drivers_table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('geohash').begins_with(geohash_value)
        )
        print(f'Query result: {response}')
        print('query_drivers_in_geohash_range: Exit')
        return response['Items']
    except Exception as e:
        print(f'Error querying drivers table: {e}')
        print('query_drivers_in_geohash_range: Exit with error')
        return []

def notify_drivers(drivers, message):
    print(f'notify_drivers: Entry with drivers: {drivers}, message: {message}')
    for driver in drivers:
        connection_id = driver.get('connectionId')
        if not connection_id:
           print('Driver missing connectionId.')
            continue

        try:
            apigatewaymanagementapi.post_to_connection(
                ConnectionId=connection_id,
                Data=json.dumps(message)
            )
            print(f'Notification sent to driver {connection_id}')
        except apigatewaymanagementapi.exceptions.GoneException:
           print(f'Connection {connection_id} is no longer valid.')
        except Exception as e:
            print(f'Error notifying driver {connection_id}: {e}')
    
    print('notify_drivers: Exit')

def handle_chat_message(message, connection_id):
    print(f'handle_chat_message: Entry with message: {message}, connection_id: {connection_id}')
    recipient_id = message.get('recipientId')
    text = message.get('text')

    if not recipient_id or not text:
       print('Recipient ID or message text missing in chat message.')
        send_error_response(connection_id, "Recipient ID or message text missing.")
        print('handle_chat_message: Exit with error response for missing recipient ID or text.')
        return

    recipient_connection_id = get_connection_id_by_user_id(recipient_id)

    if recipient_connection_id:
        chat_message = {
            'messageId': str(uuid4()),
            'senderConnectionId': connection_id,
            'recipientConnectionId': recipient_connection_id,
            'message': text,
            'timestamp': datetime.utcnow().isoformat()
        }

        try:
            messages_table.put_item(Item=chat_message)
            apigatewaymanagementapi.post_to_connection(
                ConnectionId=recipient_connection_id,
                Data=json.dumps(chat_message)
            )
            print(f'Chat message sent to recipient {recipient_connection_id}')
        except apigatewaymanagementapi.exceptions.GoneException:
           print(f'Recipient connection {recipient_connection_id} is no longer valid.')
        except Exception as e:
            print(f'Error handling chat message: {e}')
    else:
        print(f'No connection found for recipient {recipient_id}.')
        send_error_response(connection_id, "Recipient is not connected.")
    
    print('handle_chat_message: Exit')

def get_connection_id_by_user_id(user_id):
    print(f'get_connection_id_by_user_id: Entry with user_id: {user_id}')
    try:
        response = connections_table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
        )
        items = response.get('Items', [])
        if items:
            connection_id = items[0].get('connectionId')
            print(f'Found connection ID: {connection_id}')
            print('get_connection_id_by_user_id: Exit')
            return connection_id
    except Exception as e:
        print(f'Error querying connections table: {e}')
    
    print('get_connection_id_by_user_id: Exit with no connection found')
    return None

def send_error_response(connection_id, error_message):
    print(f'send_error_response: Entry with connection_id: {connection_id}, error_message: {error_message}')
    error_response = {
        'error': error_message
    }
    try:
        apigatewaymanagementapi.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(error_response)
        )
        print(f'Error response sent to connection {connection_id}')
    except apigatewaymanagementapi.exceptions.GoneException:
       print(f'Connection {connection_id} is no longer valid.')
    except Exception as e:
        print(f'Error sending error response: {e}')
    print('send_error_response: Exit')

def encode(latitude, longitude, precision=12):
    if latitude >= 90.0 or latitude < -90.0:
        raise ValueError("Invalid latitude.")
    while longitude < -180.0:
        longitude += 360.0
    while longitude >= 180.0:
        longitude -= 360.0

    if geohash:
        basecode = geohash.encode(latitude, longitude)
        if len(basecode) > precision:
            return basecode[:precision]
        return basecode + '0' * (precision - len(basecode))

    xprecision = precision + 1
    lat_length = lon_length = int(xprecision * 5 / 2)
    if xprecision % 2 == 1:
        lon_length += 1

    if hasattr(float, "fromhex"):
        a = _float_hex_to_int(latitude / 90.0)
        o = _float_hex_to_int(longitude / 180.0)
        if a[1] > lat_length:
            ai = a[0] >> (a[1] - lat_length)
        else:
            ai = a[0] << (lat_length - a[1])

        if o[1] > lon_length:
            oi = o[0] >> (o[1] - lon_length)
        else:
            oi = o[0] << (lon_length - o[1])

        return _encode_i2c(ai, oi, lat_length, lon_length)[:precision]

    lat = latitude / 180.0
    lon = longitude / 360.0

    if lat > 0:
        lat = int((1 << lat_length) * lat) + (1 << (lat_length - 1))
    else:
        lat = (1 << (lat_length - 1)) - int((1 << lat_length) * (-lat))

    if lon > 0:
        lon = int((1 << lon_length) * lon) + (1 << (lon_length - 1))
    else:
        lon = (1 << (lon_length - 1)) - int((1 << lon_length) * (-lon))

    return _encode_i2c(lat, lon, lat_length, lon_length)[:precision]

def _float_hex_to_int(f):
    if f < -1.0 or f >= 1.0:
        return None

    if f == 0.0:
        return 1, 1

    h = f.hex()
    x = h.find("0x1.")
    if x < 0:
        return None
    p = h.find("p")
    if p <= 0:
        return None

    half_len = len(h[x+4:p]) * 4 - int(h[p+1:])
    if x == 0:
        r = (1 << half_len) + ((1 << (len(h[x+4:p]) * 4)) + int(h[x+4:p], 16))
    else:
        r = (1 << half_len) - ((1 << (len(h[x+4:p]) * 4)) + int(h[x+4:p], 16))

    return r, half_len + 1

def _int_to_float_hex(i, l):
    if l == 0:
        return -1.0

    half = 1 << (l - 1)
    s = int((l + 3) / 4)
    if i >= half:
        i = i - half
        return float.fromhex(("0x0.%0" + str(s) + "xp1") % (i << (s * 4 - l),))
    else:
        i = half - i
        return float.fromhex(("-0x0.%0" + str(s) + "xp1") % (i << (s * 4 - l),))

def _encode_i2c(lat, lon, lat_length, lon_length):
    precision = int((lat_length + lon_length) / 5)
    if lat_length < lon_length:
        a = lon
        b = lat
    else:
        a = lat
        b = lon

    boost = (0, 1, 4, 5, 16, 17, 20, 21)
    ret = ''
    for _ in range(precision):
        ret += _base32[(boost[a & 7] + (boost[b & 3] << 1)) & 0x1F]
        t = a >> 3
        a = b >> 2
        b = t

    return ret[::-1]
