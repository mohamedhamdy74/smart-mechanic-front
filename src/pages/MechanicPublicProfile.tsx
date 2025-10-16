import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Star, User, Wrench, Phone, Mail, CheckCircle, TrendingUp } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

// Mock data for mechanics - in real app this would come from API
const mechanicsData = {
  1: {
    id: 1,
    name: "أحمد محمد",
    specialization: "إصلاح المحركات",
    experience: "8 سنوات",
    rating: 4.8,
    reviews: 156,
    phone: "+966501234567",
    email: "ahmed.mechanic@email.com",
    location: "أسوان، حي الصداقة",
    bio: "ميكانيكي متخصص في إصلاح جميع أنواع المحركات مع خبرة 8 سنوات في مجال الصيانة الشاملة",
    services: ["إصلاح المحركات", "تغيير الزيوت", "فحص دوري"],
    completedServices: 245,
    responseTime: "ساعة",
    priceRange: "150-500 ريال",
    image: "/placeholder.svg",
    recentWork: [
      { service: "إصلاح محرك تويوتا كامري", date: "15 ديسمبر 2024", rating: 5 },
      { service: "تغيير زيت محرك هيونداي", date: "12 ديسمبر 2024", rating: 5 },
      { service: "فحص شامل لسيارة نيسان", date: "10 ديسمبر 2024", rating: 4 },
    ]
  },
  2: {
    id: 2,
    name: "محمد علي",
    specialization: "أنظمة الكهرباء",
    experience: "6 سنوات",
    rating: 4.9,
    reviews: 203,
    phone: "+966507654321",
    email: "mohamed.electric@email.com",
    location: "أسوان، حي الصفا",
    bio: "خبير في أنظمة الكهرباء والإلكترونيات للسيارات الحديثة",
    services: ["إصلاح البطاريات", "أنظمة الإشعال", "الأنظمة الكهربائية"],
    completedServices: 189,
    responseTime: "45 دقيقة",
    priceRange: "100-400 ريال",
    image: "/placeholder.svg",
    recentWork: [
      { service: "إصلاح بطارية سيارة", date: "14 ديسمبر 2024", rating: 5 },
      { service: "تغيير شمعات الإشعال", date: "11 ديسمبر 2024", rating: 5 },
      { service: "إصلاح نظام الإشعال", date: "8 ديسمبر 2024", rating: 5 },
    ]
  },
  3: {
    id: 3,
    name: "محمد أحمد",
    specialization: "إصلاح الهيكل والطلاء",
    experience: "10 سنوات",
    rating: 4.7,
    reviews: 89,
    phone: "+201099876543",
    email: "mohamed.bodywork@email.com",
    location: "أسوان، حي النصر",
    bio: "متخصص في إصلاح الهيكل والطلاء بأحدث التقنيات والمعدات",
    services: ["إصلاح الهيكل", "الطلاء", "إزالة الصدأ"],
    completedServices: 134,
    responseTime: "ساعة ونصف",
    priceRange: "200-800 جنيه",
    image: "/placeholder.svg",
    recentWork: [
      { service: "طلاء سيارة كيا", date: "13 ديسمبر 2024", rating: 5 },
      { service: "إصلاح هيكل تويوتا", date: "9 ديسمبر 2024", rating: 4 },
      { service: "إزالة صدأ من السيارة", date: "5 ديسمبر 2024", rating: 5 },
    ]
  },
  4: {
    id: 4,
    name: "علي حسن",
    specialization: "إصلاح الإطارات والعجلات",
    experience: "5 سنوات",
    rating: 4.6,
    reviews: 134,
    phone: "+966502468135",
    email: "ali.tires@email.com",
    location: "أسوان، حي العزيزية",
    bio: "خبير في صيانة وإصلاح الإطارات والعجلات لجميع أنواع السيارات",
    services: ["تغيير الإطارات", "موازنة العجلات", "إصلاح الإطارات"],
    completedServices: 167,
    responseTime: "30 دقيقة",
    priceRange: "50-300 ريال",
    image: "/placeholder.svg",
    recentWork: [
      { service: "تغيير إطارات هيونداي", date: "16 ديسمبر 2024", rating: 5 },
      { service: "موازنة عجلات تويوتا", date: "14 ديسمبر 2024", rating: 4 },
      { service: "إصلاح إطار مثقوب", date: "12 ديسمبر 2024", rating: 5 },
    ]
  },
  5: {
    id: 5,
    name: "أحمد عبدالله",
    specialization: "صيانة دورية",
    experience: "7 سنوات",
    rating: 4.9,
    reviews: 178,
    phone: "+201098642975",
    email: "ahmed.maintenance@email.com",
    location: "أسوان، حي النهضة",
    bio: "متخصص في الصيانة الدورية الشاملة وفحص السيارات بأحدث الأدوات",
    services: ["الصيانة الدورية", "فحص شامل", "تغيير المرشحات"],
    completedServices: 223,
    responseTime: "ساعة",
    priceRange: "80-350 جنيه",
    image: "/placeholder.svg",
    recentWork: [
      { service: "صيانة دورية كاملة", date: "15 ديسمبر 2024", rating: 5 },
      { service: "فحص شامل للسيارة", date: "10 ديسمبر 2024", rating: 5 },
      { service: "تغيير مرشحات السيارة", date: "7 ديسمبر 2024", rating: 5 },
    ]
  },
  6: {
    id: 6,
    name: "خالد عبدالله",
    specialization: "إصلاح ناقل الحركة",
    experience: "12 سنوات",
    rating: 4.8,
    reviews: 245,
    phone: "+966503579246",
    email: "khaled.transmission@email.com",
    location: "أسوان، حي النخيل",
    bio: "خبير في إصلاح أنظمة نقل الحركة والقير بجميع أنواعه",
    services: ["إصلاح ناقل الحركة", "صيانة القير", "إصلاح التفاضلي"],
    completedServices: 312,
    responseTime: "ساعة ونصف",
    priceRange: "300-1000 ريال",
    image: "/placeholder.svg",
    recentWork: [
      { service: "إصلاح قير أوتوماتيك", date: "14 ديسمبر 2024", rating: 5 },
      { service: "صيانة ناقل حركة يدوي", date: "11 ديسمبر 2024", rating: 4 },
      { service: "إصلاح التفاضلي", date: "8 ديسمبر 2024", rating: 5 },
    ]
  }
};

const MechanicPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mechanic = mechanicsData[id as unknown as keyof typeof mechanicsData];

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

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Profile Header */}
          <div className="bg-gradient-hero rounded-3xl p-8 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white">
                <User className="h-16 w-16 text-primary" />
              </div>
              <div className="text-center md:text-right flex-1">
                <h1 className="text-3xl font-bold mb-2">{mechanic.name}</h1>
                <p className="text-muted-foreground mb-2">{mechanic.specialization}</p>
                <p className="text-sm text-muted-foreground mb-4">{mechanic.bio}</p>
                <div className="flex items-center gap-4 justify-center md:justify-start mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{mechanic.rating} ({mechanic.reviews} تقييم)</span>
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{mechanic.experience} خبرة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{mechanic.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>{mechanic.completedServices} خدمة مكتملة</span>
                  </div>
                </div>
              </div>
              <Button
                className="rounded-full bg-white text-primary hover:bg-white/90"
                onClick={() => navigate(`/book-appointment/${mechanic.id}`)}
              >
                <Calendar className="h-5 w-5 ml-2" />
                احجز موعد
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Services */}
              <Card className="p-6 animate-slide-up">
                <h2 className="text-2xl font-bold mb-6 text-right flex items-center gap-2">
                  <Wrench className="h-6 w-6 text-primary" />
                  الخدمات المقدمة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mechanic.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{service}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Work */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h2 className="text-2xl font-bold mb-6 text-right">الأعمال الأخيرة</h2>
                <div className="space-y-4">
                  {mechanic.recentWork.map((work, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">{work.service}</h3>
                          <p className="text-sm text-muted-foreground">{work.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: work.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="p-6 bg-gradient-hero animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="font-bold mb-4 text-right">إحصائيات سريعة</h3>
                <div className="space-y-4 text-right">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">وقت الاستجابة</span>
                    <span className="font-bold">{mechanic.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">نطاق الأسعار</span>
                    <span className="font-bold">{mechanic.priceRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">عدد الخدمات</span>
                    <span className="font-bold">{mechanic.completedServices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">معدل الرضا</span>
                    <span className="font-bold">{mechanic.rating}/5</span>
                  </div>
                </div>
              </Card>

              {/* Contact Info */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <h3 className="font-bold mb-4 text-right">معلومات الاتصال</h3>
                <div className="space-y-3 text-right">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>{mechanic.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>{mechanic.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{mechanic.location}</span>
                  </div>
                </div>
              </Card>

              {/* Book Appointment */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <h3 className="font-bold mb-4 text-right">حجز موعد</h3>
                <p className="text-sm text-muted-foreground mb-4 text-right">
                  احجز موعدك الآن واستمتع بخدمة سريعة وموثوقة
                </p>
                <Button
                  className="w-full rounded-full"
                  onClick={() => navigate(`/book-appointment/${mechanic.id}`)}
                >
                  <Calendar className="h-5 w-5 ml-2" />
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