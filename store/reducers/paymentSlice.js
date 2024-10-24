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
        complete: false,
        transactions: [],
        lastEvaluatedKey: null,
        hasMore: false,
        loading: false,
        error: null,
    },
    reducers: {
        
        setTransactions(state, action) {
            state.transactions = action.payload.transactions;
            state.lastEvaluatedKey = action.payload.lastEvaluatedKey;
            state.hasMore = action.payload.hasMore;
        },
        appendTransactions(state, action) {
            state.transactions = [...state.transactions, ...action.payload.transactions];
            state.lastEvaluatedKey = action.payload.lastEvaluatedKey;
            state.hasMore = action.payload.hasMore;
        },
        setPaymentStatus: (state, action) => {
            state.status = action.payload;
        },
        setPaymentResponse: (state, action) => {
            state.paymentResponse = action.payload;
        },
        setPaymentCallback: (state, action) => {
            state.callback = action.payload;
        },
        setPaymentComplete: (state, action) => {
            state.callback = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        }
    },
});

export const { appendTransactions, setPaymentCallback, setLoading, setError, setPaymentStatus, 
    setPaymentResponse, setPaymentComplete, setTransactions } = paymentSlice.actions;
export default paymentSlice.reducer;
