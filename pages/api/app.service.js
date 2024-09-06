import axios from 'axios';

const apiEndpoint = process.env.API_BASE_URL || 'https://ufqmmf6blc.execute-api.us-east-1.amazonaws.com/dev'

// Create a centralized axios instance with default configuration
const apiClient = axios.create({
    baseURL: apiEndpoint,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        // You can add more default headers here if needed
    }
});

// Fetch recent trips with pagination support
export async function fetchRecentTrips(userId, lastEvaluatedKey = null, limit = 5) {
    try {
        const params = { userId, limit };
        if (lastEvaluatedKey) {
            params.lastEvaluatedKey = lastEvaluatedKey;
        }

        const response = await apiClient.get('/trips', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching recent trips:', error);
        return {
            trips: [],
            lastEvaluatedKey: null,
            error: error.response ? error.response.data : 'An error occurred while fetching trips'
        };
    }
}

// Add a new trip
export async function addTrip(tripData) {
    try {
        const response = await apiClient.post('/request', tripData);
        return response.data;
    } catch (error) {
        console.error('Error adding trip:', error);
        return {
            error: error.response ? error.response.data : 'An error occurred while adding the trip'
        };
    }
}
