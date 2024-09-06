// /api-middleware/apiService.js

import axios from 'axios';

const apiEndpoint = 'https://ufqmmf6blc.execute-api.us-east-1.amazonaws.com/dev';

// Fetch recent trips with pagination support
export async function fetchRecentTrips(userId, lastEvaluatedKey = null, limit = 5) {
    try {
        const params = { userId, limit };
        if (lastEvaluatedKey) {
            params.lastEvaluatedKey = lastEvaluatedKey;
        }

        const response = await axios.get(`${apiEndpoint}/trips`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching recent trips:', error);
        return { trips: [], lastEvaluatedKey: null };
    }
}

// Add a new trip
export async function addTrip(tripData) {
    try {
        console.error(`Here: ${JSON.stringify(tripData)}`)
        const response = await axios.post(`${apiEndpoint}/request`, tripData);
        return response.data;
    } catch (error) {
        console.error('Error adding trip:', error);
        return null;
    }
}
