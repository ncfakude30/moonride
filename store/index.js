import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import tripReducer from './reducers/tripSlice';
import webSocketReducer from './reducers/webSocketSlice';
import userReducer from './reducers/userSlice';
import confirmationReducer from './reducers/confirmationSlice';
import paymentReducer from './reducers/paymentSlice'; 
import searchReducer from './reducers/searchSlice';
import rideReducer from './reducers/rideReducer';
import trackingReducer from './reducers/trackingReducer';
import driverReducer from './reducers/driverReducer';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        trips: tripReducer,
        user: userReducer,
        webSocket: webSocketReducer,
        confirmation: confirmationReducer,
        payment: paymentReducer,
        search: searchReducer,
        ride: rideReducer,
        tracking: trackingReducer,
        driver: driverReducer,
    },
});