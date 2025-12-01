import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  User,
  Wrench,
  TrendingUp,
  Eye,
  Check,
  X,
  AlertTriangle,
  Edit,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useQuery } from "@tanstack/react-query";
import MapComponent from "@/features/map/MapComponent";
import { Skeleton } from "@/components/ui/skeleton";

const MechanicProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [mechanicLocation, setMechanicLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load user data using React Query
  const { data: userProfileData, isLoading: userLoadingQuery, error: userQueryError } = useQuery({
    queryKey: ['user-profile', user?._id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/users/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("فشل في تحميل بيانات المستخدم");
      }

      const userProfile = await response.json();
      return {
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        location: userProfile.location,
        specialty: userProfile.specialty,
        experienceYears: userProfile.experienceYears,
        bio: userProfile.bio,
        rating: userProfile.rating || 0,
        totalBookings: userProfile.totalBookings || 0,
        completedBookings: userProfile.completedBookings || 0,
        totalEarnings: userProfile.totalEarnings || 0,
        responseTime: userProfile.responseTime || 0,
        acceptanceRate: userProfile.acceptanceRate || 100,
        joinDate: new Date(userProfile.createdAt).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
        }),
        availabilityStatus: userProfile.availabilityStatus || "available",
        latitude: userProfile.latitude,
        longitude: userProfile.longitude,
        lastLocationUpdate: userProfile.lastLocationUpdate,
      };
    },
    enabled: !!user?._id,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Load bookings using React Query
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsQueryError } = useQuery({
    queryKey: ['mechanic-bookings', user?._id],
    queryFn: async () => {
      const response = await fetch("http://localhost:5000/bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("فشل في تحميل الحجوزات");
      }

      const data = await response.json();
      return data.bookings || [];
    },
    enabled: !!user?._id,
    staleTime: 15000, // Consider bookings data fresh for 15 seconds
  });

  // Update local state when data changes
  useEffect(() => {
    if (userProfileData) {
      setUserData(userProfileData);
      setAvailabilityStatus(userProfileData.availabilityStatus || "available");
    }
  }, [userProfileData]);

  useEffect(() => {
    if (bookingsData) {
      setBookings(bookingsData);
    }
  }, [bookingsData]);

  // Handle loading and error states
  useEffect(() => {
    setUserLoading(userLoadingQuery);
    setLoading(bookingsLoading);
    if (userQueryError) {
      setUserError(userQueryError.message);
    }
    if (bookingsQueryError) {
      console.error("Error fetching bookings:", bookingsQueryError);
    }
  }, [userLoadingQuery, bookingsLoading, userQueryError, bookingsQueryError]);

  const handleBookingAction = async (
    bookingId: string,
    action: "accepted" | "rejected" | "in_progress" | "completed"
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: action }),
        }
      );

      if (response.ok) {
        // Update local state
        const updatedBookings = bookings.map((booking: any) => {
          if (booking._id === bookingId) {
            return { ...booking, status: action };
          }
          return booking;
        });
        setBookings(updatedBookings);

        toast.success(
          action === "accepted"
            ? "تم قبول الطلب بنجاح"
            : action === "rejected"
              ? "تم رفض الطلب"
              : action === "in_progress"
                ? "تم بدء الخدمة"
                : action === "completed"
                  ? "تم إنهاء الخدمة بنجاح"
                  : "تم تحديث حالة الطلب"
        );
        setSelectedBooking(null);
      } else {
        toast.error("فشل في تحديث حالة الطلب");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("حدث خطأ في تحديث حالة الطلب");
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">
              جاري تحميل بيانات الملف الشخصي...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (userError || !userData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              حدث خطأ في تحميل البيانات
            </h3>
            <p className="text-muted-foreground mb-4">
              {userError || "لم يتم العثور على بيانات المستخدم"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="rounded-full"
            >
              إعادة المحاولة
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-primary/10 via-orange-500/5 to-background rounded-3xl p-10 mb-10 animate-bounce-in shadow-2xl border border-border/50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="text-center md:text-right flex-1">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  {userData.name}
                </h1>
                <p className="text-muted-foreground mb-3 text-lg">
                  {user?.level || "ميكانيكي جديد"}
                </p>
                <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({
                      length: Math.floor(userData.rating || 0),
                    }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                    {Array.from({
                      length: 5 - Math.floor(userData.rating || 0),
                    }).map((_, i) => (
                      <Star
                        key={`empty-${i}`}
                        className="h-5 w-5 text-gray-300"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">
                    {userData.rating?.toFixed(1) || "0.0"} (
                    {
                      bookings.filter(
                        (b) =>
                          b.status === "completed" &&
                          b.reviews &&
                          b.reviews.length > 0
                      ).length
                    }{" "}
                    تقييم)
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Badge variant="secondary">
                    {userData.specialty || "صيانة عامة"}
                  </Badge>
                  <Badge variant="secondary">
                    {userData.experienceYears
                      ? `${userData.experienceYears} سنوات خبرة`
                      : "خبرة متنوعة"}
                  </Badge>
                  <Badge variant="secondary">عضو منذ {userData.joinDate}</Badge>
                </div>
                {userData.bio && (
                  <p className="text-muted-foreground mt-2 text-right">
                    {userData.bio}
                  </p>
                )}
              </div>
              <Button
                className="rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 text-white font-semibold px-8 py-6 text-lg hover-lift transition-all duration-300 shadow-lg"
                onClick={() => navigate("/chat")}
              >
                <MessageCircle className="h-6 w-6 ml-2" />
                محادثاتي
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-8">
                <Card className="p-8 text-center animate-slide-up shadow-xl border-border/50 bg-gradient-to-br from-primary/5 to-background dark:bg-gray-900/90 dark:from-gray-900/50 dark:to-gray-800/30 transition-colors duration-300">
                  <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-4xl font-bold text-primary mb-2">
                    {userData?.completedBookings || 0}
                  </p>
                  <p className="text-base text-muted-foreground font-medium">
                    خدمات منفذة
                  </p>
                </Card>
                <Card
                  className="p-8 text-center animate-slide-up shadow-xl border-border/50 bg-gradient-to-br from-orange-500/5 to-background"
                  style={{ animationDelay: "0.1s" }}
                >
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-4xl font-bold text-primary mb-2">
                    {bookings.filter((b) => b.status === "accepted").length}
                  </p>
                  <p className="text-base text-muted-foreground font-medium">
                    مواعيد مجدولة
                  </p>
                </Card>
                <Card
                  className="p-8 text-center animate-slide-up shadow-xl border-border/50 bg-gradient-to-br from-green-500/5 to-background"
                  style={{ animationDelay: "0.2s" }}
                >
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-4xl font-bold text-primary mb-2">
                    {userData?.rating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-base text-muted-foreground font-medium">
                    متوسط التقييم
                  </p>
                </Card>
              </div>

              {/* Upcoming Appointments */}
              <Card
                className="p-6 animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <h2 className="text-2xl font-bold mb-6 text-right">
                  المواعيد القادمة
                </h2>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        جاري تحميل الطلبات...
                      </p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        لا توجد طلبات قادمة
                      </p>
                    </div>
                  ) : (
                    bookings.map((booking: any, index: number) => (
                      <div
                        key={booking._id}
                        className="p-4 rounded-xl border border-border hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-right flex-1">
                            <h3 className="font-bold text-lg mb-1">
                              {booking.serviceType}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {booking.customerId?.name || "عميل"}
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-primary" />
                                {new Date(
                                  booking.appointmentDate
                                ).toLocaleDateString("ar-EG")}
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
                          <Badge
                            variant={
                              booking.status === "accepted"
                                ? "default"
                                : booking.status === "rejected"
                                  ? "destructive"
                                  : booking.status === "in_progress"
                                    ? "secondary"
                                    : booking.status === "completed"
                                      ? "default"
                                      : "secondary"
                            }
                            className="mr-2"
                          >
                            {booking.status === "pending"
                              ? "قيد الانتظار"
                              : booking.status === "accepted"
                                ? "مؤكد"
                                : booking.status === "rejected"
                                  ? "مرفوض"
                                  : booking.status === "in_progress"
                                    ? "قيد التنفيذ"
                                    : booking.status === "completed"
                                      ? "مكتمل"
                                      : booking.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                className="rounded-full flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  handleBookingAction(booking._id, "accepted")
                                }
                              >
                                <Check className="h-4 w-4 ml-1" />
                                قبول
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleBookingAction(booking._id, "rejected")
                                }
                              >
                                <X className="h-4 w-4 ml-1" />
                                رفض
                              </Button>
                            </>
                          ) : booking.status === "accepted" ? (
                            <>
                              <Button
                                size="sm"
                                className="rounded-full flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() =>
                                  handleBookingAction(
                                    booking._id,
                                    "in_progress"
                                  )
                                }
                              >
                                <Clock className="h-4 w-4 ml-1" />
                                بدء الخدمة
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => setSelectedBooking(booking)}
                                  >
                                    <Eye className="h-4 w-4 ml-1" />
                                    تفاصيل
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-right">
                                      تفاصيل الطلب
                                    </DialogTitle>
                                  </DialogHeader>
                                  {selectedBooking && (
                                    <div className="space-y-4 text-right">
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          الخدمة المطلوبة
                                        </h4>
                                        <p>{selectedBooking.serviceType}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          بيانات العميل
                                        </h4>
                                        <p>
                                          الاسم:{" "}
                                          {selectedBooking.customerId?.name ||
                                            "غير محدد"}
                                        </p>
                                        <p>
                                          الهاتف:{" "}
                                          {selectedBooking.customerId?.phone ||
                                            "غير محدد"}
                                        </p>
                                        <p>
                                          البريد:{" "}
                                          {selectedBooking.customerId?.email ||
                                            "غير محدد"}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          بيانات السيارة
                                        </h4>
                                        <p>{selectedBooking.carInfo}</p>
                                        <p>
                                          رقم اللوحة:{" "}
                                          {selectedBooking.licensePlate}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          تاريخ ووقت الموعد
                                        </h4>
                                        <p>
                                          {new Date(
                                            selectedBooking.appointmentDate
                                          ).toLocaleDateString("ar-EG")}{" "}
                                          في {selectedBooking.appointmentTime}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          مكان الخدمة
                                        </h4>
                                        <p>{selectedBooking.location}</p>
                                      </div>
                                      {selectedBooking.description && (
                                        <div>
                                          <h4 className="font-bold mb-2">
                                            وصف المشكلة
                                          </h4>
                                          <p className="text-sm">
                                            {selectedBooking.description}
                                          </p>
                                        </div>
                                      )}
                                      {selectedBooking.estimatedCost && (
                                        <div>
                                          <h4 className="font-bold mb-2">
                                            التكلفة المقدرة
                                          </h4>
                                          <p className="text-sm">
                                            {selectedBooking.estimatedCost} ج.م
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </>
                          ) : booking.status === "in_progress" ? (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="rounded-full flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-4 w-4 ml-1" />
                                    إنهاء الخدمة
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-right">
                                      إنهاء الخدمة وإنشاء الفاتورة
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 text-right">
                                    <div>
                                      <h4 className="font-bold mb-2">
                                        تفاصيل الخدمة
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {booking.serviceType}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        العميل: {booking.customerId?.name}
                                      </p>
                                    </div>

                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-sm font-medium mb-1">
                                          وصف العمل المنجز
                                        </label>
                                        <textarea
                                          className="w-full p-2 border rounded-md text-right"
                                          rows={3}
                                          placeholder="وصف العمل الذي تم إنجازه..."
                                          id={`workDescription-${booking._id}`}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium mb-1">
                                          التكلفة الإجمالية (ج.م)
                                        </label>
                                        <input
                                          type="number"
                                          className="w-full p-2 border rounded-md text-right"
                                          placeholder="0"
                                          id={`totalCost-${booking._id}`}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium mb-1">
                                          تكلفة العمالة (ج.م)
                                        </label>
                                        <input
                                          type="number"
                                          className="w-full p-2 border rounded-md text-right"
                                          placeholder="0"
                                          id={`laborCost-${booking._id}`}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium mb-1">
                                          القطع المستخدمة (اختياري)
                                        </label>
                                        <textarea
                                          className="w-full p-2 border rounded-md text-right"
                                          rows={2}
                                          placeholder="قائمة بالقطع المستخدمة..."
                                          id={`parts-${booking._id}`}
                                        />
                                      </div>
                                    </div>

                                    <div className="flex gap-2 justify-end pt-4">
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          // Close dialog logic
                                          const dialog =
                                            document.querySelector(
                                              `[data-state="open"]`
                                            );
                                          if (dialog)
                                            dialog.setAttribute(
                                              "data-state",
                                              "closed"
                                            );
                                        }}
                                        className="rounded-full"
                                      >
                                        إلغاء
                                      </Button>
                                      <Button
                                        onClick={async () => {
                                          const workDescription = (
                                            document.getElementById(
                                              `workDescription-${booking._id}`
                                            ) as HTMLTextAreaElement
                                          )?.value;
                                          const totalCost = (
                                            document.getElementById(
                                              `totalCost-${booking._id}`
                                            ) as HTMLInputElement
                                          )?.value;
                                          const laborCost = (
                                            document.getElementById(
                                              `laborCost-${booking._id}`
                                            ) as HTMLInputElement
                                          )?.value;
                                          const parts = (
                                            document.getElementById(
                                              `parts-${booking._id}`
                                            ) as HTMLTextAreaElement
                                          )?.value;

                                          if (!workDescription || !totalCost) {
                                            toast.error(
                                              "يرجى إدخال وصف العمل والتكلفة الإجمالية"
                                            );
                                            return;
                                          }

                                          try {
                                            const response = await fetch(
                                              `http://localhost:5000/bookings/${booking._id}/complete`,
                                              {
                                                method: "POST",
                                                headers: {
                                                  Authorization: `Bearer ${localStorage.getItem(
                                                    "accessToken"
                                                  )}`,
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                                body: JSON.stringify({
                                                  workDescription,
                                                  cost: parseFloat(totalCost),
                                                  laborCost:
                                                    parseFloat(laborCost) || 0,
                                                  parts: parts
                                                    ? parts
                                                      .split(",")
                                                      .map((p) => p.trim())
                                                    : [],
                                                }),
                                              }
                                            );

                                            if (response.ok) {
                                              const result =
                                                await response.json();
                                              // Update local state
                                              const updatedBookings =
                                                bookings.map((b: any) => {
                                                  if (b._id === booking._id) {
                                                    return {
                                                      ...b,
                                                      status: "completed",
                                                      invoice: result.invoice,
                                                    };
                                                  }
                                                  return b;
                                                });
                                              setBookings(updatedBookings);
                                              toast.success(
                                                "تم إنهاء الخدمة وإنشاء الفاتورة بنجاح"
                                              );
                                              // Close dialog
                                              const dialog =
                                                document.querySelector(
                                                  `[data-state="open"]`
                                                );
                                              if (dialog)
                                                dialog.setAttribute(
                                                  "data-state",
                                                  "closed"
                                                );
                                            } else {
                                              toast.error(
                                                "فشل في إنهاء الخدمة"
                                              );
                                            }
                                          } catch (error) {
                                            console.error(
                                              "Error completing service:",
                                              error
                                            );
                                            toast.error(
                                              "حدث خطأ في إنهاء الخدمة"
                                            );
                                          }
                                        }}
                                        className="rounded-full bg-green-600 hover:bg-green-700"
                                      >
                                        إنهاء الخدمة
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => setSelectedBooking(booking)}
                                  >
                                    <Eye className="h-4 w-4 ml-1" />
                                    تفاصيل
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-right">
                                      تفاصيل الطلب
                                    </DialogTitle>
                                  </DialogHeader>
                                  {selectedBooking && (
                                    <div className="space-y-4 text-right">
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          الخدمة المطلوبة
                                        </h4>
                                        <p>{selectedBooking.serviceType}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          بيانات العميل
                                        </h4>
                                        <p>
                                          الاسم:{" "}
                                          {selectedBooking.customerId?.name ||
                                            "غير محدد"}
                                        </p>
                                        <p>
                                          الهاتف:{" "}
                                          {selectedBooking.customerId?.phone ||
                                            "غير محدد"}
                                        </p>
                                        <p>
                                          البريد:{" "}
                                          {selectedBooking.customerId?.email ||
                                            "غير محدد"}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          بيانات السيارة
                                        </h4>
                                        <p>{selectedBooking.carInfo}</p>
                                        <p>
                                          رقم اللوحة:{" "}
                                          {selectedBooking.licensePlate}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          تاريخ ووقت الموعد
                                        </h4>
                                        <p>
                                          {new Date(
                                            selectedBooking.appointmentDate
                                          ).toLocaleDateString("ar-EG")}{" "}
                                          في {selectedBooking.appointmentTime}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          مكان الخدمة
                                        </h4>
                                        <p>{selectedBooking.location}</p>
                                      </div>
                                      {selectedBooking.serviceStartedAt && (
                                        <div>
                                          <h4 className="font-bold mb-2">
                                            وقت بدء الخدمة
                                          </h4>
                                          <p className="text-sm">
                                            {new Date(
                                              selectedBooking.serviceStartedAt
                                            ).toLocaleString("ar-EG")}
                                          </p>
                                        </div>
                                      )}
                                      {selectedBooking.serviceDuration && (
                                        <div>
                                          <h4 className="font-bold mb-2">
                                            مدة الخدمة
                                          </h4>
                                          <p className="text-sm">
                                            {selectedBooking.serviceDuration}{" "}
                                            دقيقة
                                          </p>
                                        </div>
                                      )}
                                      {selectedBooking.description && (
                                        <div>
                                          <h4 className="font-bold mb-2">
                                            وصف المشكلة
                                          </h4>
                                          <p className="text-sm">
                                            {selectedBooking.description}
                                          </p>
                                        </div>
                                      )}
                                      {selectedBooking.estimatedCost && (
                                        <div>
                                          <h4 className="font-bold mb-2">
                                            التكلفة المقدرة
                                          </h4>
                                          <p className="text-sm">
                                            {selectedBooking.estimatedCost} ج.م
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </>
                          ) : booking.status === "completed" ? (
                            <>
                              <div className="flex items-center gap-2 text-green-600 font-semibold">
                                <Check className="h-4 w-4" />
                                <span>تم الانتهاء</span>
                              </div>
                              {booking.reviews &&
                                booking.reviews.length > 0 && (
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end mb-1">
                                      {Array.from({
                                        length: booking.reviews[0].rating,
                                      }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className="h-3 w-3 fill-yellow-500 text-yellow-500"
                                        />
                                      ))}
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
                          ) : (
                            <>
                              <Button size="sm" className="rounded-full flex-1">
                                بدء الخدمة
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => setSelectedBooking(booking)}
                                  >
                                    <Eye className="h-4 w-4 ml-1" />
                                    تفاصيل
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-right">
                                      تفاصيل الطلب
                                    </DialogTitle>
                                  </DialogHeader>
                                  {selectedBooking && (
                                    <div className="space-y-4 text-right">
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          الخدمة المطلوبة
                                        </h4>
                                        <p>{selectedBooking.serviceType}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          بيانات العميل
                                        </h4>
                                        <p>
                                          الاسم:{" "}
                                          {selectedBooking.customerId?.name ||
                                            "غير محدد"}
                                        </p>
                                        <p>
                                          الهاتف:{" "}
                                          {selectedBooking.customerId?.phone ||
                                            "غير محدد"}
                                        </p>
                                        <p>
                                          البريد:{" "}
                                          {selectedBooking.customerId?.email ||
                                            "غير محدد"}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          بيانات السيارة
                                        </h4>
                                        <p>{selectedBooking.carInfo}</p>
                                        <p>
                                          رقم اللوحة:{" "}
                                          {selectedBooking.licensePlate}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          تاريخ ووقت الموعد
                                        </h4>
                                        <p>
                                          {new Date(
                                            selectedBooking.appointmentDate
                                          ).toLocaleDateString("ar-EG")}{" "}
                                          في {selectedBooking.appointmentTime}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">
                                          مكان الخدمة
                                        </h4>
                                        <p>{selectedBooking.location}</p>
                                      </div>
                                      {selectedBooking.description && (
                                        <div>
                                          <h4 className="font-bold mb-2">
                                            وصف المشكلة
                                          </h4>
                                          <p className="text-sm">
                                            {selectedBooking.description}
                                          </p>
                                        </div>
                                      )}
                                      {selectedBooking.estimatedCost && (
                                        <div>
                                          <h4 className="font-bold mb-2">
                                            التكلفة المقدرة
                                          </h4>
                                          <p className="text-sm">
                                            {selectedBooking.estimatedCost} ج.م
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Completed Services */}
              <Card
                className="p-6 animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
                <h2 className="text-2xl font-bold mb-6 text-right">
                  الخدمات المنفذة مؤخراً
                </h2>
                <div className="space-y-3">
                  {bookings
                    .filter((b) => b.status === "completed")
                    .slice(0, 5)
                    .map((booking: any, index: number) => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border"
                      >
                        <div className="text-right flex-1">
                          <h4 className="font-semibold">
                            {booking.serviceType}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {booking.customerId?.name || "عميل"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              booking.completedAt || booking.updatedAt
                            ).toLocaleDateString("ar-EG")}
                          </p>
                          {booking.reviews && booking.reviews.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({
                                length: booking.reviews[0].rating,
                              }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 fill-yellow-500 text-yellow-500"
                                />
                              ))}
                              <span className="text-xs text-muted-foreground">
                                {booking.reviews[0].rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-primary">
                            {booking.actualCost || booking.estimatedCost || 0}{" "}
                            ج.م
                          </p>
                          <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                            مكتمل
                          </span>
                        </div>
                      </div>
                    ))}
                  {bookings.filter((b) => b.status === "completed").length ===
                    0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>لا توجد خدمات منفذة بعد</p>
                      </div>
                    )}
                </div>
              </Card>

              {/* Customer Reviews */}
              <Card
                className="p-6 animate-slide-up"
                style={{ animationDelay: "0.5s" }}
              >
                <h2 className="text-2xl font-bold mb-6 text-right">
                  تقييمات العملاء
                </h2>
                <div className="space-y-4">
                  {bookings
                    .filter(
                      (b) =>
                        b.status === "completed" &&
                        b.reviews &&
                        b.reviews.length > 0
                    )
                    .map((booking: any) => (
                      <div
                        key={booking._id}
                        className="p-4 rounded-xl border border-border bg-muted/20"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-right flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">
                                {booking.customerId?.name || "عميل"}
                              </span>
                              <div className="flex items-center gap-1">
                                {Array.from({
                                  length: booking.reviews[0].rating,
                                }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className="h-4 w-4 fill-yellow-500 text-yellow-500"
                                  />
                                ))}
                                <span className="text-sm font-medium">
                                  {booking.reviews[0].rating}/5
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {booking.serviceType}
                            </p>
                            {booking.reviews[0].comment && (
                              <p className="text-sm italic">
                                "{booking.reviews[0].comment}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(
                                booking.reviews[0].createdAt
                              ).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  {bookings.filter(
                    (b) =>
                      b.status === "completed" &&
                      b.reviews &&
                      b.reviews.length > 0
                  ).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>لا توجد تقييمات بعد</p>
                        <p className="text-sm">
                          ستظهر هنا تقييمات العملاء بعد إنهاء الخدمات
                        </p>
                      </div>
                    )}
                </div>
              </Card>

              {/* All Reviews Section */}
              <Card
                className="p-6 animate-slide-up"
                style={{ animationDelay: "0.6s" }}
              >
                <h2 className="text-2xl font-bold mb-6 text-right">
                  جميع التقييمات والمراجعات
                </h2>
                <div className="space-y-4">
                  {bookings
                    .filter((b) => b.reviews && b.reviews.length > 0)
                    .map((booking: any) => (
                      <div
                        key={`review-${booking._id}`}
                        className="p-4 rounded-xl border border-border bg-gradient-to-r from-blue-50/50 to-indigo-50/50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-right flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">
                                {booking.customerId?.name || "عميل"}
                              </span>
                              <div className="flex items-center gap-1">
                                {Array.from({
                                  length: booking.reviews[0].rating,
                                }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className="h-4 w-4 fill-yellow-500 text-yellow-500"
                                  />
                                ))}
                                <span className="text-sm font-medium">
                                  {booking.reviews[0].rating}/5
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              الخدمة: {booking.serviceType}
                            </p>
                            {booking.reviews[0].comment && (
                              <div className="bg-white/70 p-3 rounded-lg border">
                                <p className="text-sm italic text-gray-700">
                                  "{booking.reviews[0].comment}"
                                </p>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  booking.reviews[0].createdAt
                                ).toLocaleDateString("ar-EG")}
                              </p>
                              <Badge
                                variant={
                                  booking.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {booking.status === "completed"
                                  ? "خدمة مكتملة"
                                  : "قيد التنفيذ"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {bookings.filter((b) => b.reviews && b.reviews.length > 0)
                    .length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>لا توجد تقييمات أو مراجعات</p>
                        <p className="text-sm">
                          ستظهر هنا جميع التقييمات والمراجعات من العملاء
                        </p>
                      </div>
                    )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Location Management */}
              <Card
                className="p-8 animate-slide-up shadow-xl border-border/50"
                style={{ animationDelay: "0.4s" }}
              >
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  إدارة الموقع
                </h3>
                <div className="space-y-4">
                  <Button
                    className="w-full rounded-full py-6 text-lg font-semibold hover-lift transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    onClick={() => setShowLocationDialog(true)}
                  >
                    <MapPin className="h-5 w-5 ml-2" />
                    تحديد موقعي على الخريطة
                  </Button>
                  {userData?.latitude && userData?.longitude && (
                    <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ موقعك محدد على الخريطة
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        آخر تحديث: {userData.lastLocationUpdate ? new Date(userData.lastLocationUpdate).toLocaleString('ar-EG') : 'غير محدد'}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Availability Status */}
              <Card
                className="p-8 animate-slide-up shadow-xl border-border/50"
                style={{ animationDelay: "0.5s" }}
              >
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  حالة التوفر
                </h3>
                <div className="space-y-4">
                  <Button
                    className={`w-full rounded-full py-6 text-lg font-semibold hover-lift transition-all duration-300 shadow-lg ${availabilityStatus === "available"
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                      }`}
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          "http://localhost:5000/users/availability",
                          {
                            method: "PATCH",
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "accessToken"
                              )}`,
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              availabilityStatus: "available",
                            }),
                          }
                        );

                        if (response.ok) {
                          setAvailabilityStatus("available");
                          toast.success("تم تحديث حالة التوفر بنجاح");
                        } else {
                          toast.error("فشل في تحديث حالة التوفر");
                        }
                      } catch (error) {
                        console.error("Error updating availability:", error);
                        toast.error("حدث خطأ في تحديث حالة التوفر");
                      }
                    }}
                  >
                    متاح الآن
                  </Button>
                  <Button
                    variant="outline"
                    className={`w-full rounded-full py-6 text-lg font-semibold hover-lift transition-all duration-300 ${availabilityStatus === "unavailable"
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-red-500"
                        : "hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      }`}
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          "http://localhost:5000/users/availability",
                          {
                            method: "PATCH",
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "accessToken"
                              )}`,
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              availabilityStatus: "unavailable",
                            }),
                          }
                        );

                        if (response.ok) {
                          setAvailabilityStatus("unavailable");
                          toast.success("تم تحديث حالة التوفر بنجاح");
                        } else {
                          toast.error("فشل في تحديث حالة التوفر");
                        }
                      } catch (error) {
                        console.error("Error updating availability:", error);
                        toast.error("حدث خطأ في تحديث حالة التوفر");
                      }
                    }}
                  >
                    غير متاح
                  </Button>
                </div>
              </Card>

              {/* Earnings */}
              <Card
                className="p-8 bg-gradient-to-br from-primary/10 via-orange-500/5 to-background animate-slide-up shadow-xl border-border/50"
                style={{ animationDelay: "0.6s" }}
              >
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  الأرباح
                </h3>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold mb-3 text-primary">
                    {userData?.totalEarnings || 0} ج.م
                  </div>
                  <p className="text-base text-muted-foreground font-medium">
                    إجمالي الأرباح
                  </p>
                </div>
                <Button className="w-full rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 text-white font-semibold py-6 text-lg hover-lift transition-all duration-300 shadow-lg">
                  سحب الأرباح
                </Button>
              </Card>

              {/* Quick Stats */}
              <Card
                className="p-8 animate-slide-up shadow-xl border-border/50"
                style={{ animationDelay: "0.7s" }}
              >
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  إحصائيات سريعة
                </h3>
                <div className="space-y-4 text-right">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">
                      معدل القبول
                    </span>
                    <span className="font-bold text-lg text-primary">
                      {userData?.acceptanceRate || 100}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">
                      إجمالي الحجوزات
                    </span>
                    <span className="font-bold text-lg text-primary">
                      {userData?.totalBookings || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">
                      وقت الاستجابة
                    </span>
                    <span className="font-bold text-lg text-primary">
                      {userData?.responseTime || 0} دقيقة
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Location Selection Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-right text-lg">
              تحديد موقعك على الخريطة
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-full">
            {/* Header with Address Input */}
            <div className="p-4 border-b bg-gray-50">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-right">
                  أدخل عنوانك (البحث تلقائي)
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const addressInput = document.getElementById('mechanic-address-input') as HTMLInputElement;
                      const address = addressInput?.value?.trim();
                      if (!address) {
                        toast.error('يرجى إدخال العنوان أولاً');
                        return;
                      }

                      try {
                        const response = await fetch(
                          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', أسوان, مصر')}&limit=1`
                        );
                        const data = await response.json();

                        if (data && data.length > 0) {
                          const location = {
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon)
                          };

                          // Show location on map first
                          setMechanicLocation(location);
                          toast.success('تم العثور على الموقع! تأكد من الموقع على الخريطة ثم اضغط حفظ');
                        } else {
                          toast.error('لم يتم العثور على هذا العنوان');
                        }
                      } catch (error) {
                        console.error('Error geocoding address:', error);
                        toast.error('حدث خطأ في البحث عن العنوان');
                      }
                    }}
                    className="px-4 py-2"
                  >
                    <MapPin className="h-4 w-4 ml-1" />
                    بحث
                  </Button>
                  <input
                    id="mechanic-address-input"
                    type="text"
                    placeholder="مثال: شارع النيل، أسوان"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 text-right">
                  اكتب العنوان ثم اضغط على زر البحث
                </p>
              </div>
            </div>

            {/* Map Container with Scroll */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full border rounded-lg overflow-hidden">
                <MapComponent
                  onMechanicLocationSelect={(location: { lat: number; lng: number }) => {
                    // Just update the preview location, don't save yet
                    setMechanicLocation(location);
                  }}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-center">
                <Button
                  onClick={async () => {
                    if (!mechanicLocation) {
                      toast.error('يرجى تحديد موقعك أولاً');
                      return;
                    }

                    try {
                      const response = await fetch(`http://localhost:5000/users/${user?._id}/location`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          latitude: mechanicLocation.lat,
                          longitude: mechanicLocation.lng,
                        }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        setUserData(prev => prev ? {
                          ...prev,
                          latitude: mechanicLocation.lat,
                          longitude: mechanicLocation.lng,
                          lastLocationUpdate: new Date().toISOString()
                        } : null);
                        toast.success('تم حفظ موقعك بنجاح!');
                        setShowLocationDialog(false);
                        setMechanicLocation(null);
                      } else {
                        toast.error('فشل في حفظ الموقع');
                      }
                    } catch (error) {
                      console.error('Error saving location:', error);
                      toast.error('حدث خطأ في حفظ الموقع');
                    }
                  }}
                  disabled={!mechanicLocation}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 ml-2" />
                  حفظ الموقع
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MechanicProfile;
