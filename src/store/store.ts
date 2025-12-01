import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Legacy types for backward compatibility
export interface LegacyBookingsState {
  bookings: any[];
  currentBooking: any;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

export interface LegacyRootState extends RootState {
  bookings?: LegacyBookingsState;
  products?: any;
  services?: any;
  chat?: any;
}