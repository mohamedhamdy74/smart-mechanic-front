import { api } from '@/lib/api';
import { User } from '@/types/auth';

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  specialty?: string;
  experienceYears?: number;
  bio?: string;
  availabilityStatus?: 'available' | 'unavailable';
}

export interface UserFilters {
  role?: string;
  location?: string;
  specialty?: string;
  availabilityStatus?: string;
}

class UserService {
  // Get all users with optional filters
  async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `users${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return (response.data as any).users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`users/${id}`);
      return response.data as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  // Update user profile
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await api.put(`users/${id}`, data);
      return response.data as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Update current user profile
  async updateProfile(data: UpdateUserData): Promise<User> {
    try {
      const response = await api.patch('users/profile', data);
      return response.data as User;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Update availability status
  async updateAvailability(status: 'available' | 'unavailable'): Promise<User> {
    try {
      const response = await api.patch('users/availability', { availabilityStatus: status });
      return response.data as User;
    } catch (error) {
      console.error('Error updating availability:', error);
      throw new Error('Failed to update availability');
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Get mechanics by location or specialty
  async getMechanics(filters?: { location?: string; specialty?: string }): Promise<User[]> {
    try {
      const queryParams = new URLSearchParams({ role: 'mechanic' });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `users${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return (response.data as any).users || [];
    } catch (error) {
      console.error('Error fetching mechanics:', error);
      throw new Error('Failed to fetch mechanics');
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{
    totalUsers: number;
    totalMechanics: number;
    totalClients: number;
    activeMechanics: number;
  }> {
    try {
      const response = await api.get('users/stats');
      return response.data as {
        totalUsers: number;
        totalMechanics: number;
        totalClients: number;
        activeMechanics: number;
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }
}

export const userService = new UserService();