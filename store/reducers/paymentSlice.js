import { createSlice } from '@reduxjs/toolkit';

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        status: null,
    },
    reducers: {
        setPaymentStatus: (state, action) => {
            state.status = action.payload;
        },
    },
});

export const { setPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;
