import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext'; // Import the auth context

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const user = useAuth(); // Get the current user
    const [ws, setWs] = useState(null);

    useEffect(() => {
        if (user) {
            //https://ufqmmf6blc.execute-api.us-east-1.amazonaws.com/dev
            // Create WebSocket connection if the user is authenticated
            const socket = new WebSocket('ws://ufqmmf6blc.execute-api.us-east-1.amazonaws.com/dev');
            setWs(socket);

            socket.onopen = () => {
                console.log('WebSocket connected');
            };

            socket.onclose = () => {
                console.log('WebSocket disconnected');
                setWs(null);
            };

            socket.onmessage = (event) => {
                console.log('Message received:', event.data);
            };

            return () => {
                socket.close();
            };
        } else {
            setWs(null);
        }
    }, [user]);

    const sendMessage = (message) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };

    return (
        <WebSocketContext.Provider value={{ ws, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
