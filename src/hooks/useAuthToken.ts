import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTokens, clearTokens } from '@/store/slices/authSlice';
import { api } from '@/lib/api';

export const useAuthToken = () => {
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken } = useAppSelector(state => state.auth);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!refreshToken) {
      console.log('No refresh token available');
      return null;
    }

    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const newAccessToken = (response.data as { accessToken: string }).accessToken;

      // Update Redux store with new access token
      dispatch(setTokens({
        accessToken: newAccessToken,
        refreshToken: refreshToken // Keep the same refresh token
      }));

      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      dispatch(clearTokens());
      return null;
    }
  }, [refreshToken, dispatch]);

  const setAuthTokens = useCallback((accessToken: string | null, refreshToken: string | null) => {
    dispatch(setTokens({ accessToken, refreshToken }));
  }, [dispatch]);

  const clearAuthTokens = useCallback(() => {
    dispatch(clearTokens());
  }, [dispatch]);

  return {
    accessToken,
    refreshToken,
    refreshAccessToken,
    setAuthTokens,
    clearAuthTokens,
  };
};