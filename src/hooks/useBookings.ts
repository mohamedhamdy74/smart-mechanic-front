import { useState } from 'react';
import {
  useBookings as useBookingsQuery,
  useBooking as useBookingQuery,
  useCreateBooking,
  useUpdateBookingStatus,
  useCompleteBooking,
  useAddReview,
  useBookingStats,
} from '@/hooks/queries/useBookingsQueries';
import { Booking, BookingFilters } from '@/types/booking';

interface CreateBookingRequest {
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

export const useBookings = () => {
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);

  // React Query hooks
  const bookingsQuery = useBookingsQuery();
  const currentBookingQuery = useBookingQuery(currentBookingId || '');
  const createBookingMutation = useCreateBooking();
  const updateStatusMutation = useUpdateBookingStatus();
  const completeBookingMutation = useCompleteBooking();
  const addReviewMutation = useAddReview();

  // Legacy compatibility methods
  const getBookings = async (filters?: BookingFilters, page = 1, limit = 10) => {
    // This is now handled by React Query automatically
    // Just return success since data is managed by the query
    return true;
  };

  const getBookingById = async (bookingId: string) => {
    setCurrentBookingId(bookingId);
    return true;
  };

  const createNewBooking = async (bookingData: CreateBookingRequest) => {
    try {
      await createBookingMutation.mutateAsync(bookingData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateStatus = async (bookingId: string, status: Booking['status'], mechanicNotes?: string) => {
    try {
      await updateStatusMutation.mutateAsync({ bookingId, status, mechanicNotes });
      return true;
    } catch (error) {
      return false;
    }
  };

  const completeService = async (
    bookingId: string,
    workDescription: string,
    cost: number,
    parts: Array<{ name: string; cost: number }>,
    laborCost: number
  ) => {
    try {
      await completeBookingMutation.mutateAsync({
        bookingId,
        workDescription,
        cost,
        parts,
        laborCost,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const addReview = async (bookingId: string, rating: number, comment?: string) => {
    try {
      await addReviewMutation.mutateAsync({ bookingId, rating, comment });
      return true;
    } catch (error) {
      return false;
    }
  };

  const clearBookingError = () => {
    // React Query handles errors automatically
    // This method is kept for compatibility
  };

  const setBooking = (booking: Booking | null) => {
    setCurrentBookingId(booking?._id || null);
  };

  return {
    // Data
    bookings: bookingsQuery.data?.bookings || [],
    currentBooking: currentBookingQuery.data || null,
    total: bookingsQuery.data?.total || 0,
    page: bookingsQuery.data?.page || 1,
    pages: bookingsQuery.data?.pages || 0,

    // Loading states
    loading: bookingsQuery.isLoading || currentBookingQuery.isLoading,
    creating: createBookingMutation.isPending,
    updating: updateStatusMutation.isPending,
    completing: completeBookingMutation.isPending,
    reviewing: addReviewMutation.isPending,

    // Error states
    error: bookingsQuery.error?.message ||
           currentBookingQuery.error?.message ||
           createBookingMutation.error?.message ||
           updateStatusMutation.error?.message ||
           completeBookingMutation.error?.message ||
           addReviewMutation.error?.message || null,

    // Methods
    getBookings,
    getBookingById,
    createNewBooking,
    updateStatus,
    completeService,
    addReview,
    clearError: clearBookingError,
    setCurrentBooking: setBooking,

    // React Query specific
    refetchBookings: bookingsQuery.refetch,
    refetchCurrentBooking: currentBookingQuery.refetch,
  };
};