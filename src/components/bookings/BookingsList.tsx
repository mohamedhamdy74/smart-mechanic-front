import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Check,
  X,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { BOOKING_STATUS_LABELS } from '@/utils/constants';
import { formatDate, getStatusColor, getStatusTextColor } from '@/utils/apiHelpers';
import { Booking } from '@/store/slices/bookingsSlice';

interface BookingsListProps {
  bookings: Booking[];
  isLoading: boolean;
  onStatusUpdate: (bookingId: string, status: Booking['status']) => void;
  onViewDetails: (booking: Booking) => void;
  onCompleteBooking: (booking: Booking) => void;
  emptyMessage?: string;
}

export const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  isLoading,
  onStatusUpdate,
  onViewDetails,
  onCompleteBooking,
  emptyMessage = 'لا توجد طلبات'
}) => {
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
        <span className="mr-2">جاري تحميل الطلبات...</span>
      </div>
    );
  }

  if (sortedBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedBookings.map((booking) => (
        <Card key={booking._id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 text-right">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-lg">{booking.serviceType}</h3>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(booking.status)} text-white`}
                >
                  {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {booking.customerId?.name || 'عميل'}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formatDate(booking.appointmentDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{booking.appointmentTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{booking.location}</span>
                </div>
              </div>

              {booking.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {booking.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onStatusUpdate(booking._id, 'accepted')}
                >
                  <Check className="h-4 w-4 ml-1" />
                  قبول
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => onStatusUpdate(booking._id, 'rejected')}
                >
                  <X className="h-4 w-4 ml-1" />
                  رفض
                </Button>
              </>
            )}

            {booking.status === 'accepted' && (
              <>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => onStatusUpdate(booking._id, 'in_progress')}
                >
                  <Clock className="h-4 w-4 ml-1" />
                  بدء الخدمة
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(booking)}
                >
                  <Eye className="h-4 w-4 ml-1" />
                  تفاصيل
                </Button>
              </>
            )}

            {booking.status === 'in_progress' && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onCompleteBooking(booking)}
                >
                  <Check className="h-4 w-4 ml-1" />
                  إنهاء الخدمة
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(booking)}
                >
                  <Eye className="h-4 w-4 ml-1" />
                  تفاصيل
                </Button>
              </>
            )}

            {booking.status === 'completed' && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <Check className="h-4 w-4" />
                <span>تم الانتهاء</span>
                {booking.reviews && booking.reviews.length > 0 && (
                  <div className="flex items-center gap-1 mr-4">
                    {Array.from({ length: booking.reviews[0].rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    ))}
                    <span className="text-xs">({booking.reviews[0].rating}/5)</span>
                  </div>
                )}
              </div>
            )}

            {booking.status !== 'pending' && booking.status !== 'accepted' && booking.status !== 'in_progress' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(booking)}
              >
                <Eye className="h-4 w-4 ml-1" />
                تفاصيل
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
