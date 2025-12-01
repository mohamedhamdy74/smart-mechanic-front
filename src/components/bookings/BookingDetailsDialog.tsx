import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Booking } from "@/store/slices/bookingsSlice";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  booking,
  open,
  onOpenChange,
}) => {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">تفاصيل الطلب</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-right">
          <div>
            <h4 className="font-bold mb-2">الخدمة المطلوبة</h4>
            <p>{booking.serviceType}</p>
          </div>

          <div>
            <h4 className="font-bold mb-2">بيانات العميل</h4>
            <p>الاسم: {booking.customerId?.name || "غير محدد"}</p>
            <p>الهاتف: {booking.customerId?.phone || "غير محدد"}</p>
            <p>البريد: {booking.customerId?.email || "غير محدد"}</p>
          </div>

          <div>
            <h4 className="font-bold mb-2">بيانات السيارة</h4>
            <p>{booking.carInfo}</p>
            <p>رقم اللوحة: {booking.licensePlate}</p>
          </div>

          <div>
            <h4 className="font-bold mb-2">تاريخ ووقت الموعد</h4>
            <p>
              {new Date(booking.appointmentDate).toLocaleDateString("ar-EG")} في{" "}
              {booking.appointmentTime}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-2">مكان الخدمة</h4>
            <p>{booking.location}</p>
          </div>

          {/* Additional service details can be added here when available */}

          {booking.description && (
            <div>
              <h4 className="font-bold mb-2">وصف المشكلة</h4>
              <p className="text-sm">{booking.description}</p>
            </div>
          )}

          {booking.estimatedCost && (
            <div>
              <h4 className="font-bold mb-2">التكلفة المقدرة</h4>
              <p className="text-sm">{booking.estimatedCost} ج.م</p>
            </div>
          )}

          {booking.actualCost && (
            <div>
              <h4 className="font-bold mb-2">التكلفة الفعلية</h4>
              <p className="text-sm">{booking.actualCost} ج.م</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
