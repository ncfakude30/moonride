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

// Function to request pickup and dropoff
export const loginApi = async (dto) => {
    try {
        
        const response = await axios.post(`${apiEndpoint}/login`, dto);
        return response.data;
    } catch (error) {
        console.error('Error logging trip:', error);
        console.error(error)
        throw error; // Re-throw error to handle it in the component
    }
};


// Fetch recent trips with pagination support
export async function fetchRecentTrips(userId, lastEvaluatedKey = null, limit = 3) {
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


// Function to request pickup and dropoff
export const requestTrip = async (dto) => {
    try {
        
        const response = await axios.post(`${apiEndpoint}/request`, dto);
        return response.data;
    } catch (error) {
        console.error('Error requesting trip:', error);
        throw error; // Re-throw error to handle it in the component
    }
};
