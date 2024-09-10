// store/reducers/webSocketSlice.js
import { createSlice } from '@reduxjs/toolkit';

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState: {
    status: 'disconnected', // Added status to track connection state
    error: null, // Added error to store WebSocket errors
    messages: [], // Added messages to store received messages
  },
  reducers: {
    setWebSocket: (state, action) => {
      state.ws = action.payload;
    },
    clearMessages: (state) => {
        console.log(`Messages to clear: ${JSON.stringify(state.messages)}`);
        state.messages = [];
    },
    clearWebSocket: (state) => {
      if (state.ws) {
        state.ws.close();
        state.ws = null;
      }
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setWebSocket, clearWebSocket, setStatus, addMessage, setError } = webSocketSlice.actions;

export default webSocketSlice.reducer;
