import { createSlice } from '@reduxjs/toolkit';

const tripSlice = createSlice({
    name: 'trips',
    initialState: {
        trips: [],
        lastEvaluatedKey: null,
        hasMore: true,
        loading: false,
        error: null,
        hasNotification: true,
    },
    reducers: {
        setTrips(state, action) {
            state.trips = action.payload.trips;
            state.lastEvaluatedKey = action.payload.lastEvaluatedKey;
            state.hasMore = action.payload.hasMore;
        },
        appendTrips(state, action) {
            state.trips = [...state.trips, ...action.payload.trips];
            state.lastEvaluatedKey = action.payload.lastEvaluatedKey;
            state.hasMore = action.payload.hasMore;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        setNotification(state, action) {
            state.hasNotification =action.payload;
        }
    },
});

export const { setTrips, appendTrips, setLoading, setError, setNotification } = tripSlice.actions;
export default tripSlice.reducer;
