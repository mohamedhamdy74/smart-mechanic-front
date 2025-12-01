import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Booking } from '@/types/booking';
import { api } from '@/lib/api';

interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

const initialState: BookingsState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 0,
};

// Async thunks
export const fetchBookings = createAsyncThunk<
  { bookings: Booking[]; total: number; page: number; pages: number },
  { filters?: Record<string, string | number | boolean>; page?: number; limit?: number },
  { state: RootState; rejectValue: string }
>(
  'bookings/fetchBookings',
  async ({ filters = {}, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await api.get(`bookings?${queryParams}`);
      return response.data as { bookings: Booking[]; total: number; page: number; pages: number };
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch bookings';
      return rejectWithValue(message);
    }
  }
);

export const fetchBookingById = createAsyncThunk<
  Booking,
  string,
  { state: RootState; rejectValue: string }
>(
  'bookings/fetchBookingById',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.get(`bookings/${bookingId}`);
      return response.data as Booking;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch booking';
      return rejectWithValue(message);
    }
  }
);

export const createBooking = createAsyncThunk<
  Booking,
  Record<string, unknown>,
  { state: RootState; rejectValue: string }
>(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post('bookings', bookingData);
      return (response.data as { booking: Booking }).booking;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create booking';
      return rejectWithValue(message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk<
  Booking,
  { bookingId: string; status: Booking['status']; mechanicNotes?: string },
  { state: RootState; rejectValue: string }
>(
  'bookings/updateBookingStatus',
  async ({ bookingId, status, mechanicNotes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`bookings/${bookingId}/status`, { status, mechanicNotes });
      return (response.data as { booking: Booking }).booking;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to update booking status';
      return rejectWithValue(message);
    }
  }
);

export const completeBooking = createAsyncThunk<
  Booking,
  { bookingId: string; workDescription: string; cost: number; parts: Array<{ name: string; cost: number }>; laborCost: number },
  { state: RootState; rejectValue: string }
>(
  'bookings/completeBooking',
  async ({ bookingId, workDescription, cost, parts, laborCost }, { rejectWithValue }) => {
    try {
      const response = await api.post(`bookings/${bookingId}/complete`, { workDescription, cost, parts, laborCost });
      return (response.data as { booking: Booking }).booking;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to complete booking';
      return rejectWithValue(message);
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setCurrentBooking(state, action: PayloadAction<Booking | null>) {
      state.currentBooking = action.payload;
    },
    updateBookingInList(state, action: PayloadAction<Booking>) {
      const index = state.bookings.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch bookings';
      })
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch booking';
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create booking';
      })
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?._id === action.payload._id) {
          state.currentBooking = action.payload;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update booking status';
      })
      .addCase(completeBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?._id === action.payload._id) {
          state.currentBooking = action.payload;
        }
      })
      .addCase(completeBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to complete booking';
      });
  },
});

export const { clearError, setCurrentBooking, updateBookingInList } = bookingsSlice.actions;
export default bookingsSlice.reducer;