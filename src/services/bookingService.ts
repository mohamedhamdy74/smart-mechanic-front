import { api } from '@/lib/api';
import { Booking } from '@/store/slices/bookingsSlice';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface BookingFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  mechanicId?: string;
  customerId?: string;
}

export interface CreateBookingData {
  serviceType: string;
  mechanicId: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  carInfo: string;
  licensePlate: string;
  description?: string;
  estimatedCost?: number;
}

export interface CompleteBookingData {
  workDescription: string;
  cost: number;
  laborCost?: number;
  parts?: string[];
}

class BookingService {
  // Get all bookings with optional filters
  async getBookings(filters?: BookingFilters): Promise<Booking[]> {
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
      const url = `bookings${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return (response.data as any).bookings || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking> {
    try {
      const response = await api.get(`bookings/${id}`);
      return response.data as Booking;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw new Error('Failed to fetch booking');
    }
  }

  // Create new booking
  async createBooking(data: CreateBookingData): Promise<Booking> {
    try {
      const response = await api.post('bookings', data);
      return response.data as Booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<Booking> {
    try {
      const response = await api.patch(`bookings/${bookingId}/status`, { status });
      return response.data as Booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }
  }

  // Complete booking with invoice
  async completeBooking(bookingId: string, data: CompleteBookingData): Promise<Booking> {
    try {
      const response = await api.post(`bookings/${bookingId}/complete`, data);
      return (response.data as any).booking as Booking;
    } catch (error) {
      console.error('Error completing booking:', error);
      throw new Error('Failed to complete booking');
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    try {
      const response = await api.patch(`bookings/${bookingId}/cancel`, { reason });
      return response.data as Booking;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  // Get mechanic's bookings
  async getMechanicBookings(mechanicId: string, filters?: BookingFilters): Promise<Booking[]> {
    try {
      const queryParams = new URLSearchParams({ mechanicId });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `bookings/mechanic${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return (response.data as any).bookings || [];
    } catch (error) {
      console.error('Error fetching mechanic bookings:', error);
      throw new Error('Failed to fetch mechanic bookings');
    }
  }

  // Get customer's bookings
  async getCustomerBookings(customerId: string, filters?: BookingFilters): Promise<Booking[]> {
    try {
      const queryParams = new URLSearchParams({ customerId });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `bookings/customer${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return (response.data as any).bookings || [];
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw new Error('Failed to fetch customer bookings');
    }
  }

  // Add review to booking
  async addReview(bookingId: string, rating: number, comment?: string): Promise<Booking> {
    try {
      const response = await api.post(`bookings/${bookingId}/review`, {
        rating,
        comment,
      });
      return response.data as Booking;
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error('Failed to add review');
    }
  }

  // Get booking statistics
  async getBookingStats(mechanicId?: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    completed: number;
    cancelled: number;
    averageRating: number;
  }> {
    try {
      const url = mechanicId ? `bookings/stats/${mechanicId}` : 'bookings/stats';
      const response = await api.get(url);
      return response.data as {
        total: number;
        pending: number;
        accepted: number;
        completed: number;
        cancelled: number;
        averageRating: number;
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw new Error('Failed to fetch booking statistics');
    }
  }
}

export const bookingService = new BookingService();