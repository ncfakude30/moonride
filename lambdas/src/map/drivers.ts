import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Received event: ${JSON.stringify(event)}`);

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Credentials': 'true'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' }),
        };
    }

    if (event.httpMethod === 'POST') {
        try {
            const body = event.body ? JSON.parse(event.body) : null;
            const pickupCoordinates = body?.pickupCoordinates;

            if (!pickupCoordinates) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'pickupCoordinates must be provided' }),
                };
            }

            // Simulating driver data for the example
            // In production, query the database for available drivers near the coordinates
            const drivers = [
                { service: 'UberX', imgUrl: 'https://i.ibb.co/cyvcpfF/uberx.png', multiplier: 1 },
                { service: 'UberXL', imgUrl: 'https://i.ibb.co/YDYMKny/uberxl.png', multiplier: 1.5 },
                { service: 'Black', imgUrl: 'https://i.ibb.co/Xx4G91m/uberblack.png', multiplier: 2 },
                { service: 'Comfort', imgUrl: 'https://i.ibb.co/cyvcpfF/uberx.png', multiplier: 1.2 },
                { service: 'Black SUV', imgUrl: 'https://i.ibb.co/1nStPWT/uberblacksuv.png', multiplier: 2.8 },
            ];


            console.log(drivers);

            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({ drivers, pickupCoordinates }),
            };
        } catch (e) {
            console.error(`Exception occurred: ${e}`);
            return {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({ message: 'Error fetching drivers', error: (e as any)?.message }),
            };
        }
    } else {
        return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
};
