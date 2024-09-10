import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // Ensure user is plain data
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
