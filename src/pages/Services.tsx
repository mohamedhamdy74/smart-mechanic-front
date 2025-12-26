import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wrench, AlertTriangle, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Services = () => {
  // Fetch mechanics from API
  const { data: mechanicsData, isLoading, error } = useQuery({
    queryKey: ['mechanics-for-services'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/users/mechanics/public?limit=100');
      if (!response.ok) {
        throw new Error('فشل في تحميل البيانات');
      }
      const data = await response.json();
      return data.mechanics || [];
    },
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  // Extract unique services with mechanic counts
  const services = useMemo(() => {
    if (!mechanicsData) return [];

    const serviceMap = new Map<string, { count: number }>();

    mechanicsData.forEach((mechanic: any) => {
      mechanic.services?.forEach((service: string) => {
        const existing = serviceMap.get(service) || { count: 0 };
        serviceMap.set(service, { count: existing.count + 1 });
      });
    });

    // Convert to array and sort by count (most popular first)
    return Array.from(serviceMap.entries())
      .map(([name, data]) => ({
        title: name,
        mechanicsCount: data.count
      }))
      .sort((a, b) => b.mechanicsCount - a.mechanicsCount);
  }, [mechanicsData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">خدماتنا</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              اختر الخدمة التي تحتاجها واعثر على الميكانيكيين المتخصصين
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card/90 dark:bg-gray-900/90 rounded-2xl p-6 border border-border/50"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">حدث خطأ في تحميل الخدمات</h3>
              <p className="text-muted-foreground mb-4">يرجى المحاولة مرة أخرى</p>
              <Button onClick={() => window.location.reload()} className="rounded-full">
                إعادة المحاولة
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && services.length === 0 && (
            <div className="text-center py-20">
              <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد خدمات متاحة حالياً</h3>
              <p className="text-muted-foreground">لم يتم تسجيل أي ميكانيكيين بعد</p>
            </div>
          )}

          {/* Services Grid */}
          {!isLoading && !error && services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {services.map((service, index) => (
                <div
                  key={service.title}
                  className="group bg-card/90 dark:bg-gray-900/90 rounded-2xl p-6 border border-border/50 dark:border-gray-700/50 hover:border-primary transition-all hover-lift hover-glow animate-slide-up transition-colors duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Users className="h-4 w-4" />
                        <span>{service.mechanicsCount} ميكانيكي متخصص</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full rounded-full"
                    variant="outline"
                  >
                    <Link to={`/mechanics?service=${encodeURIComponent(service.title)}`}>
                      عرض الميكانيكيين
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}

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
