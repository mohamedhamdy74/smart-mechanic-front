import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Booking } from '@/types/booking';

interface BookingFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  mechanicId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

interface CreateBookingData {
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

interface UpdateBookingStatusData {
  bookingId: string;
  status: Booking['status'];
  mechanicNotes?: string;
}

interface CompleteBookingData {
  bookingId: string;
  workDescription: string;
  cost: number;
  parts: Array<{ name: string; cost: number }>;
  laborCost: number;
}

// Query Keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: BookingFilters) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

// Fetch all bookings with filters
export const useBookings = (filters: BookingFilters = {}) => {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await api.get(`bookings?${queryParams}`);
      return response.data as { bookings: Booking[]; total: number; page: number; pages: number };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch single booking
export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`bookings/${id}`);
      return response.data as Booking;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const response = await api.post('bookings', data);
      return (response.data as { booking: Booking }).booking;
    },
    onSuccess: (newBooking) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });

      // Add to cache
      queryClient.setQueryData(bookingKeys.detail(newBooking._id), newBooking);
    },
  });
};

// Update booking status mutation
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status, mechanicNotes }: UpdateBookingStatusData) => {
      const response = await api.patch(`bookings/${bookingId}/status`, { status, mechanicNotes });
      return (response.data as { booking: Booking }).booking;
    },
    onSuccess: (updatedBooking) => {
      // Update the booking in cache
      queryClient.setQueryData(bookingKeys.detail(updatedBooking._id), updatedBooking);

      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

// Complete booking mutation
export const useCompleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, workDescription, cost, parts, laborCost }: CompleteBookingData) => {
      const response = await api.post(`bookings/${bookingId}/complete`, {
        workDescription,
        cost,
        parts,
        laborCost,
      });
      return (response.data as { booking: Booking }).booking;
    },
    onSuccess: (completedBooking) => {
      // Update the booking in cache
      queryClient.setQueryData(bookingKeys.detail(completedBooking._id), completedBooking);

      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

// Add review mutation
export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment?: string }) => {
      const response = await api.post(`bookings/${bookingId}/review`, { rating, comment });
      return response.data as Booking;
    },
    onSuccess: (updatedBooking) => {
      // Update the booking in cache
      queryClient.setQueryData(bookingKeys.detail(updatedBooking._id), updatedBooking);

      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
};

// Get booking statistics
export const useBookingStats = (mechanicId?: string) => {
  return useQuery({
    queryKey: [...bookingKeys.all, 'stats', mechanicId],
    queryFn: async () => {
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
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};