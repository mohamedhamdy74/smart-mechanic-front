import { useState } from 'react';
import { api } from '@/lib/api';

export const useUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvailability = async (status: 'available' | 'unavailable') => {
    setIsLoading(true);
    setError(null);

    try {
      await api.patch('/users/availability', { availabilityStatus: status });
      return true;
    } catch (error: any) {
      console.error('Failed to update availability:', error);
      setError(error.response?.data?.message || 'Failed to update availability');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.patch('/users/profile', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserById = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      setError(error.response?.data?.message || 'Failed to fetch user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateAvailability,
    updateProfile,
    getUserById,
    isLoading,
    error,
  };
};