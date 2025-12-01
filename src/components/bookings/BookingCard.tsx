import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Star, Check, X, Eye } from "lucide-react";
import { Booking } from "@/store/slices/bookingsSlice";
import { BOOKING_STATUS_LABELS } from "@/utils/constants";

interface BookingCardProps {
  booking: Booking;
  onAccept?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onStartService?: (bookingId: string) => void;
  onCompleteService?: (bookingId: string) => void;
  onViewDetails?: (booking: Booking) => void;
  showActions?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onAccept,
  onReject,
  onStartService,
  onCompleteService,
  onViewDetails,
  showActions = true,
}) => {
  const getStatusVariant = (status: Booking["status"]) => {
    switch (status) {
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      case "in_progress":
        return "secondary";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="p-4 rounded-xl border border-border hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="text-right flex-1">
          <h3 className="font-bold text-lg mb-1">{booking.serviceType}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {booking.customerId?.name || "عميل"}
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-primary" />
              {new Date(booking.appointmentDate).toLocaleDateString("ar-EG")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-primary" />
              {booking.appointmentTime}
            </span>
          </div>
          <p className="flex items-center gap-1 text-sm mt-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {booking.location}
          </p>
        </div>
        <Badge variant={getStatusVariant(booking.status)} className="mr-2">
          {BOOKING_STATUS_LABELS[booking.status] || booking.status}
        </Badge>
      </div>

      <div className="flex gap-2">
        {showActions && booking.status === "pending" && (
          <>
            <Button
              size="sm"
              className="rounded-full flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onAccept?.(booking._id)}
            >
              <Check className="h-4 w-4 ml-1" />
              قبول
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => onReject?.(booking._id)}
            >
              <X className="h-4 w-4 ml-1" />
              رفض
            </Button>
          </>
        )}

        {showActions && booking.status === "accepted" && (
          <>
            <Button
              size="sm"
              className="rounded-full flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => onStartService?.(booking._id)}
            >
              <Clock className="h-4 w-4 ml-1" />
              بدء الخدمة
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => onViewDetails?.(booking)}
            >
              <Eye className="h-4 w-4 ml-1" />
              تفاصيل
            </Button>
          </>
        )}

        {showActions && booking.status === "in_progress" && (
          <>
            <Button
              size="sm"
              className="rounded-full flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onCompleteService?.(booking._id)}
            >
              <Check className="h-4 w-4 ml-1" />
              إنهاء الخدمة
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => onViewDetails?.(booking)}
            >
              <Eye className="h-4 w-4 ml-1" />
              تفاصيل
            </Button>
          </>
        )}

        {booking.status === "completed" && (
          <>
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <Check className="h-4 w-4" />
              <span>تم الانتهاء</span>
            </div>
            {booking.reviews && booking.reviews.length > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  {Array.from({ length: booking.reviews[0].rating }).map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-yellow-500 text-yellow-500"
                      />
                    )
                  )}
                  <span className="text-xs font-medium">
                    {booking.reviews[0].rating}/5
                  </span>
                </div>
                {booking.reviews[0].comment && (
                  <p className="text-xs text-muted-foreground italic">
                    "{booking.reviews[0].comment}"
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {!showActions && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => onViewDetails?.(booking)}
          >
            <Eye className="h-4 w-4 ml-1" />
            تفاصيل
          </Button>
        )}
      </div>
    </Card>
  );
};
