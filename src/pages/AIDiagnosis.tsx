import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Mic, MessageSquare, Lightbulb, Loader2, Star, MapPin, MessageCircle, Wrench, Calendar, Award, ArrowRight } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AIDiagnosis = () => {
  const API_URL = "http://localhost:5000/ai/diagnose";
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnosisText, setDiagnosisText] = useState<string | null>(null);
  const [recommendedMechanic, setRecommendedMechanic] = useState<any>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleResponse = (data: any) => {
    if (data.success) {
      setDiagnosisText(data.diagnosis);
      setRecommendedMechanic(data.recommendedMechanic);
      toast.success("تم التشخيص بنجاح");
    } else {
      toast.error(data.message || "فشل في التشخيص");
    }
  };

  const diagnoseText = async () => {
    if (!description.trim()) {
      toast.error("الرجاء كتابة وصف المشكلة");
      return;
    }
    setLoading(true);
    setDiagnosisText(null);
    setRecommendedMechanic(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ text: description }),
      });
      const data = await response.json();
      handleResponse(data);
    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setLoading(true);
      setDiagnosisText(null);
      setRecommendedMechanic(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        });
        const data = await response.json();
        handleResponse(data);
      } catch (error) {
        toast.error("خطأ في الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAudioSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setLoading(true);
      setDiagnosisText(null);
      setRecommendedMechanic(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        });
        const data = await response.json();
        handleResponse(data);
      } catch (error) {
        toast.error("خطأ في الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16 animate-bounce-in">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-full border border-primary/20">
              <Lightbulb className="h-6 w-6 text-primary" />
              <span className="text-primary font-bold text-lg">التشخيص الذكي</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent pb-4">
              عطلت في الطريق؟ إحنا معاك
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              اوصف مشكلة سيارتك بالكتابة أو الصوت أو الصورة، ونقدر نوجهك لأقرب ميكانيكي متخصص.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-card/90 dark:bg-gray-900/90 rounded-3xl p-10 border border-border/50 dark:border-gray-700/50 shadow-2xl animate-slide-up backdrop-blur-sm transition-colors duration-300">
            <div className="mb-8">
              <label className="block text-right font-bold text-xl mb-4">
                اكتب وصف المشكلة بتاعتك
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: السيارة مش بتدور والمحرك بيعمل صوت غريب..."
                className="min-h-[180px] text-right rounded-2xl text-lg p-6 border-2 hover:border-primary/50 transition-all duration-300"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <Button
                onClick={diagnoseText}
                disabled={loading}
                variant="outline"
                className="h-auto py-6 rounded-2xl hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5 border-2 disabled:opacity-50"
              >
                <div className="flex flex-col items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <span className="text-base font-semibold">تشخيص نصي</span>
                </div>
              </Button>

              <Button
                onClick={() => audioInputRef.current?.click()}
                disabled={loading}
                variant="outline"
                className="h-auto py-6 rounded-2xl hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5 border-2 disabled:opacity-50"
              >
                <div className="flex flex-col items-center gap-3">
                  <Mic className="h-8 w-8 text-primary" />
                  <span className="text-base font-semibold">رفع ملف صوتي</span>
                </div>
              </Button>

              <Button
                onClick={() => imageInputRef.current?.click()}
                disabled={loading}
                variant="outline"
                className="h-auto py-6 rounded-2xl hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5 border-2 disabled:opacity-50"
              >
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-8 w-8 text-primary" />
                  <span className="text-base font-semibold">ارفع صورة</span>
                </div>
              </Button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioSelect}
              style={{ display: 'none' }}
            />

            {/* Result Display */}
            {diagnosisText && (
              <div className="space-y-8 animate-fade-in">
                {/* Diagnosis Text */}
                <div className="bg-card/50 dark:bg-gray-800/50 rounded-3xl p-8 border border-primary/20">
                  <h3 className="text-xl font-bold mb-6 text-primary flex items-center gap-2">
                    <Lightbulb className="h-6 w-6" />
                    نتيجة التشخيص
                  </h3>
                  <div className="text-foreground/90 text-lg leading-loose whitespace-pre-wrap font-medium">
                    {diagnosisText}
                  </div>
                </div>

                {/* Recommended Mechanic Card */}
                {recommendedMechanic && (
                  <div className="bg-gradient-to-br from-card to-background dark:from-gray-900 dark:to-black rounded-3xl p-1 border-2 border-primary/30 shadow-2xl hover:shadow-primary/20 transition-all duration-500 group">
                    <div className="bg-card/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[22px] p-8 h-full">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

                        {/* Mechanic Avatar/Icon */}
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-orange-500 p-1 shadow-lg">
                            <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                              <Wrench className="h-10 w-10 text-primary" />
                            </div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-card shadow-sm">
                            متاح الآن
                          </div>
                        </div>

                        {/* Mechanic Info */}
                        <div className="flex-1 text-center md:text-right space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center md:justify-start gap-2">
                              {recommendedMechanic.name}
                              <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                متخصص {recommendedMechanic.specialty}
                              </span>
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-foreground">{recommendedMechanic.rating?.toFixed(1) || "5.0"}</span>
                                <span>({recommendedMechanic.completedBookings || 0} حجز)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{recommendedMechanic.location || "القاهرة"}</span>
                                {recommendedMechanic.distance && (
                                  <span className="text-primary font-bold">({recommendedMechanic.distance.toFixed(1)} كم)</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            {recommendedMechanic.skills?.slice(0, 3).map((skill: string, idx: number) => (
                              <span key={idx} className="bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-lg text-sm border border-border/50">
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Button
                              onClick={() => navigate(`/mechanic-public/${recommendedMechanic._id}`)}
                              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2 group-hover:scale-105"
                            >
                              عرض الملف الشخصي
                              <ArrowRight className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                            </Button>

                            <Button
                              onClick={() => navigate(`/chat?userId=${recommendedMechanic._id}`)}
                              variant="outline"
                              className="px-8 py-6 rounded-xl text-lg font-bold border-2 hover:bg-secondary/50 transition-all duration-300 flex items-center gap-2"
                            >
                              <MessageCircle className="h-5 w-5" />
                              ابدأ محادثة
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Diagnosis Button - Always visible */}
            <Button
              onClick={diagnoseText}
              disabled={loading}
              size="lg"
              className="w-full mt-10 rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 text-xl font-bold py-8 hover-lift transition-all duration-300 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              {diagnosisText ? "تشخيص مشكلة جديدة" : "تشخيص المشكلة"}
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-8 bg-card/90 dark:bg-gray-900/90 rounded-3xl border border-border/50 dark:border-gray-700/50 animate-slide-up shadow-xl hover-lift transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-4">تشخيص ذكي</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                الذكاء الاصطناعي يحلل المشكلة ويقدم الحلول
              </p>
            </div>

            <div className="text-center p-8 bg-card/90 dark:bg-gray-900/90 rounded-3xl border border-border/50 dark:border-gray-700/50 animate-slide-up shadow-xl hover-lift transition-all duration-300" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-4">ميكانيكي قريب</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                اختيار ميكانيكي متاح + قريب للبحث
              </p>
            </div>

            <div className="text-center p-8 bg-card/90 dark:bg-gray-900/90 rounded-3xl border border-border/50 dark:border-gray-700/50 animate-slide-up shadow-xl hover-lift transition-all duration-300" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-4">دفع وفواتير آمنة</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                سهلة وقائمة مضمونة وفاتورة جاهزة
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-16 text-center bg-gradient-to-br from-primary/10 via-orange-500/5 to-background dark:from-gray-900/50 dark:via-gray-800/30 dark:to-black rounded-3xl p-12 border border-primary/20 dark:border-gray-700/50 animate-slide-up shadow-xl transition-colors duration-300" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">احجز فوري</h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              او اتصل فورا واحجز ميكانيكي قريب
            </p>
            <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 px-10 py-6 text-lg font-bold hover-lift transition-all duration-300 shadow-lg">
              اتصل بميكانيكي الآن
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIDiagnosis;
