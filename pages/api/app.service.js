import axios from 'axios';

const apiEndpoint = process.env.API_BASE_URL || 'https://ufqmmf6blc.execute-api.us-east-1.amazonaws.com/dev';

// Create a centralized axios instance with default configuration
const apiClient = axios.create({
    baseURL: apiEndpoint,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        // You can add more default headers here if needed
    }
});

// WebSocket class for handling WebSocket connection and messages
class WebSocketService {
    constructor(url) {
        this.url = url;
        this.ws = null;
    }

    connect() {
        if (this.ws) return; // Already connected

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
        };

        this.ws.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error', error);
        };
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Initialize WebSocketService
const webSocketService = new WebSocketService('wss://your-websocket-url');

// API functions
export const loginApi = async (dto) => {
    try {
        const response = await axios.post(`${apiEndpoint}/login`, dto);
        return response.data;
    } catch (error) {
        console.error('Error logging trip:', error);
        throw error;
    }
};

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

export const requestTrip = async (dto) => {
    try {
        const response = await axios.post(`${apiEndpoint}/request`, dto);
        return response.data;
    } catch (error) {
        console.error('Error requesting trip:', error);
        throw error;
    }
};

// Export the WebSocket service instance
export default {
    apiClient,
    webSocketService
};
