import { createSlice } from '@reduxjs/toolkit';

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        status: null,
        paymentResponse: {
            paymentUrl: null,
            paymentId: null,
        }, 
        callback: null,
    },
    reducers: {
        setPaymentStatus: (state, action) => {
            state.status = action.payload;
        },
        setPaymentResponse: (state, action) => {
            state.paymentResponse = action.payload;
        },
        setPaymentCallback: (state, action) => {
            state.callback = action.payload;
        }
    },
});

export const { setPaymentStatus, setPaymentResponse } = paymentSlice.actions;
export default paymentSlice.reducer;
