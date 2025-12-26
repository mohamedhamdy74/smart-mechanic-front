import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  User,
  Wrench,
  Phone,
  Mail,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const MechanicPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch mechanic data
  const { data: mechanicData, isLoading: isMechanicLoading, error: mechanicError } = useQuery({
    queryKey: ["mechanic-public", id],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:5000/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        cache: 'no-cache',
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error("الميكانيكي غير موجود");
        throw new Error("فشل في تحميل بيانات الميكانيكي");
      }
      const data = await res.json();
      return {
        id: data._id,
        name: data.name,
        specialization: data.skills?.length ? data.skills.join("، ") : "صيانة عامة",
        experience: data.experienceYears ? `${data.experienceYears} سنوات` : "خبرة متنوعة",
        rating: data.rating || 0,
        reviewsCount: data.completedBookings || 0,
        phone: data.phone || "غير محدد",
        email: data.email,
        location: data.location || "أسوان",
        bio: `ميكانيكي متخصص في ${data.specialty || "صيانة السيارات"} مع خبرة ${data.experienceYears || "متنوعة"} سنوات`,
        services: data.skills || ["صيانة عامة"],
        completedServices: data.completedBookings || 0,
        responseTime: `${data.responseTime || 0} دقيقة`,
        availabilityStatus: data.availabilityStatus || "available",
        profileImage: data.profileImage,
      };
    },
    enabled: !!id,
    staleTime: 30000,
  });

  // Fetch mechanic reviews
  const { data: reviewsData } = useQuery({
    queryKey: ["mechanic-reviews", id],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:5000/users/${id}/reviews`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        cache: 'no-cache',
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.reviews || [];
    },
    enabled: !!id,
    staleTime: 30000,
  });

  // Loading Skeleton
  if (isMechanicLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error Page
  if (mechanicError || !mechanicData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">
              {mechanicError?.message || "الميكانيكي غير موجود"}
            </h1>
            <Button
              onClick={() => navigate("/mechanics")}
              className="rounded-full"
            >
              العودة لقائمة الميكانيكيين
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const availabilityStatus = mechanicData.availabilityStatus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-primary/10 via-orange-500/5 to-background rounded-3xl p-10 mb-10 animate-bounce-in shadow-2xl border border-border/50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white overflow-hidden shadow-lg">
                {mechanicData.profileImage ? (
                  <img src={`http://localhost:5000/${mechanicData.profileImage}`} alt={mechanicData.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-primary" />
                )}
              </div>
              <div className="text-center md:text-right flex-1">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  {mechanicData.name}
                </h1>
                <p className="text-muted-foreground mb-3 text-lg">
                  {mechanicData.specialization}
                </p>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  {mechanicData.bio}
                </p>
                <div className="flex items-center gap-4 justify-center md:justify-start mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(mechanicData.rating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">
                    {mechanicData.rating.toFixed(1)} ({mechanicData.reviewsCount} تقييم)
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{mechanicData.experience} خبرة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{mechanicData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>{mechanicData.completedServices} خدمة مكتملة</span>
                  </div>
                  <Badge
                    variant={availabilityStatus === "available" ? "default" : "secondary"}
                    className={availabilityStatus === "available"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }
                  >
                    {availabilityStatus === "available" ? "متاح الآن" : "غير متاح حالياً"}
                  </Badge>
                </div>
              </div>
              <Button
                className="rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 text-white font-semibold px-8 py-6 text-lg hover-lift transition-all duration-300 shadow-lg"
                onClick={() => navigate(`/book-appointment/${mechanicData.id}`)}
              >
                <Calendar className="h-6 w-6 ml-2" />
                احجز موعد
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Services */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                <h2 className="text-3xl font-bold mb-8 text-right flex items-center gap-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  <Wrench className="h-8 w-8 text-primary" />
                  الخدمات المقدمة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mechanicData.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-6 rounded-2xl border border-border hover:border-primary transition-all duration-300 hover-lift hover-glow bg-gradient-to-r from-background to-muted/20"
                    >
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span className="font-semibold text-lg">{service}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Reviews */}
              <Card className="p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 text-right">
                  التقييمات والمراجعات
                </h2>
                <div className="space-y-4">
                  {reviewsData && reviewsData.length > 0 ? (
                    reviewsData.map((review: any, index: number) => (
                      <div key={index} className="border border-border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                              />
                            ))}
                            <span className="font-semibold">{review.rating}/5</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                        {review.comment && <p className="text-sm text-right mt-2">{review.comment}</p>}
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                          خدمة: {review.serviceType || "خدمة عامة"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد تقييمات أو مراجعات</p>
                      <p className="text-sm mt-2">ستظهر هنا جميع التقييمات والمراجعات من العملاء</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="p-8 bg-gradient-to-br from-primary/10 via-orange-500/5 to-background animate-slide-up shadow-xl border-border/50">
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  إحصائيات سريعة
                </h3>
                <div className="space-y-6 text-right">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">وقت الاستجابة</span>
                    <span className="font-bold text-lg text-primary">{mechanicData.responseTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">عدد الخدمات</span>
                    <span className="font-bold text-lg text-primary">{mechanicData.completedServices}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">معدل الرضا</span>
                    <span className="font-bold text-lg text-primary">{mechanicData.rating.toFixed(1)}/5</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">حالة التوفر</span>
                    <Badge
                      variant={availabilityStatus === "available" ? "default" : "secondary"}
                      className={`px-4 py-2 text-sm font-semibold ${availabilityStatus === "available" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                    >
                      {availabilityStatus === "available" ? "متاح" : "غير متاح"}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Contact Info */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50">
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  معلومات الاتصال
                </h3>
                <div className="space-y-4 text-right">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30 hover-lift transition-all duration-300">
                    <Phone className="h-6 w-6 text-primary" />
                    <span className="font-medium">{mechanicData.phone}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30 hover-lift transition-all duration-300">
                    <Mail className="h-6 w-6 text-primary" />
                    <span className="font-medium">{mechanicData.email}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30 hover-lift transition-all duration-300">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span className="font-medium">{mechanicData.location}</span>
                  </div>
                </div>
              </Card>

              {/* Book Appointment */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50">
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  حجز موعد
                </h3>
                <p className="text-base text-muted-foreground mb-6 text-right leading-relaxed">
                  احجز موعدك الآن واستمتع بخدمة سريعة وموثوقة
                </p>
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 text-white font-semibold py-6 text-lg hover-lift transition-all duration-300 shadow-lg"
                  onClick={() => navigate(`/book-appointment/${mechanicData.id}`)}
                >
                  <Calendar className="h-6 w-6 ml-2" />
                  احجز الآن
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MechanicPublicProfile;
