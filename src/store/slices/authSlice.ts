import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Redux ONLY manages tokens - no user state, no auth operations
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<{ accessToken: string | null; refreshToken: string | null }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      // Update localStorage
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken);
      } else {
        localStorage.removeItem('accessToken');
      }

      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      } else {
        localStorage.removeItem('refreshToken');
      }
    },
    clearTokens(state) {
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setTokens, clearTokens } = authSlice.actions;
export default authSlice.reducer;