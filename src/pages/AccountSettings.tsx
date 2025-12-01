import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/store/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Settings, User, Shield, Bell } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  // كل البيانات الإضافية حسب نوع المستخدم
  carBrand?: string;
  carModel?: string;
  carYear?: string;
  plateNumber?: string;
  specialty?: string;
  experience?: string;
  workshopName?: string;
  address?: string;
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/profile`);
        setProfile(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error("حدث خطأ في تحميل بيانات الحساب");
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6">
            <Card className="animate-fade-in shadow-xl border-border/50">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg text-muted-foreground">
                  جاري تحميل البيانات...
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6">
            <Card className="animate-fade-in shadow-xl border-border/50">
              <CardContent className="p-12 text-center">
                <p className="text-lg text-muted-foreground">
                  لم يتم العثور على البيانات
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-bounce-in">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-full border border-primary/20">
              <Settings className="h-6 w-6 text-primary" />
              <span className="text-primary font-bold text-lg">
                إعدادات الحساب
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              إدارة حسابك الشخصي
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              عرض وإدارة بيانات حسابك الشخصية وإعداداتك
            </p>
          </div>

          <Card className="animate-slide-up shadow-2xl border-border/50">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl font-bold text-right bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                معلومات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* البيانات الأساسية */}
                <div
                  className="space-y-6 animate-slide-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 transition-colors duration-300">
                    <User className="h-6 w-6 text-blue-600" />
                    <div className="flex-1 text-right">
                      <Label className="text-right block font-semibold text-blue-900">
                        الاسم
                      </Label>
                      <Input
                        value={profile.name}
                        readOnly
                        className="text-right border-0 bg-transparent font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800/50 transition-colors duration-300">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div className="flex-1 text-right">
                      <Label className="text-right block font-semibold text-green-900">
                        البريد الإلكتروني
                      </Label>
                      <Input
                        value={profile.email}
                        readOnly
                        className="text-right border-0 bg-transparent font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl border border-purple-200 dark:border-purple-800/50 transition-colors duration-300">
                    <Bell className="h-6 w-6 text-purple-600" />
                    <div className="flex-1 text-right">
                      <Label className="text-right block font-semibold text-purple-900">
                        رقم الهاتف
                      </Label>
                      <Input
                        value={profile.phone}
                        readOnly
                        className="text-right border-0 bg-transparent font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200 dark:border-orange-800/50 transition-colors duration-300">
                    <Settings className="h-6 w-6 text-orange-600" />
                    <div className="flex-1 text-right">
                      <Label className="text-right block font-semibold text-orange-900">
                        الموقع
                      </Label>
                      <Input
                        value={profile.location}
                        readOnly
                        className="text-right border-0 bg-transparent font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* البيانات الخاصة حسب نوع المستخدم */}
                <div
                  className="space-y-6 animate-slide-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  {user?.role === "client" && (
                    <>
                      <div className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl border border-cyan-200 dark:border-cyan-800/50 transition-colors duration-300">
                        <h3 className="text-xl font-bold text-right mb-4 text-cyan-900">
                          بيانات السيارة
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                            <div className="flex-1 text-right">
                              <Label className="text-right block font-semibold text-cyan-900">
                                ماركة السيارة
                              </Label>
                              <Input
                                value={profile.carBrand}
                                readOnly
                                className="text-right border-0 bg-transparent font-medium"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                            <div className="flex-1 text-right">
                              <Label className="text-right block font-semibold text-cyan-900">
                                موديل السيارة
                              </Label>
                              <Input
                                value={profile.carModel}
                                readOnly
                                className="text-right border-0 bg-transparent font-medium"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                            <div className="flex-1 text-right">
                              <Label className="text-right block font-semibold text-cyan-900">
                                سنة الصنع
                              </Label>
                              <Input
                                value={profile.carYear}
                                readOnly
                                className="text-right border-0 bg-transparent font-medium"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                            <div className="flex-1 text-right">
                              <Label className="text-right block font-semibold text-cyan-900">
                                رقم اللوحة
                              </Label>
                              <Input
                                value={profile.plateNumber}
                                readOnly
                                className="text-right border-0 bg-transparent font-medium"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {user?.role === "mechanic" && (
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 transition-colors duration-300">
                      <h3 className="text-xl font-bold text-right mb-4 text-emerald-900">
                        بيانات الميكانيكي
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <div className="flex-1 text-right">
                            <Label className="text-right block font-semibold text-emerald-900">
                              التخصص
                            </Label>
                            <Input
                              value={profile.specialty}
                              readOnly
                              className="text-right border-0 bg-transparent font-medium"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <div className="flex-1 text-right">
                            <Label className="text-right block font-semibold text-emerald-900">
                              سنوات الخبرة
                            </Label>
                            <Input
                              value={profile.experience}
                              readOnly
                              className="text-right border-0 bg-transparent font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {user?.role === "workshop" && (
                    <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/50 transition-colors duration-300">
                      <h3 className="text-xl font-bold text-right mb-4 text-amber-900">
                        بيانات الورشة
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <div className="flex-1 text-right">
                            <Label className="text-right block font-semibold text-amber-900">
                              اسم الورشة
                            </Label>
                            <Input
                              value={profile.workshopName}
                              readOnly
                              className="text-right border-0 bg-transparent font-medium"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <div className="flex-1 text-right">
                            <Label className="text-right block font-semibold text-amber-900">
                              العنوان
                            </Label>
                            <Input
                              value={profile.address}
                              readOnly
                              className="text-right border-0 bg-transparent font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="flex justify-end mt-10 animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <Button
                  onClick={() => navigate(`/profile/${user?.role}/edit`)}
                  className="rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 px-8 py-4 text-lg font-bold hover-lift transition-all duration-300 shadow-lg"
                >
                  تعديل البيانات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
