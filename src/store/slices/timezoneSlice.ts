/**
 * Redux slice for selected timezone state
 * Persists to SQLite via saveLastSelectedTimezone (called from middleware/listener or component)
 */

import { createSlice } from '@reduxjs/toolkit';

interface TimezoneState {
  selectedTimezone: string;
}

const initialState: TimezoneState = {
  selectedTimezone: '',
};

export const timezoneSlice = createSlice({
  name: 'timezone',
  initialState,
  reducers: {
    setSelectedTimezone: (state, action: { payload: string }) => {
      state.selectedTimezone = action.payload;
    },
  },
});

export const { setSelectedTimezone } = timezoneSlice.actions;
