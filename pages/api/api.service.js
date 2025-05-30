import axios from 'axios';
import * as crypto from 'crypto';

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

// API functions
export const loginApi = async (dto) => {
    try {
        const response = await apiClient.post('/login', dto);
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

// API functions
export const registerApi = async (dto) => {
    try {
        const response = await apiClient.post('/login', dto);
        return response.data;
    } catch (error) {
        console.error('Error registering:', error);
        throw error;
    }
};

// API functions
export const getUser = async (userId) => {
    if(!userId) {
        console.log(`No userId`);
        return;
    }

    console.log(`Here userId: ${userId}`);
    try {
        const params = { userId };
        const response = await apiClient.get('/user', {params});
        return response.data;
    } catch (error) {
        console.error('Error getting user :', error);
        throw error;
    }
};

// API functions
export const updateDriverStatus = async (payload) => {
    try {
        const response = await apiClient.post('/driver/status', payload);
        return response.data;
    } catch (error) {
        console.error('Error getting user :', error);
        throw error;
    }
};



export async function fetchRecentTrips(userId, lastEvaluatedKey = null, limit = 3) {
    try {
        if(!userId) {
            console.log(`No userId`);
            return;
        }
    
        console.log(`Here userId: ${userId}`);
        const params = { userId, limit };
        if (lastEvaluatedKey) {
            params.lastEvaluatedKey = lastEvaluatedKey;
        }

        const response = await apiClient.get('/trips', { params });

        // Assuming response.data.trips is an array of trips
        const sortedTrips = response.data?.trips?.sort((a, b) => {
            // Ensure tripDate is in a Date format or a timestamp for accurate comparison
            return new Date(b?.tripDate) - new Date(a?.tripDate);
        });

        return {
            trips: sortedTrips,
            lastEvaluatedKey: response.data.lastEvaluatedKey,
            error: null,
        };
    } catch (error) {
        console.error('Error fetching recent trips:', error);
        return {
            trips: [],
            lastEvaluatedKey: null,
            error: error.response ? error.response.data : 'An error occurred while fetching trips',
        };
    }
}

export async function getPaymentTransactions(userId, lastEvaluatedKey = null, limit = 3) {
    try {
        if(!userId) {
            console.log(`No userId`);
            return;
        }
    
        const params = { userId, limit };
        if (lastEvaluatedKey) {
            params.lastEvaluatedKey = lastEvaluatedKey;
        }

        const response = await apiClient.get('/transactions', { params });

        // Assuming response.data.trips is an array of trips
        const sortedTransactions= response.data?.transactions?.sort((a, b) => {
            // Ensure tripDate is in a Date format or a timestamp for accurate comparison
            return new Date(b?.tripDate) - new Date(a?.tripDate);
        });

        return {
            transactions: sortedTransactions,
            lastEvaluatedKey: response.data.lastEvaluatedKey,
            error: null,
        };
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        return {
            transactions: [],
            lastEvaluatedKey: null,
            error: error.response ? error.response.data : 'An error occurred while fetching transactions',
        };
    }
}

export const requestTrip = async (dto) => {
    try {
        const response = await apiClient.post('/request', dto);
        return response.data; // Ensure this matches the expected response structure
    } catch (error) {
        console.error('Error requesting trip:', error);
        throw error;
    }
};

// Payment API functions
export const initiatePayment = async (paymentDetails) => {
    try {
        const response = await apiClient.post('/payment', paymentDetails);
        return response?.data; // Expecting { paymentUrl: string, paymentId: string }
    } catch (error) {
        console.error('Error initiating payment:', error);
        throw error;
    }
};

export const handlePaymentNotification = async (notificationDetails) => {
    try {
        const response = await apiClient.post('/notify', notificationDetails);
        return response.data; // Expecting { success: boolean, message: string }
    } catch (error) {
        console.error('Error handling payment notification:', error);
        throw error;
    }
};

export const getDirections = async (payload) => {
    try {
        const response = await apiClient.post('/directions', payload);
        return response.data;
    } catch (error) {
        console.error('Error getting directions:', error);
        throw error;
    }
};

export const fetchDrivers = async (payload) => {
    try {
        const response = await apiClient.post('/drivers', payload);
        return response?.data?.drivers || []; // Ensure this matches the expected response structure
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return [];
    }
};

export const fetchDriverSettings = async (userId) => {
    try {
        if(!userId) {
            console.log(`No userId`);
            return;
        }

        const params = { userId };
        const response = await apiClient.get('/driver/settings', { params });
        return response?.data;
    } catch (error) {
        console.error('Error fetching drivers settings:', error);
        return [];
    }
};

export const processPayout = async (payload) => {
    try {
        if(!payload) {
            console.log(`No userId`);
            return;
        }
        const response = await apiClient.post('/payout', payload);
        return response?.data;
    } catch (error) {
        console.error('Error processing payout:', error);
        return [];
    }
};

export const setDriverSettings = async (payload) => {
    try {
        if(!payload) {
            console.log(`No userId`);
            return;
        }
        const response = await apiClient.post('/driver/settings', payload);
        return response?.data;
    } catch (error) {
        console.error('Error settings drivers:', error);
        return [];
    }
};



export const isPaymentValid = (paymentDetails) => {
    try {
      const generatedHash = generateHash(paymentDetails);
      const receivedHash = paymentDetails.Hash?.trim();
      return generatedHash === receivedHash;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  };
  
  // Helper function to generate the hash
  const generateHash = (ozowDto) => {
    const variables = [
      ozowDto.SiteCode,
      ozowDto.TransactionId,
      ozowDto.TransactionReference,
      ozowDto.Amount,
      ozowDto.Status,
      ozowDto.Optional1 || '',
      ozowDto.Optional2 || '',
      ozowDto.Optional3 || '',
      ozowDto.Optional4 || '',
      ozowDto.Optional5 || '',
      ozowDto.CurrencyCode,
      ozowDto.IsTest,
      ozowDto.StatusMessage,
    ];
    const result = `${variables.join('')}${process.env.OZOW_PRIVATE_KEY || '9bc47fe01bbe475a9995a887dcb1e73a'}`?.toLowerCase();
    return crypto.createHash('sha512')?.update(result)?.digest('hex');
  };

// Export the WebSocket service instance
export default apiClient


