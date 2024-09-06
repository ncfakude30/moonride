// /api-middleware/apiService.js

import axios from 'axios';

const apiEndpoint = 'https://ufqmmf6blc.execute-api.us-east-1.amazonaws.com/dev';

// Fetch recent trips
export async function fetchRecentTrips(userId) {
    try {
        console.error(`My fetch: ${JSON.stringify(userId)}`)
        const response = await axios.get(`${apiEndpoint}/trips`, {
            params: { userId }
        });
        console.error(`My fetch: ${JSON.stringify(response.data)}`)
        return response.data.trips;
    } catch (error) {
        console.error('Error fetching recent trips:', error);
        return [];
    } s
}

// Add a new trip
export async function addTrip(tripData) {
    try {
        console.error(`Here`)
        const response = await axios.post(`${apiEndpoint}/select-ride`, tripData);
        return response.data;
    } catch (error) {
        console.error('Error adding trip:', error);
        return null;
    }
}
