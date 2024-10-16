// store/reducers/webSocketSlice.js
import { createSlice } from '@reduxjs/toolkit';

const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    online: false,
  },
  reducers: {
    setDriverStatus: (state, action) => {
      state.online = action.payload;
    },
  },
});

export const { setDriverStatus } = driverSlice.actions;

export default driverSlice.reducer;
