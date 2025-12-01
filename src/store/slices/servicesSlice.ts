import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Service {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface ServicesState {
  items: Service[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  isLoading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<Service[]>) => {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addService: (state, action: PayloadAction<Service>) => {
      state.items.push(action.payload);
    },
    updateService: (state, action: PayloadAction<Service>) => {
      const index = state.items.findIndex(s => s._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeService: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(s => s._id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    }
  },
});

export const { 
  setServices, 
  addService, 
  updateService, 
  removeService, 
  setLoading, 
  setError 
} = servicesSlice.actions;

export default servicesSlice.reducer;