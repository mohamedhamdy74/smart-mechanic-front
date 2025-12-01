import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Car, Clock, MapPin, Star, User, Wrench, AlertTriangle, Plus, Edit, Trash2, Mail, Phone, MapPin as MapPinIcon, Car as CarIcon, CheckCircle, Package, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/utils/imageUtils";
import { Skeleton } from "@/components/ui/skeleton";

// Real user data will be fetched from backend

const ClientProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maintenancePlan, setMaintenancePlan] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Fetch user data using React Query
  const { data: userProfileData, isLoading: userLoadingQuery, error: userQueryError } = useQuery({
    queryKey: ['client-profile', user?._id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات المستخدم');
      }

      const userProfile = await response.json();
      return {
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        location: userProfile.location,
        carBrand: userProfile.carBrand,
        carModel: userProfile.carModel,
        carYear: userProfile.carYear,
        plateNumber: userProfile.plateNumber,
        lastMaintenance: userProfile.lastMaintenance,
        dealership: userProfile.dealership,
        mileage: userProfile.mileage,
        profilePicture: userProfile.profilePicture,
        joinDate: new Date(userProfile.createdAt).toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long'
        }),
      };
    },
    enabled: !!user?._id,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Update local state when data changes
  useEffect(() => {
    if (userProfileData) {
      setUserData(userProfileData);
    }
  }, [userProfileData]);

  // Handle loading and error states
  useEffect(() => {
    setLoading(userLoadingQuery);
    if (userQueryError) {
      setError(userQueryError.message);
    }
  }, [userLoadingQuery, userQueryError]);

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('http://localhost:5000/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          location: userData.location,
          carBrand: userData.carBrand,
          carModel: userData.carModel,
          carYear: userData.carYear,
          plateNumber: userData.plateNumber,
          mileage: userData.mileage,
          lastMaintenance: userData.lastMaintenance,
          dealership: userData.dealership,
        }),
      });

      if (response.ok) {
        // Refresh user data immediately using the correct endpoint
        const updatedResponse = await fetch(`http://localhost:5000/auth/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (updatedResponse.ok) {
          const updatedUser = await updatedResponse.json();
          setUserData({
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location,
            carBrand: updatedUser.carBrand,
            carModel: updatedUser.carModel,
            carYear: updatedUser.carYear,
            plateNumber: updatedUser.plateNumber,
            lastMaintenance: updatedUser.lastMaintenance,
            dealership: updatedUser.dealership,
            mileage: updatedUser.mileage,
            joinDate: new Date(updatedUser.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long'
            }),
          });
        }

        toast.success('تم حفظ التغييرات بنجاح');
        setIsEditing(false);
      } else {
        toast.error('فشل في حفظ التغييرات');
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('فشل في حفظ التغييرات');
    }
  };

  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, feedback: '' });
  const [orders, setOrders] = useState([]);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState({
    'pending': 'تم الطلب',
    'confirmed': 'تم الطلب',
    'shipped': 'جاري الشحن',
    'completed': 'تم الاستلام',
    'cancelled': 'ملغي'
  });

  // Load bookings using React Query
  const { data: bookingsData } = useQuery({
    queryKey: ['client-bookings', user?._id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/bookings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل الحجوزات');
      }

      const data = await response.json();
      const bookings = data.bookings || [];

      // Separate completed and pending bookings
      const completed = bookings.filter((b: any) => b.status === 'completed');
      const pending = bookings.filter((b: any) => b.status !== 'completed');

      return { completed, pending };
    },
    enabled: !!user?._id,
    staleTime: 15000, // Consider bookings data fresh for 15 seconds
  });

  // Load orders using React Query
  const { data: ordersData } = useQuery({
    queryKey: ['client-orders', user?._id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/orders/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل الطلبات');
      }

      const data = await response.json();
      return data.orders || [];
    },
    enabled: !!user?._id,
    staleTime: 30000, // Consider orders data fresh for 30 seconds
  });

  // Update local state when data changes
  useEffect(() => {
    if (bookingsData) {
      setCompletedBookings(bookingsData.completed);
      setBookedAppointments(bookingsData.pending);
    }
  }, [bookingsData]);

  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
    }
  }, [ordersData]);

  // Handle submitting review and feedback
  const handleSubmitReview = async () => {
    if (!selectedBookingForReview) return;

    try {
      const response = await fetch(`http://localhost:5000/bookings/${selectedBookingForReview._id}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewData.rating,
          feedback: reviewData.feedback,
        }),
      });

      if (response.ok) {
        toast.success('تم إرسال التقييم بنجاح');
        setSelectedBookingForReview(null);
        setReviewData({ rating: 5, feedback: '' });

        // Refresh bookings to show updated rating
        const refreshResponse = await fetch(`http://localhost:5000/bookings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const bookings = data.bookings || [];
          const completed = bookings.filter((b: any) => b.status === 'completed');
          setCompletedBookings(completed);
        }
      } else {
        toast.error('فشل في إرسال التقييم');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('حدث خطأ في إرسال التقييم');
    }
  };

  // Handle order receipt confirmation
  const handleConfirmReceipt = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/orders/${orderId}/confirm-receipt`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('تم تأكيد استلام الطلب بنجاح');
        // Refresh orders
        const refreshResponse = await fetch(`http://localhost:5000/orders/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setOrders(data.orders || []);
        }
      } else {
        toast.error('فشل في تأكيد الاستلام');
      }
    } catch (error) {
      console.error('Error confirming receipt:', error);
      toast.error('حدث خطأ في تأكيد الاستلام');
    }
  };

  // Load maintenance plan using React Query
  const { data: maintenancePlanData, refetch: refetchMaintenancePlan } = useQuery({
    queryKey: ['maintenance-plan', user?._id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/maintenance/plan/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('فشل في تحميل خطة الصيانة');
      }

      const data = await response.json();
      return data.plan;
    },
    enabled: !!user?._id,
    staleTime: 30000,
  });

  // Update local state when maintenance plan changes
  useEffect(() => {
    if (maintenancePlanData) {
      setMaintenancePlan(maintenancePlanData);
    }
  }, [maintenancePlanData]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    task: "",
    dueDate: "",
    kmInterval: ""
  });

  const handleAddTask = async () => {
    if (!formData.task || !formData.dueDate || !formData.kmInterval) {
      toast.error("يرجى إدخال جميع البيانات المطلوبة");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/maintenance/log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: formData.task,
          date: formData.dueDate,
          km: parseInt(formData.kmInterval),
        }),
      });

      if (response.ok) {
        toast.success("تم إضافة سجل الصيانة وتحديث الخطة");
        setFormData({ task: "", dueDate: "", kmInterval: "" });
        setIsAddDialogOpen(false);
        refetchMaintenancePlan();
      } else {
        toast.error('فشل في إضافة سجل الصيانة');
      }
    } catch (error) {
      console.error('Error adding maintenance log:', error);
      toast.error('حدث خطأ في إضافة سجل الصيانة');
    }
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const response = await fetch('http://localhost:5000/maintenance/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        toast.success('تم إنشاء خطة الصيانة بنجاح');
        refetchMaintenancePlan();
      } else {
        toast.error('فشل في إنشاء خطة الصيانة');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('حدث خطأ في إنشاء خطة الصيانة');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">جاري تحميل بيانات الملف الشخصي...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">حدث خطأ في تحميل البيانات</h3>
            <p className="text-muted-foreground mb-4">{error || 'لم يتم العثور على بيانات المستخدم'}</p>
            <Button onClick={() => window.location.reload()} className="rounded-full">
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
          <div className="bg-gradient-to-br from-primary/10 via-orange-500/5 to-background dark:from-gray-900/50 dark:via-gray-800/30 dark:to-black rounded-3xl p-10 mb-10 animate-bounce-in shadow-2xl border border-border/50 dark:border-gray-700/50 transition-colors duration-300">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white shadow-lg">
                <User className="h-16 w-16 text-primary" />
              </div>
              <div className="text-center md:text-right flex-1">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">{userData.name}</h1>
                <p className="text-muted-foreground mb-6 text-lg">{user?.level || 'عميل جديد'} ⭐</p>
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                  <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full">
                    <Wrench className="h-6 w-6 text-primary" />
                    <span className="font-medium">خدمات مكتملة</span>
                  </div>
                  <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full">
                    <Clock className="h-6 w-6 text-primary" />
                    <span className="font-medium">عضو منذ {userData.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span className="font-medium">{userData.dealership || userData.address}</span>
                  </div>
                </div>
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
              {/* Car Information */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                    <Car className="h-8 w-8 text-primary" />
                    معلومات السيارة
                  </h2>
                  {/* <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
                    onClick={() => navigate("/profile/client/edit")}
                  >
                    <Edit className="h-4 w-4 ml-2" />
                    تعديل
                  </Button> */}
                </div>
                <div className="grid grid-cols-2 gap-6 text-right">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">الماركة</p>
                    <p className="font-semibold">{userData.carBrand || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">الموديل</p>
                    <p className="font-semibold">{userData.carModel || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">سنة الصنع</p>
                    <p className="font-semibold">{userData.carYear || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">رقم اللوحة</p>
                    <p className="font-semibold">{userData.plateNumber || 'غير محدد'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm mb-1">آخر صيانة</p>
                    <p className="font-semibold">{userData.lastMaintenance ? new Date(userData.lastMaintenance).toLocaleDateString('ar-EG') : 'غير محدد'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm mb-1">عداد الكيلومترات</p>
                    <p className="font-semibold">{userData.mileage ? `${userData.mileage} كم` : 'غير محدد'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm mb-1">الوكالة المعتمدة</p>
                    <p className="font-semibold">{userData.dealership || 'غير محدد'}</p>
                  </div>
                </div>
              </Card>

              {/* Orders Section */}
              {orders.length > 0 && (
                <Card className="p-6 animate-slide-up bg-card/90 dark:bg-gray-900/90 transition-colors duration-300" style={{ animationDelay: "0.05s" }}>
                  <h2 className="text-2xl font-bold mb-6 text-right bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">طلبات المنتجات</h2>
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div className="text-right">
                            <h3 className="font-bold">طلب #{order._id.slice(-8)}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.products.length} منتج • {order.totalAmount.toLocaleString()} ج.م
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge variant="outline" className={`text-xs mb-2 ${order.status === 'pending' ? 'border-yellow-300 text-yellow-700' :
                            order.status === 'confirmed' ? 'border-blue-300 text-blue-700' :
                              order.status === 'shipped' ? 'border-purple-300 text-purple-700' :
                                order.status === 'completed' ? 'border-green-300 text-green-700' :
                                  'border-red-300 text-red-700'
                            }`}>
                            {orderStatuses[order.status as keyof typeof orderStatuses] || order.status}
                          </Badge>
                          {order.status === 'shipped' && (
                            <Button
                              size="sm"
                              className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleConfirmReceipt(order._id)}
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />
                              تم الاستلام
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Booking History */}
              <Card className="p-6 animate-slide-up bg-card/90 dark:bg-gray-900/90 transition-colors duration-300" style={{ animationDelay: "0.1s" }}>
                <h2 className="text-2xl font-bold mb-6 text-right">تاريخ الحجوزات</h2>
                <div className="space-y-4">
                  {completedBookings.slice(0, 10).map((booking: any) => (
                    <div
                      key={booking._id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">{booking.serviceType}</h3>
                          <p className="text-sm text-muted-foreground">مع {booking.mechanicId?.name || 'ميكانيكي'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.completedAt || booking.updatedAt).toLocaleDateString('ar-EG')}
                          </p>
                          {booking.customerRating && (
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: booking.customerRating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary text-lg">
                          {booking.actualCost || booking.estimatedCost || 'غير محدد'} ج.م
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                          booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-red-500/10 text-red-600'
                          }`}>
                          {booking.status === 'completed' ? 'مكتمل' :
                            booking.status === 'pending' ? 'قيد الانتظار' :
                              'ملغي'}
                        </span>
                        {booking.status === 'completed' && booking.invoice && booking.invoice.paymentStatus !== 'paid' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 ml-1" />
                                دفع الفاتورة
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-right">دفع الفاتورة</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6 text-right">
                                {/* Invoice Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-2xl">📄</span>
                                    <span className="font-bold text-blue-800">فاتورة الخدمة</span>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-blue-700">رقم الفاتورة: #{booking._id.slice(-8).toUpperCase()}</p>
                                    <p className="text-sm text-blue-700">
                                      تاريخ: {new Date(booking.completedAt || booking.updatedAt).toLocaleDateString('ar-EG')}
                                    </p>
                                  </div>
                                </div>

                                {/* Service Details */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                  <h4 className="font-bold mb-3 text-lg">تفاصيل الخدمة</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">نوع الخدمة:</span>
                                      <span className="font-semibold">{booking.serviceType}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">الميكانيكي:</span>
                                      <span className="font-semibold">{booking.mechanicId?.name || 'الميكانيكي'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">السيارة:</span>
                                      <span className="font-semibold">{booking.carInfo}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">رقم اللوحة:</span>
                                      <span className="font-semibold">{booking.licensePlate}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Service Records */}
                                {booking.serviceRecords && booking.serviceRecords.length > 0 && (
                                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h4 className="font-bold mb-3 text-lg">تفاصيل العمل المنجز</h4>
                                    <div className="space-y-3">
                                      {booking.serviceRecords.map((record: any, index: number) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                          <p className="font-semibold mb-2">{record.workDescription}</p>
                                          <div className="space-y-1 text-sm">
                                            {record.parts && record.parts.length > 0 && (
                                              <div>
                                                <span className="text-muted-foreground">القطع المستخدمة:</span>
                                                <ul className="mt-1 space-y-1">
                                                  {record.parts.map((part: any, partIndex: number) => (
                                                    <li key={partIndex} className="flex justify-between">
                                                      <span>• {part.name}</span>
                                                      <span className="font-semibold">{part.cost} ج.م</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t">
                                              <span className="text-muted-foreground">أجرة العمل:</span>
                                              <span className="font-semibold">{record.laborCost} ج.م</span>
                                            </div>
                                            <div className="flex justify-between font-bold">
                                              <span>المجموع:</span>
                                              <span>{record.cost} ج.م</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Invoice Summary */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                  <h4 className="font-bold mb-3 text-lg text-green-800">ملخص الفاتورة</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-green-700">التكلفة الإجمالية:</span>
                                      <span className="font-bold text-lg text-green-800">{booking.invoice.totalAmount} ج.م</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-green-700">رسوم المنصة (20%):</span>
                                      <span className="text-sm text-green-700">{booking.invoice.platformFee} ج.م</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-green-700">مبلغ الميكانيكي (80%):</span>
                                      <span className="text-sm text-green-700">{booking.invoice.mechanicAmount} ج.م</span>
                                    </div>
                                    <div className="border-t border-green-300 pt-3 mt-3">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-green-800">المبلغ المستحق:</span>
                                        <span className="font-bold text-xl text-green-800">{booking.invoice.totalAmount} ج.م</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Status */}
                                <div className={`p-4 rounded-xl border ${booking.invoice.paymentStatus === 'paid'
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-yellow-50 border-yellow-200'
                                  }`}>
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className={`text-xl ${booking.invoice.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                      {booking.invoice.paymentStatus === 'paid' ? '✅' : '⏳'}
                                    </span>
                                    <span className={`font-bold ${booking.invoice.paymentStatus === 'paid' ? 'text-green-800' : 'text-yellow-800'}`}>
                                      {booking.invoice.paymentStatus === 'paid' ? 'تم الدفع' : 'في انتظار الدفع'}
                                    </span>
                                  </div>
                                  {booking.invoice.paymentMethod && (
                                    <p className="text-center text-sm text-muted-foreground">
                                      طريقة الدفع: {booking.invoice.paymentMethod === 'visa' ? 'فيزا/ماستركارد' :
                                        booking.invoice.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                                          booking.invoice.paymentMethod === 'fawry' ? 'فوري' : booking.invoice.paymentMethod}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <h4 className="font-bold mb-2">اختر طريقة الدفع</h4>
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                      <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="visa"
                                        defaultChecked
                                        className="text-primary"
                                        onChange={() => {
                                          // Show/hide payment forms
                                          document.getElementById(`visa-form-${booking._id}`)?.classList.remove('hidden');
                                          document.getElementById(`vodafone-form-${booking._id}`)?.classList.add('hidden');
                                          document.getElementById(`fawry-form-${booking._id}`)?.classList.add('hidden');
                                          document.getElementById(`instapay-form-${booking._id}`)?.classList.add('hidden');
                                        }}
                                      />
                                      <span>💳 بطاقة فيزا/ماستركارد</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                      <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="vodafone_cash"
                                        className="text-primary"
                                        onChange={() => {
                                          // Show/hide payment forms
                                          document.getElementById(`visa-form-${booking._id}`)?.classList.add('hidden');
                                          document.getElementById(`vodafone-form-${booking._id}`)?.classList.remove('hidden');
                                          document.getElementById(`fawry-form-${booking._id}`)?.classList.add('hidden');
                                          document.getElementById(`instapay-form-${booking._id}`)?.classList.add('hidden');
                                        }}
                                      />
                                      <span>📱 فودافون كاش</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                      <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="fawry"
                                        className="text-primary"
                                        onChange={() => {
                                          // Show/hide payment forms
                                          document.getElementById(`visa-form-${booking._id}`)?.classList.add('hidden');
                                          document.getElementById(`vodafone-form-${booking._id}`)?.classList.add('hidden');
                                          document.getElementById(`fawry-form-${booking._id}`)?.classList.remove('hidden');
                                          document.getElementById(`instapay-form-${booking._id}`)?.classList.add('hidden');
                                        }}
                                      />
                                      <span>🏪 فوري</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                      <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="instapay"
                                        className="text-primary"
                                        onChange={() => {
                                          // Show/hide payment forms
                                          document.getElementById(`visa-form-${booking._id}`)?.classList.add('hidden');
                                          document.getElementById(`vodafone-form-${booking._id}`)?.classList.add('hidden');
                                          document.getElementById(`fawry-form-${booking._id}`)?.classList.add('hidden');
                                          document.getElementById(`instapay-form-${booking._id}`)?.classList.remove('hidden');
                                        }}
                                      />
                                      <span>💰 إنستاباي</span>
                                    </label>
                                  </div>
                                </div>

                                {/* Payment Form Fields */}
                                <div id={`payment-form-${booking._id}`} className="space-y-4">
                                  {/* Visa/Mastercard Form */}
                                  <div id={`visa-form-${booking._id}`} className="space-y-3">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">رقم البطاقة</label>
                                      <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full p-2 border rounded-lg text-left"
                                        maxLength={19}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
                                        <input
                                          type="text"
                                          placeholder="MM/YY"
                                          className="w-full p-2 border rounded-lg text-left"
                                          maxLength={5}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">CVV</label>
                                        <input
                                          type="text"
                                          placeholder="123"
                                          className="w-full p-2 border rounded-lg text-left"
                                          maxLength={4}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">اسم صاحب البطاقة</label>
                                      <input
                                        type="text"
                                        placeholder="JOHN DOE"
                                        className="w-full p-2 border rounded-lg text-left uppercase"
                                      />
                                    </div>
                                  </div>

                                  {/* Vodafone Cash Form */}
                                  <div id={`vodafone-form-${booking._id}`} className="space-y-3 hidden">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">رقم الهاتف المحمول</label>
                                      <input
                                        type="tel"
                                        placeholder="+20 10X XXX XXXX"
                                        className="w-full p-2 border rounded-lg text-left"
                                      />
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <p className="text-sm text-blue-800">
                                        سيتم إرسال رمز تحقق إلى رقم هاتفك. تأكد من وجود رصيد كافي.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Fawry Form */}
                                  <div id={`fawry-form-${booking._id}`} className="space-y-3 hidden">
                                    <div className="bg-green-50 p-4 rounded-lg text-center">
                                      <p className="text-sm text-green-800 mb-2">
                                        ستحصل على رقم مرجعي للدفع في فوري
                                      </p>
                                      <p className="font-bold text-lg text-green-900">
                                        {Math.floor(100000 + Math.random() * 900000)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Instapay Form */}
                                  <div id={`instapay-form-${booking._id}`} className="space-y-3 hidden">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">رقم حساب إنستاباي</label>
                                      <input
                                        type="text"
                                        placeholder="أدخل رقم حسابك"
                                        className="w-full p-2 border rounded-lg text-left"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">كلمة المرور</label>
                                      <input
                                        type="password"
                                        placeholder="كلمة المرور"
                                        className="w-full p-2 border rounded-lg text-left"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      // Close dialog logic
                                      const dialog = document.querySelector(`[data-state="open"]`);
                                      if (dialog) dialog.setAttribute('data-state', 'closed');
                                    }}
                                    className="rounded-full"
                                  >
                                    إلغاء
                                  </Button>
                                  <Button
                                    onClick={async () => {
                                      const paymentMethod = (document.querySelector('input[name="paymentMethod"]:checked') as HTMLInputElement)?.value || 'visa';

                                      // Simulate payment processing with realistic delays
                                      toast.loading('جاري معالجة الدفع...', { id: 'payment-processing' });

                                      // Simulate network delay
                                      await new Promise(resolve => setTimeout(resolve, 2000));

                                      try {
                                        const response = await fetch(`http://localhost:5000/bookings/${booking._id}/payment`, {
                                          method: 'POST',
                                          headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                                            'Content-Type': 'application/json',
                                          },
                                          body: JSON.stringify({
                                            paymentMethod: paymentMethod
                                          }),
                                        });

                                        if (response.ok) {
                                          const result = await response.json();

                                          // Simulate additional processing time for different payment methods
                                          if (paymentMethod === 'vodafone_cash') {
                                            toast.loading('تم إرسال رمز التحقق إلى هاتفك...', { id: 'payment-processing' });
                                            await new Promise(resolve => setTimeout(resolve, 3000));
                                          } else if (paymentMethod === 'fawry') {
                                            toast.loading('جاري إعداد كود الدفع...', { id: 'payment-processing' });
                                            await new Promise(resolve => setTimeout(resolve, 2500));
                                          }

                                          toast.success('تم دفع الفاتورة بنجاح ✅', { id: 'payment-processing' });

                                          // Wait a moment before attempting PDF download
                                          await new Promise(resolve => setTimeout(resolve, 1000));

                                          // Generate and download PDF invoice
                                          try {
                                            console.log('Attempting to download PDF for booking:', booking._id);
                                            const pdfResponse = await fetch(`http://localhost:5000/bookings/${booking._id}/invoice-pdf`, {
                                              headers: {
                                                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                                              },
                                            });

                                            console.log('PDF response status:', pdfResponse.status);

                                            if (pdfResponse.ok) {
                                              const blob = await pdfResponse.blob();
                                              console.log('PDF blob size:', blob.size);
                                              if (blob.size > 0) {
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `فاتورة-${booking._id.slice(-8).toUpperCase()}.pdf`;
                                                document.body.appendChild(a);
                                                a.click();
                                                window.URL.revokeObjectURL(url);
                                                document.body.removeChild(a);
                                                toast.success('تم تحميل الفاتورة بنجاح 📄');
                                              } else {
                                                console.warn('PDF blob is empty');
                                                toast.error('فشل في تحميل الفاتورة - ملف فارغ');
                                              }
                                            } else {
                                              const errorText = await pdfResponse.text();
                                              console.error('PDF generation failed:', pdfResponse.status, errorText);
                                              toast.error('فشل في تحميل الفاتورة');
                                            }
                                          } catch (pdfError) {
                                            console.error('PDF generation failed:', pdfError);
                                            toast.error('حدث خطأ في تحميل الفاتورة');
                                          }

                                          // Refresh bookings to show updated payment status
                                          const refreshResponse = await fetch(`http://localhost:5000/bookings`, {
                                            headers: {
                                              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                                            },
                                          });

                                          if (refreshResponse.ok) {
                                            const data = await refreshResponse.json();
                                            const completed = data.bookings.filter((b: any) => b.status === 'completed');
                                            setCompletedBookings(completed);
                                          }
                                          // Close dialog
                                          const dialog = document.querySelector(`[data-state="open"]`);
                                          if (dialog) dialog.setAttribute('data-state', 'closed');
                                        } else {
                                          const errorData = await response.json();
                                          console.error('Payment failed:', errorData);
                                          toast.error(errorData.message || 'فشل في دفع الفاتورة ❌', { id: 'payment-processing' });
                                        }
                                      } catch (error) {
                                        console.error('Error processing payment:', error);
                                        toast.error('حدث خطأ في معالجة الدفع ❌', { id: 'payment-processing' });
                                      }
                                    }}
                                    className="rounded-full bg-green-600 hover:bg-green-700"
                                  >
                                    تأكيد الدفع وتحميل الفاتورة
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {booking.status === 'completed' && !booking.customerRating && booking.invoice && booking.invoice.paymentStatus === 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 rounded-full"
                            onClick={() => setSelectedBookingForReview(booking)}
                          >
                            <Star className="h-4 w-4 ml-1" />
                            تقييم الخدمة
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {completedBookings.length === 0 && (
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">لا توجد حجوزات مكتملة حتى الآن</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50" style={{ animationDelay: "0.2s" }}>
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">إجراءات سريعة</h3>
                <div className="space-y-4">
                  <Button
                    className="w-full rounded-full justify-start py-6 text-base font-semibold hover-lift transition-all duration-300 hover:bg-primary hover:text-white"
                    onClick={() => navigate('/mechanics')}
                  >
                    <Calendar className="h-6 w-6 ml-3" />
                    حجز موعد جديد
                  </Button>
                  <Button variant="outline" className="w-full rounded-full justify-start py-6 text-base hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5">
                    <MapPin className="h-6 w-6 ml-3" />
                    تتبع الميكانيكي
                  </Button>
                  <Button variant="outline" className="w-full rounded-full justify-start py-6 text-base hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5">
                    <Wrench className="h-6 w-6 ml-3" />
                    تشخيص ذكي
                  </Button>
                </div>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <h3 className="font-bold mb-4 text-right">المواعيد القادمة</h3>
                <div className="space-y-3">
                  {/* Booked Appointments */}
                  {bookedAppointments.map((appointment: any) => (
                    <div key={appointment._id} className={`p-3 rounded-xl border ${appointment.status === 'accepted' ? 'bg-green-50 border-green-200' :
                      appointment.status === 'rejected' ? 'bg-red-50 border-red-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className={`h-4 w-4 ${appointment.status === 'accepted' ? 'text-green-600' :
                          appointment.status === 'rejected' ? 'text-red-600' :
                            'text-blue-600'
                          }`} />
                        <p className={`font-semibold text-sm ${appointment.status === 'accepted' ? 'text-green-800' :
                          appointment.status === 'rejected' ? 'text-red-800' :
                            'text-blue-800'
                          }`}>{appointment.serviceType}</p>
                      </div>
                      <p className={`text-xs mb-1 ${appointment.status === 'accepted' ? 'text-green-700' :
                        appointment.status === 'rejected' ? 'text-red-700' :
                          'text-blue-700'
                        }`}>
                        مع {appointment.mechanicId?.name || 'ميكانيكي'} - {new Date(appointment.appointmentDate).toLocaleDateString('ar-EG')} في {appointment.appointmentTime}
                      </p>
                      <p className={`text-xs mb-2 ${appointment.status === 'accepted' ? 'text-green-700' :
                        appointment.status === 'rejected' ? 'text-red-700' :
                          'text-blue-700'
                        }`}>
                        السيارة: {appointment.carInfo} - {appointment.licensePlate}
                      </p>
                      <Badge variant="outline" className={`text-xs ${appointment.status === 'accepted' ? 'border-green-300 text-green-700' :
                        appointment.status === 'rejected' ? 'border-red-300 text-red-700' :
                          'border-blue-300 text-blue-700'
                        }`}>
                        {appointment.status === 'pending' ? 'في انتظار التأكيد' :
                          appointment.status === 'accepted' ? 'مؤكد من الميكانيكي' :
                            appointment.status === 'rejected' ? 'مرفوض من الميكانيكي' :
                              appointment.status === 'completed' ? 'مكتمل' :
                                appointment.status}
                      </Badge>
                    </div>
                  ))}

                  {/* Default Appointments */}
                  {bookedAppointments.length === 0 && (
                    <>
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <p className="font-semibold text-sm">صيانة دورية</p>
                        </div>
                        <p className="text-xs text-muted-foreground">12 يناير 2025 - 10:00 ص</p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <p className="font-semibold text-sm text-orange-800">تذكير: تغيير زيت المحرك</p>
                        </div>
                        <p className="text-xs text-orange-700">مستحق خلال 500 كم - 15 يناير 2025</p>
                        <Badge variant="outline" className="mt-2 text-xs border-orange-300 text-orange-700">
                          مستحق قريباً
                        </Badge>
                      </div>
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <p className="font-semibold text-sm text-red-800">فحص الفرامل</p>
                        </div>
                        <p className="text-xs text-red-700">متأخر عن الموعد المحدد - 30 ديسمبر 2024</p>
                        <Badge variant="outline" className="mt-2 text-xs border-red-300 text-red-700">
                          مستحق فوراً
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Maintenance Tasks */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center justify-between mb-4">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          setFormData({ task: "", dueDate: "", kmInterval: "" });
                        }}
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة مهمة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-right">
                          إضافة مهمة صيانة جديدة
                        </DialogTitle>
                        <DialogDescription className="text-right">
                          أدخل تفاصيل مهمة الصيانة أدناه
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="task" className="text-right block">اسم المهمة</Label>
                          <Input
                            id="task"
                            value={formData.task}
                            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                            placeholder="مثال: تغيير زيت المحرك"
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dueDate" className="text-right block">تاريخ الصيانة</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kmInterval" className="text-right block">الفاصل بالكيلومترات (اختياري)</Label>
                          <Input
                            id="kmInterval"
                            value={formData.kmInterval}
                            onChange={(e) => setFormData({ ...formData, kmInterval: e.target.value })}
                            placeholder="مثال: 5000 كم"
                            className="text-right"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                            className="rounded-full"
                          >
                            إلغاء
                          </Button>
                          <Button
                            onClick={handleAddTask}
                            className="rounded-full"
                          >
                            إضافة
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <h3 className="font-bold text-right">مهام الصيانة الدورية</h3>
                </div>

                {/* Maintenance Plan Display */}
                {maintenancePlan ? (
                  <div className="space-y-4">
                    {/* Car Health Score */}
                    {maintenancePlan.carHealthScore && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-right font-semibold text-blue-900">درجة صحة السيارة</span>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-600">{maintenancePlan.carHealthScore}%</span>
                            <Car className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {maintenancePlan.warnings && maintenancePlan.warnings.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <h4 className="font-bold text-red-900">تحذيرات</h4>
                        </div>
                        <ul className="space-y-1 text-right">
                          {maintenancePlan.warnings.map((warning: string, index: number) => (
                            <li key={index} className="text-red-700 text-sm">• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {maintenancePlan.recommended && maintenancePlan.recommended.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="h-5 w-5 text-blue-600" />
                          <h4 className="font-bold text-blue-900">توصيات</h4>
                        </div>
                        <ul className="space-y-1 text-right">
                          {maintenancePlan.recommended.map((rec: string, index: number) => (
                            <li key={index} className="text-blue-700 text-sm">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Upcoming Tasks */}
                    {maintenancePlan.upcoming && maintenancePlan.upcoming.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-right">المهام القادمة</h4>
                        {maintenancePlan.upcoming.map((task: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 text-right space-y-2">
                                <div className="flex items-center gap-2 justify-end">
                                  <h4 className="font-semibold">{task.task}</h4>
                                  {task.priority && (
                                    <Badge
                                      variant={
                                        task.priority === 'High' ? 'destructive' :
                                          task.priority === 'Medium' ? 'default' :
                                            'secondary'
                                      }
                                      className="text-xs"
                                    >
                                      {task.priority === 'High' ? 'عاجل' :
                                        task.priority === 'Medium' ? 'متوسط' :
                                          'عادي'}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-end">
                                  {task.dueAtKM && (
                                    <span className="flex items-center gap-1">
                                      <span>{task.dueAtKM.toLocaleString()} كم</span>
                                      <Car className="h-4 w-4" />
                                    </span>
                                  )}
                                  {task.estimatedDays && (
                                    <span className="flex items-center gap-1">
                                      <span>خلال {task.estimatedDays} يوم</span>
                                      <Clock className="h-4 w-4" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد مهام صيانة قادمة حالياً
                      </p>
                    )}

                    {/* Regenerate Plan Button */}
                    <Button
                      onClick={handleGeneratePlan}
                      disabled={isGeneratingPlan}
                      className="w-full rounded-full"
                      variant="outline"
                    >
                      {isGeneratingPlan ? 'جاري التحديث...' : 'تحديث الخطة'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-muted-foreground">لم يتم إنشاء خطة صيانة بعد</p>
                    <Button
                      onClick={handleGeneratePlan}
                      disabled={isGeneratingPlan}
                      className="rounded-full"
                    >
                      {isGeneratingPlan ? 'جاري الإنشاء...' : 'إنشاء خطة صيانة'}
                    </Button>
                  </div>
                )}


              </Card>

            </div>
          </div>
        </div >
      </main >

      <Dialog open={!!selectedBookingForReview} onOpenChange={() => setSelectedBookingForReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تقييم الخدمة</DialogTitle>
          </DialogHeader>
          {selectedBookingForReview && (
            <div className="space-y-4 text-right">
              <div>
                <h4 className="font-bold mb-2">الخدمة المقدمة</h4>
                <p>{selectedBookingForReview.serviceType}</p>
                <p className="text-sm text-muted-foreground">
                  مع {selectedBookingForReview.mechanicId?.name || 'الميكانيكي'}
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-2">تقييم الخدمة</h4>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="text-2xl"
                    >
                      <Star
                        className={`h-8 w-8 ${star <= reviewData.rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-2">تعليقك (اختياري)</h4>
                <textarea
                  value={reviewData.feedback}
                  onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                  placeholder="شاركنا برأيك في الخدمة..."
                  className="w-full p-3 border rounded-lg text-right resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedBookingForReview(null)}
                  className="rounded-full"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  className="rounded-full"
                >
                  <CheckCircle className="h-4 w-4 ml-1" />
                  إرسال التقييم
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div >
  );
};

export default ClientProfile;
