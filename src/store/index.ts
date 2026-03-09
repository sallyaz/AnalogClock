/**
 * Redux store configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { timezoneApi } from './api/timezoneApi';
import { timezoneSlice } from './slices/timezoneSlice';

export const store = configureStore({
  reducer: {
    [timezoneApi.reducerPath]: timezoneApi.reducer,
    timezone: timezoneSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(timezoneApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
