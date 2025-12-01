import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wrench, Droplet, Battery, Settings, Fuel, TrendingUp, Car, Shield, Zap, Gauge, Thermometer, Wind } from "lucide-react";

const allServices = [
  {
    icon: Wrench,
    title: "ميكانيكا عامة",
    description: "إصلاح شامل للمحرك والقطع الميكانيكية",
    price: "من 500 جنيه",
  },
  {
    icon: Droplet,
    title: "تغيير الزيت",
    description: "تبديل الزيت والفلاتر بأفضل الأنواع",
    price: "من 300 جنيه",
  },
  {
    icon: Battery,
    title: "كهرباء السيارات",
    description: "فحص وإصلاح الدوائر الكهربائية",
    price: "من 400 جنيه",
  },
  {
    icon: Settings,
    title: "فرامل",
    description: "فحص وتبديل أقراص وبطائن الفرامل",
    price: "من 600 جنيه",
  },
  {
    icon: TrendingUp,
    title: "ميزان وترصيص",
    description: "ضبط زوايا العجلات والترصيص",
    price: "من 200 جنيه",
  },
  {
    icon: Fuel,
    title: "تنظيف البخاخات",
    description: "تنظيف بخاخات الوقود بأحدث الأجهزة",
    price: "من 350 جنيه",
  },
  {
    icon: Car,
    title: "إصلاح الهيكل والطلاء",
    description: "إصلاح الأضرار وإعادة الطلاء بأحدث التقنيات",
    price: "من 1000 جنيه",
  },
  {
    icon: Shield,
    title: "صيانة دورية شاملة",
    description: "فحص شامل لجميع أنظمة السيارة وصيانتها",
    price: "من 800 جنيه",
  },
  {
    icon: Zap,
    title: "إصلاح ناقل الحركة",
    description: "فحص وإصلاح علب التروس والقير",
    price: "من 700 جنيه",
  },
  {
    icon: Gauge,
    title: "فحص الإطارات والعجلات",
    description: "تبديل وتوازن الإطارات وضبط الضغط",
    price: "من 250 جنيه",
  },
  {
    icon: Thermometer,
    title: "نظام التبريد",
    description: "فحص وإصلاح نظام تبريد المحرك",
    price: "من 450 جنيه",
  },
  {
    icon: Wind,
    title: "تكييف السيارة",
    description: "صيانة وإصلاح نظام التكييف والتهوية",
    price: "من 550 جنيه",
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">خدماتنا</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              نقدم مجموعة شاملة من خدمات الصيانة والإصلاح بأعلى جودة وأفضل الأسعار
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {allServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="group bg-card/90 dark:bg-gray-900/90 rounded-2xl p-6 border border-border/50 dark:border-gray-700/50 hover:border-primary transition-all hover-lift hover-glow animate-slide-up transition-colors duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="font-bold text-lg mb-1">{service.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {service.description}
                      </p>
                      <span className="text-primary font-semibold">{service.price}</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full rounded-full"
                    variant="outline"
                  >
                    <Link to={`/mechanics?service=${encodeURIComponent(service.title)}`}>احجز الآن</Link>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-hero dark:bg-gradient-to-br dark:from-gray-900/50 dark:via-gray-800/30 dark:to-black rounded-3xl p-8 md:p-12 text-center transition-colors duration-300">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              هل تحتاج خدمة خاصة؟
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              تواصل معنا الآن ودعنا نساعدك في إيجاد الحل المناسب لسيارتك
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary hover:bg-primary-hover"
            >
              <Link to="/auth?mode=register">تواصل معنا</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
