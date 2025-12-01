import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* 404 Illustration */}
            <div className="mb-12">
              <div className="w-40 h-40 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-in shadow-xl">
                <AlertTriangle className="h-20 w-20 text-primary" />
              </div>
              <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent mb-6 animate-fade-in">
                404
              </h1>
            </div>

            {/* Error Message */}
            <Card className="p-12 mb-12 animate-slide-up shadow-2xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
              <h2 className="text-3xl font-bold mb-6 text-right bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                عذراً، الصفحة غير موجودة
              </h2>
              <p className="text-muted-foreground text-xl mb-8 text-right leading-relaxed">
                يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
                يرجى التحقق من الرابط أو العودة إلى الصفحة الرئيسية.
              </p>

              {/* Requested Path */}
              <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl p-6 mb-10 text-right border border-border/50">
                <p className="text-base text-muted-foreground mb-3 font-semibold">المسار المطلوب:</p>
                <code className="text-lg font-mono bg-card px-4 py-2 rounded-xl border border-border/30 shadow-sm">
                  {location.pathname}
                </code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  onClick={() => navigate("/")}
                  className="rounded-full px-8 py-4 text-lg font-bold hover-lift transition-all duration-300 bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 shadow-lg"
                  size="lg"
                >
                  <Home className="h-6 w-6 ml-3" />
                  العودة للرئيسية
                </Button>

                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="rounded-full px-8 py-4 text-lg font-semibold hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5 border-2"
                  size="lg"
                >
                  <ArrowLeft className="h-6 w-6 ml-3" />
                  الرجوع للخلف
                </Button>

                <Button
                  onClick={() => navigate("/store")}
                  variant="outline"
                  className="rounded-full px-8 py-4 text-lg font-semibold hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5 border-2"
                  size="lg"
                >
                  <Search className="h-6 w-6 ml-3" />
                  تصفح المتجر
                </Button>
              </div>
            </Card>

            {/* Popular Pages */}
            <Card className="p-10 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-2xl font-bold mb-8 text-right bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">الصفحات الشائعة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="justify-end h-auto p-4 rounded-xl hover-lift transition-all duration-300 hover:bg-primary/5 text-lg"
                >
                  <span>الصفحة الرئيسية</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/services")}
                  className="justify-end h-auto p-4 rounded-xl hover-lift transition-all duration-300 hover:bg-primary/5 text-lg"
                >
                  <span>خدماتنا</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/store")}
                  className="justify-end h-auto p-4 rounded-xl hover-lift transition-all duration-300 hover:bg-primary/5 text-lg"
                >
                  <span>المتجر</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/mechanics")}
                  className="justify-end h-auto p-4 rounded-xl hover-lift transition-all duration-300 hover:bg-primary/5 text-lg"
                >
                  <span>الميكانيكيين</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/ai-diagnosis")}
                  className="justify-end h-auto p-4 rounded-xl hover-lift transition-all duration-300 hover:bg-primary/5 text-lg"
                >
                  <span>التشخيص الذكي</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="justify-end h-auto p-4 rounded-xl hover-lift transition-all duration-300 hover:bg-primary/5 text-lg"
                >
                  <span>تسجيل الدخول</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
