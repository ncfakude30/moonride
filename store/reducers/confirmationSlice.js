import { createSlice } from '@reduxjs/toolkit';

const confirmationSlice = createSlice({
    name: 'confirmation',
    initialState: {
        pickupCoordinates: [0, 0],
        dropoffCoordinates: [0, 0],
        selectedCar: null,
        loggedUser: null,
        loading: false,
    },
    reducers: {
        setPickupCoordinates(state, action) {
            state.pickupCoordinates = action.payload;
        },
        setDropoffCoordinates(state, action) {
            state.dropoffCoordinates = action.payload;
        },
        setSelectedCar(state, action) {
            state.selectedCar = action.payload;
        },
        setLoggedUser(state, action) {
            state.loggedUser = action.payload;
        },
        setLoading(state, action)  {
            state.loading = action.payload;
        }
    },
});

export const { setPickupCoordinates, setDropoffCoordinates, setSelectedCar, setLoggedUser, setLoading } = confirmationSlice.actions;
export default confirmationSlice.reducer;
