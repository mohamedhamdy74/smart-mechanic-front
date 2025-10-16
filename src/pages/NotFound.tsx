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
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-16 w-16 text-primary" />
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4 animate-fade-in">
                404
              </h1>
            </div>

            {/* Error Message */}
            <Card className="p-8 mb-8 animate-slide-up">
              <h2 className="text-2xl font-bold mb-4 text-right">
                عذراً، الصفحة غير موجودة
              </h2>
              <p className="text-muted-foreground text-lg mb-6 text-right leading-relaxed">
                يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
                يرجى التحقق من الرابط أو العودة إلى الصفحة الرئيسية.
              </p>

              {/* Requested Path */}
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-right">
                <p className="text-sm text-muted-foreground mb-1">المسار المطلوب:</p>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                  {location.pathname}
                </code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/")}
                  className="rounded-full"
                  size="lg"
                >
                  <Home className="h-5 w-5 ml-2" />
                  العودة للرئيسية
                </Button>

                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="rounded-full"
                  size="lg"
                >
                  <ArrowLeft className="h-5 w-5 ml-2" />
                  الرجوع للخلف
                </Button>

                <Button
                  onClick={() => navigate("/store")}
                  variant="outline"
                  className="rounded-full"
                  size="lg"
                >
                  <Search className="h-5 w-5 ml-2" />
                  تصفح المتجر
                </Button>
              </div>
            </Card>

            {/* Popular Pages */}
            <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-xl font-bold mb-4 text-right">الصفحات الشائعة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="justify-end h-auto p-3"
                >
                  <span>الصفحة الرئيسية</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/services")}
                  className="justify-end h-auto p-3"
                >
                  <span>خدماتنا</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/store")}
                  className="justify-end h-auto p-3"
                >
                  <span>المتجر</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/mechanics")}
                  className="justify-end h-auto p-3"
                >
                  <span>الميكانيكيين</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/ai-diagnosis")}
                  className="justify-end h-auto p-3"
                >
                  <span>التشخيص الذكي</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="justify-end h-auto p-3"
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
