import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Phone, Mail, Car, User, Wrench } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for mechanics - should match MechanicPublicProfile
const mechanicsData = {
  1: {
    id: 1,
    name: "أحمد محمد",
    specialization: "إصلاح المحركات",
    location: "أسوان، حي الصداقة",
    services: ["إصلاح المحركات", "تغيير الزيوت", "فحص دوري"]
  },
  2: {
    id: 2,
    name: "محمد علي",
    specialization: "أنظمة الكهرباء",
    location: "أسوان، حي الصفا",
    services: ["إصلاح البطاريات", "أنظمة الإشعال", "الأنظمة الكهربائية"]
  },
  3: {
    id: 3,
    name: "محمد أحمد",
    specialization: "إصلاح الهيكل والطلاء",
    location: "أسوان، حي النصر",
    services: ["إصلاح الهيكل", "الطلاء", "إزالة الصدأ"]
  },
  4: {
    id: 4,
    name: "علي حسن",
    specialization: "إصلاح الإطارات والعجلات",
    location: "أسوان، حي العزيزية",
    services: ["تغيير الإطارات", "موازنة العجلات", "إصلاح الإطارات"]
  },
  5: {
    id: 5,
    name: "أحمد عبدالله",
    specialization: "صيانة دورية",
    location: "أسوان، حي النهضة",
    services: ["الصيانة الدورية", "فحص شامل", "تغيير المرشحات"]
  },
  6: {
    id: 6,
    name: "خالد عبدالله",
    specialization: "إصلاح ناقل الحركة",
    location: "أسوان، حي النخيل",
    services: ["إصلاح ناقل الحركة", "صيانة القير", "إصلاح التفاضلي"]
  }
};

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mechanic, setMechanic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    serviceType: "",
    appointmentDate: "",
    appointmentTime: "",
    carBrand: "",
    carModel: "",
    carYear: "",
    licensePlate: "",
    problemDescription: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    preferredLocation: "",
    estimatedCost: ""
  });

  // Fetch mechanic data using React Query
  const { data: mechanicData, isLoading, error: queryError } = useQuery({
    queryKey: ['mechanic-booking', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات الميكانيكي');
      }

      const mechanicData = await response.json();
      return {
        id: mechanicData._id,
        name: mechanicData.name,
        specialization: mechanicData.specialty || mechanicData.skills?.join(', ') || 'ميكانيكي عام',
        location: mechanicData.location,
        services: mechanicData.skills || ['إصلاح عام'],
        phone: mechanicData.phone,
        email: mechanicData.email,
        rating: mechanicData.rating || 0,
        experienceYears: mechanicData.experienceYears || 0
      };
    },
    enabled: !!id,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Update local state when data changes
  useEffect(() => {
    if (mechanicData) {
      setMechanic(mechanicData);
    }
  }, [mechanicData]);

  // Handle loading and error states
  useEffect(() => {
    setLoading(isLoading);
    if (queryError) {
      console.error('Failed to fetch mechanic:', queryError);
      // Fallback to mock data if API fails
      const mockMechanic = mechanicsData[id as unknown as keyof typeof mechanicsData];
      setMechanic(mockMechanic);
    }
  }, [isLoading, queryError, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-6xl">
            {/* Header Skeleton */}
            <div className="text-center mb-12 animate-bounce-in">
              <Skeleton className="h-12 w-96 mx-auto mb-6" />
              <Skeleton className="h-6 w-64 mx-auto" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Skeleton */}
              <div className="lg:col-span-2">
                <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-48" />
                      <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <Skeleton className="h-6 w-32" />
                      <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-24 w-full" />
                    </div>

                    <div className="space-y-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-10 w-full" />
                    </div>

                    <Skeleton className="h-14 w-full rounded-full" />
                  </div>
                </Card>
              </div>

              {/* Sidebar Skeleton */}
              <div className="space-y-8">
                <Card className="p-8 bg-gradient-to-br from-primary/10 via-orange-500/5 to-background dark:from-gray-900/50 dark:via-gray-800/30 dark:to-black animate-slide-up shadow-xl border-border/50 dark:border-gray-700/50 transition-colors duration-300">
                  <div className="text-center">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6" />
                    <Skeleton className="h-6 w-32 mx-auto mb-2" />
                    <Skeleton className="h-5 w-40 mx-auto mb-4" />
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                </Card>

                <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                  <Skeleton className="h-6 w-32 mb-6" />
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!mechanic) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">الميكانيكي غير موجود</h1>
            <Button onClick={() => navigate("/mechanics")} className="rounded-full">
              العودة لقائمة الميكانيكيين
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.serviceType || !formData.appointmentDate || !formData.appointmentTime ||
        !formData.carBrand || !formData.carModel || !formData.licensePlate ||
        !formData.preferredLocation) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const bookingData = {
        mechanicId: mechanic.id,
        serviceType: formData.serviceType,
        description: formData.problemDescription || `طلب خدمة: ${formData.serviceType}`,
        appointmentDate: new Date(formData.appointmentDate).toISOString(),
        appointmentTime: formData.appointmentTime,
        carInfo: `${formData.carBrand} ${formData.carModel} ${formData.carYear || ''}`.trim(),
        licensePlate: formData.licensePlate,
        location: formData.preferredLocation || user?.location || mechanic.location,
        // estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined, // Removed
      };

      const response = await fetch('http://localhost:5000/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("تم إرسال طلب الحجز بنجاح! سيتم إشعارك برد الميكانيكي");
        navigate("/profile/client");
      } else {
        const error = await response.json();
        toast.error(error.message || "فشل في إرسال طلب الحجز");
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      toast.error("حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-bounce-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              حجز موعد مع {mechanic.name}
            </h1>
            <p className="text-muted-foreground text-xl">
              {mechanic.specialization} • {mechanic.location}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Service Type - Multiple Selection */}
                  <div className="space-y-2">
                    <Label className="text-right block font-semibold">
                      الخدمات المطلوبة * (يمكن اختيار أكثر من خدمة)
                    </Label>
                    <div className="space-y-2">
                      {mechanic.services && mechanic.services.length > 0 ? (
                        mechanic.services.map((service, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`service-${index}`}
                              checked={formData.serviceType.includes(service)}
                              onChange={(e) => {
                                const selectedServices = e.target.checked
                                  ? [...formData.serviceType.split(', '), service].filter(s => s)
                                  : formData.serviceType.split(', ').filter(s => s !== service);
                                setFormData({...formData, serviceType: selectedServices.join(', ')});
                              }}
                              className="rounded"
                            />
                            <label htmlFor={`service-${index}`} className="text-right cursor-pointer">
                              {service}
                            </label>
                          </div>
                        ))
                      ) : (
                        <>
                          {["صيانة دورية", "إصلاح المحرك", "إصلاح الكهرباء", "إصلاح الفرامل", "تغيير الزيوت", "إصلاح الإطارات", "فحص شامل", "إصلاح ناقل الحركة"].map((service, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`service-${index}`}
                                checked={formData.serviceType.includes(service)}
                                onChange={(e) => {
                                  const selectedServices = e.target.checked
                                    ? [...formData.serviceType.split(', '), service].filter(s => s)
                                    : formData.serviceType.split(', ').filter(s => s !== service);
                                  setFormData({...formData, serviceType: selectedServices.join(', ')});
                                }}
                                className="rounded"
                              />
                              <label htmlFor={`service-${index}`} className="text-right cursor-pointer">
                                {service}
                              </label>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    {formData.serviceType && (
                      <p className="text-xs text-muted-foreground text-right">
                        الخدمات المختارة: {formData.serviceType}
                      </p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointmentDate" className="text-right block">
                        تاريخ الموعد *
                      </Label>
                      <Input
                        id="appointmentDate"
                        type="date"
                        value={formData.appointmentDate}
                        onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                        className="text-right"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointmentTime" className="text-right block">
                        وقت الموعد *
                      </Label>
                      <Input
                        id="appointmentTime"
                        type="time"
                        value={formData.appointmentTime}
                        onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                        className="text-right"
                      />
                    </div>
                  </div>

                  {/* Car Information */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-bold text-right">معلومات السيارة</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="carBrand" className="text-right block">الماركة</Label>
                        <Input
                          id="carBrand"
                          value={formData.carBrand}
                          onChange={(e) => setFormData({...formData, carBrand: e.target.value})}
                          placeholder="مثال: تويوتا"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carModel" className="text-right block">الموديل</Label>
                        <Input
                          id="carModel"
                          value={formData.carModel}
                          onChange={(e) => setFormData({...formData, carModel: e.target.value})}
                          placeholder="مثال: كامري"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carYear" className="text-right block">سنة الصنع</Label>
                        <Input
                          id="carYear"
                          value={formData.carYear}
                          onChange={(e) => setFormData({...formData, carYear: e.target.value})}
                          placeholder="2020"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licensePlate" className="text-right block">رقم اللوحة</Label>
                        <Input
                          id="licensePlate"
                          value={formData.licensePlate}
                          onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                          placeholder="رقم اللوحة"
                          className="text-right"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="space-y-2">
                    <Label htmlFor="problemDescription" className="text-right block">
                      وصف المشكلة (اختياري)
                    </Label>
                    <Textarea
                      id="problemDescription"
                      value={formData.problemDescription}
                      onChange={(e) => setFormData({...formData, problemDescription: e.target.value})}
                      placeholder="وصف المشكلة التي تواجهها في السيارة..."
                      className="text-right"
                      rows={3}
                    />
                  </div>


                  {/* Preferred Location */}
                  <div className="space-y-2">
                    <Label className="text-right block font-semibold">مكان الخدمة المفضل</Label>
                    <Input
                      placeholder="أدخل العنوان المطلوب للخدمة (مثل: القاهرة، شارع الهرم، بجانب مسجد الفتح)"
                      value={formData.preferredLocation || ''}
                      onChange={(e) => setFormData({...formData, preferredLocation: e.target.value})}
                      className="text-right"
                      required
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      يرجى كتابة العنوان بالتفصيل ليتمكن الميكانيكي من الوصول إليك بسهولة
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full rounded-full py-6 text-lg font-semibold hover-lift transition-all duration-300 shadow-lg bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600">
                    <Calendar className="h-6 w-6 ml-3" />
                    تأكيد الحجز
                  </Button>
                </form>
              </Card>
            </div>

            {/* Mechanic Info Sidebar */}
            <div className="space-y-8">
              {/* Mechanic Card */}
              <Card className="p-8 bg-gradient-to-br from-primary/10 via-orange-500/5 to-background dark:from-gray-900/50 dark:via-gray-800/30 dark:to-black animate-slide-up shadow-xl border-border/50 dark:border-gray-700/50 transition-colors duration-300">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30 mx-auto mb-6 shadow-lg">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{mechanic.name}</h3>
                  <p className="text-primary font-semibold mb-4 text-lg">{mechanic.specialization}</p>
                  <div className="flex items-center justify-center gap-3 text-base text-muted-foreground mb-4">
                    <MapPin className="h-5 w-5" />
                    <span>{mechanic.location}</span>
                  </div>
                  {mechanic.rating > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-lg font-semibold">{mechanic.rating.toFixed(1)}</span>
                      <span className="text-yellow-500 text-xl">⭐</span>
                    </div>
                  )}
                  {mechanic.experienceYears && (
                    <p className="text-sm text-muted-foreground font-medium">
                      {mechanic.experienceYears} سنوات خبرة
                    </p>
                  )}
                </div>
              </Card>

              {/* Services Offered */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300" style={{ animationDelay: "0.1s" }}>
                <h4 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">الخدمات المتاحة</h4>
                <div className="space-y-4">
                  {mechanic.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3 text-right p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Wrench className="h-5 w-5 text-primary" />
                      <span className="text-base font-medium">{service}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Important Notes */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/50 transition-colors duration-300" style={{ animationDelay: "0.2s" }}>
                <h4 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ملاحظات مهمة</h4>
                <div className="space-y-4 text-base text-right text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>سيتم تأكيد الموعد خلال 24 ساعة</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>يرجى التأكد من صحة رقم الهاتف</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>يمكن إلغاء الموعد قبل 24 ساعة</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>الدفع عند اكتمال الخدمة</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookAppointment;