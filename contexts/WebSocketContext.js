// contexts/WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStatus, addMessage, setError, clearMessages } from '../store/reducers/webSocketSlice';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const dispatch = useDispatch();
    const status = useSelector((state) => state.webSocket.status);
    const messages = useSelector((state) => state.webSocket.messages);
    const user = useSelector((state) => state.auth.user);

    // Use ref to store the WebSocket instance
    const socketRef = useRef(null);

    useEffect(() => {
        if (user && (user?.id || user?.uuid)) {
            // Initialize WebSocket connection
            socketRef.current = new WebSocket(
                `${process.env.WEBSOCKET_URL || 'wss://j4a86rv3rd.execute-api.us-east-1.amazonaws.com/dev/'}?userId=${user?.id || user?.uuid}`
            );

            const socket = socketRef.current;

            socket.onopen = () => {
                console.log('WebSocket connected');
                dispatch(setStatus('connected'));
            };

            socket.onclose = () => {
                console.log('WebSocket disconnected');
                dispatch(setStatus('disconnected'));
            };

            socket.onmessage = (event) => {
                console.log('Message received:', JSON.stringify(event.data));
                dispatch(addMessage(event.data));
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                dispatch(setError(error.message));
            };
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            dispatch(setStatus('disconnected'));
            //dispatch(clearMessages());
        };
    }, [user, dispatch]);

    const sendMessage = (message) => {
        const socket = socketRef.current;
        if (socket && status === 'connected') {
            socket.send(JSON.stringify({ ...message, userId: user?.id || user?.uuid }));
        } else {
            console.error('WebSocket is not connected');
        }
    };

    return (
        <WebSocketContext.Provider value={{ sendMessage, status, messages }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
