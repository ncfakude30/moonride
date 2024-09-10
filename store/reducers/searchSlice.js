// store/slices/searchSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const searchSlice = createSlice({
    name: 'search',
    initialState: {
        pickup: '',
        dropoff: '',
        user: null,
        pickupMarker: null,
        dropoffMarker: null,
        userLocationMarker: null,
        polyline: null,
    },
    reducers: {
        setPickup: (state, action) => {
            state.pickup = action.payload;
        },
        setDropoff: (state, action) => {
            state.dropoff = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setPickupMarker: (state, action) => {
            state.pickupMarker = action.payload;
        },
        setDropoffMarker: (state, action) => {
            state.dropoffMarker = action.payload;
        },
        setUserLocationMarker: (state, action) => {
            state.userLocationMarker = action.payload;
        },
        setPolyline: (state, action) => {
            state.polyline = action.payload;
        },
    },
});

export const {
    setPickup,
    setDropoff,
    setUser,
    setPickupMarker,
    setDropoffMarker,
    setUserLocationMarker,
    setPolyline,
} = searchSlice.actions;

export default searchSlice.reducer;
