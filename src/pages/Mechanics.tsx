import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Phone, Mail, MapPin, Wrench, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const mechanics = [
  {
    id: 1,
    name: "أحمد محمد",
    specialization: "إصلاح المحركات",
    experience: "8 سنوات",
    rating: 4.8,
    reviews: 156,
    phone: "+201091234567",
    email: "ahmed.mechanic@email.com",
    location: "أسوان، حي الصداقة",
    services: ["إصلاح المحركات", "تغيير الزيوت", "فحص دوري"],
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "محمد علي",
    specialization: "أنظمة الكهرباء",
    experience: "6 سنوات",
    rating: 4.9,
    reviews: 203,
    phone: "+201097654321",
    email: "mohamed.electric@email.com",
    location: "أسوان، حي السلام",
    services: ["إصلاح البطاريات", "أنظمة الإشعال", "الأنظمة الكهربائية"],
    image: "/placeholder.svg"
  },
  {
    id: 3,
    name: "محمد أحمد",
    specialization: "إصلاح الهيكل والطلاء",
    experience: "10 سنوات",
    rating: 4.7,
    reviews: 89,
    phone: "+201099876543",
    email: "mohamed.bodywork@email.com",
    location: "أسوان، حي النصر",
    services: ["إصلاح الهيكل", "الطلاء", "إزالة الصدأ"],
    image: "/placeholder.svg"
  },
  {
    id: 4,
    name: "حسن محمود",
    specialization: "إصلاح الإطارات والعجلات",
    experience: "5 سنوات",
    rating: 4.6,
    reviews: 134,
    phone: "+201092468135",
    email: "hassan.tires@email.com",
    location: "أسوان، حي الوحدة",
    services: ["تغيير الإطارات", "موازنة العجلات", "إصلاح الإطارات"],
    image: "/placeholder.svg"
  },
  {
    id: 5,
    name: "أحمد عبدالله",
    specialization: "صيانة دورية",
    experience: "7 سنوات",
    rating: 4.9,
    reviews: 178,
    phone: "+201098642975",
    email: "ahmed.maintenance@email.com",
    location: "أسوان، حي النهضة",
    services: ["الصيانة الدورية", "فحص شامل", "تغيير المرشحات"],
    image: "/placeholder.svg"
  },
  {
    id: 6,
    name: "محمود أحمد",
    specialization: "إصلاح ناقل الحركة",
    experience: "12 سنوات",
    rating: 4.8,
    reviews: 245,
    phone: "+201093579246",
    email: "mahmoud.transmission@email.com",
    location: "أسوان، حي الثورة",
    services: ["إصلاح ناقل الحركة", "صيانة القير", "إصلاح التفاضلي"],
    image: "/placeholder.svg"
  }
];

const Mechanics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");

  const filteredMechanics = mechanics.filter(
    (mechanic) => {
      const matchesSearch = mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mechanic.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = specializationFilter === "" || specializationFilter === "all" || mechanic.specialization === specializationFilter;
      return matchesSearch && matchesSpecialization;
    }
  );

  const specializations = [...new Set(mechanics.map(m => m.specialization))];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              الميكانيكيين المتاحين
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              اختر الميكانيكي المناسب لسيارتك من بين أفضل المتخصصين في المنطقة
            </p>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث بالاسم أو التخصص..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12 rounded-full h-12"
                />
              </div>

              <div className="flex justify-center">
                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                  <SelectTrigger className="w-64 rounded-full">
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التخصصات</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mechanics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMechanics.map((mechanic, index) => (
              <Card
                key={mechanic.id}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary transition-all hover-lift hover-glow animate-slide-up"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Mechanic Image */}
                <div className="bg-muted/50 rounded-xl h-32 mb-4 overflow-hidden">
                  <img
                    src={mechanic.image}
                    alt={mechanic.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Mechanic Info */}
                <div className="text-right mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(mechanic.rating)
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({mechanic.reviews})
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{mechanic.name}</h3>
                  </div>

                  <p className="text-primary font-semibold mb-1">{mechanic.specialization}</p>
                  <p className="text-sm text-muted-foreground mb-2">{mechanic.experience} خبرة</p>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{mechanic.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{mechanic.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{mechanic.email}</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2 text-right">الخدمات المقدمة:</p>
                  <div className="flex flex-wrap gap-1">
                    {mechanic.services.slice(0, 2).map((service, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {mechanic.services.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{mechanic.services.length - 2} أخرى
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {user && user.role === 'client' ? (
                    <Button
                      className="flex-1 rounded-full bg-primary hover:bg-primary-hover"
                      onClick={() => navigate(`/mechanic/${mechanic.id}`)}
                    >
                      <Wrench className="h-4 w-4 ml-2" />
                      احجز موعد
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => {
                        toast.error("يجب تسجيل الدخول كعميل أولاً لحجز موعد");
                        navigate('/auth?mode=login');
                      }}
                    >
                      <LogIn className="h-4 w-4 ml-2" />
                      تسجيل الدخول للحجز
                    </Button>
                  )}
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredMechanics.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                لم يتم العثور على ميكانيكيين
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Mechanics;