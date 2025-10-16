import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Mic, MessageSquare, Lightbulb } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AIDiagnosis = () => {
  const [description, setDescription] = useState("");

  const handleDiagnose = () => {
    if (!description.trim()) {
      toast.error("الرجاء كتابة وصف المشكلة");
      return;
    }
    toast.success("جاري التشخيص... قد يستغرق بضع ثوانٍ");
    // In a real app, this would call an AI API
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold">التشخيص الذكي</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              عطلت في الطريق؟ إحنا معاك
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              اوصف مشكلة سيارتك بالكتابة أو الصوت أو اكتب، وصف المشكلة بتاعتك و نقدر نوجهك لأقرب ميكانيكي .
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-slide-up">
            <div className="mb-6">
              <label className="block text-right font-semibold mb-3">
                اكتب وصف المشكلة بتاعتك  
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: السيارة مش بتدور والمحرك بيعمل صوت غريب..."
                className="min-h-[150px] text-right rounded-xl"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Button
                variant="outline"
                className="h-auto py-4 rounded-xl hover:border-primary hover:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <span className="text-sm">تشخيص نصي</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 rounded-xl hover:border-primary hover:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-2">
                  <Mic className="h-6 w-6 text-primary" />
                  <span className="text-sm">سجل صوت</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 rounded-xl hover:border-primary hover:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="text-sm">ارفع صورة</span>
                </div>
              </Button>
            </div>

            <Button
              onClick={handleDiagnose}
              size="lg"
              className="w-full rounded-full bg-primary hover:bg-primary-hover text-lg py-6"
            >
              تشخيص المشكلة
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-card rounded-2xl border border-border animate-slide-up">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">تشخيص ذكي</h3>
              <p className="text-sm text-muted-foreground">
                الذكاء الاصطناعي يحلل المشكلة ويقدم الحلول
              </p>
            </div>

            <div className="text-center p-6 bg-card rounded-2xl border border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">ميكانيكي قريب</h3>
              <p className="text-sm text-muted-foreground">
                اختيار ميكانيكي متاح + قريب للبحث
              </p>
            </div>

            <div className="text-center p-6 bg-card rounded-2xl border border-border animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">دفع وفواتير آمنة</h3>
              <p className="text-sm text-muted-foreground">
                سهلة وقائمة مضمونة وفاتورة جاهزة
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-12 text-center bg-gradient-hero rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-2">احجز فوري</h3>
            <p className="text-muted-foreground mb-4">
              او اتصل فورا بخدمي واحجز ميكانيكي قريب
            </p>
            <Button size="lg" className="rounded-full bg-primary hover:bg-primary-hover">
              اتصل ميكانيكي الآن
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIDiagnosis;
