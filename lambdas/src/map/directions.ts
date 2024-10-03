import { APIGatewayEvent, Context } from 'aws-lambda';
import axios from 'axios';

// Google Directions API Key stored as environment variable
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyAhU-s47LJFmxiPK4X5zD4oWfccyUN8kEU';

export const handler = async (event: APIGatewayEvent, context: Context) => {
    console.log(`Received event: ${JSON.stringify(JSON.parse(event.body || '{}'))}`);

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Credentials': 'true'
    };

    if (event.httpMethod === 'OPTIONS') {
        // Handle CORS preflight requests
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ message: 'CORS preflight successful' })
        };
    }

    if (event.httpMethod === 'POST') {
        try {
            // Parse the incoming request body
            const body = JSON.parse(event.body || '{}');
            const origin = body.origin;
            const destination = body.destination;

            if (!origin || !destination) {
                return {
                    statusCode: 400,
                    headers: headers,
                    body: JSON.stringify({ message: 'Origin and destination must be provided' })
                };
            }

            // Make request to Google Directions API
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${GOOGLE_API_KEY}`;
            const response = await axios.get(url);


            console.log(response);

            if (response.status !== 200) {
                return {
                    statusCode: response.status,
                    headers: headers,
                    body: JSON.stringify({ message: 'Error from Google Directions API' })
                };
            }

            const directions = response.data;

            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({ directions: directions })
            };
        } catch (error) {
            console.error(`Exception occurred: ${(error as any)?.message }`);
            return {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({ message: 'Error fetching directions', error: (error as any)?.message })
            };
        }
    } else {
        return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }
};
