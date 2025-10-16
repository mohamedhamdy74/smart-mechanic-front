import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Star, User, Wrench, TrendingUp, Eye, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const MechanicProfile = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Load appointments for this mechanic
  useEffect(() => {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      const allAppointments = JSON.parse(savedAppointments);
      // Filter appointments for current mechanic (assuming mechanic ID is 1 for now)
      const mechanicAppointments = allAppointments.filter((app: any) => app.mechanicId === 1);
      setAppointments(mechanicAppointments);
    }
  }, []);

  const handleAppointmentAction = (appointmentId: number, action: 'accept' | 'reject') => {
    const updatedAppointments = appointments.map((app: any) => {
      if (app.id === appointmentId) {
        return {
          ...app,
          status: action === 'accept' ? 'accepted' : 'rejected',
          updatedAt: new Date().toISOString()
        };
      }
      return app;
    });

    setAppointments(updatedAppointments);

    // Update localStorage
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAllAppointments = allAppointments.map((app: any) => {
      if (app.id === appointmentId) {
        return {
          ...app,
          status: action === 'accept' ? 'accepted' : 'rejected',
          updatedAt: new Date().toISOString()
        };
      }
      return app;
    });
    localStorage.setItem('appointments', JSON.stringify(updatedAllAppointments));

    toast.success(action === 'accept' ? 'تم قبول الموعد بنجاح' : 'تم رفض الموعد');
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Profile Header */}
          <div className="bg-gradient-hero rounded-3xl p-8 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="text-center md:text-right flex-1">
                <h1 className="text-3xl font-bold mb-2">أحمد محمد</h1>
                <p className="text-muted-foreground mb-2">ميكانيكي محترف</p>
                <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">4.8 (28 تقييم)</span>
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Badge variant="secondary">صيانة عامة</Badge>
                  <Badge variant="secondary">كهربائي سيارات</Badge>
                  <Badge variant="secondary">10 سنوات خبرة</Badge>
                </div>
              </div>
              <Button
                className="rounded-full bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/profile/mechanic/edit")}
              >
                تعديل الملف الشخصي
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-6 text-center animate-slide-up">
                  <Wrench className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold">28</p>
                  <p className="text-sm text-muted-foreground">خدمات منفذة</p>
                </Card>
                <Card className="p-6 text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">مواعيد مجدولة</p>
                </Card>
                <Card className="p-6 text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold">4.8</p>
                  <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                </Card>
              </div>

              {/* Upcoming Appointments */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <h2 className="text-2xl font-bold mb-6 text-right">المواعيد القادمة</h2>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">لا توجد مواعيد قادمة</p>
                    </div>
                  ) : (
                    appointments.map((appointment: any, index: number) => (
                      <div
                        key={appointment.id}
                        className="p-4 rounded-xl border border-border hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-right flex-1">
                            <h3 className="font-bold text-lg mb-1">{appointment.serviceType}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{appointment.customerName}</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-primary" />
                                {appointment.appointmentDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-primary" />
                                {appointment.appointmentTime}
                              </span>
                            </div>
                            <p className="flex items-center gap-1 text-sm mt-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {appointment.preferredLocation === 'workshop' ? 'في الورشة' : appointment.preferredLocation === 'home' ? 'في المنزل' : 'في مكان العمل'}
                            </p>
                          </div>
                          <Badge
                            variant={
                              appointment.status === "accepted" ? "default" :
                              appointment.status === "rejected" ? "destructive" :
                              "secondary"
                            }
                            className="mr-2"
                          >
                            {appointment.status === "pending" ? "قيد الانتظار" :
                             appointment.status === "accepted" ? "مؤكد" :
                             appointment.status === "rejected" ? "مرفوض" :
                             appointment.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {appointment.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                className="rounded-full flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                              >
                                <Check className="h-4 w-4 ml-1" />
                                قبول
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                              >
                                <X className="h-4 w-4 ml-1" />
                                رفض
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" className="rounded-full flex-1">
                                بدء الخدمة
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => setSelectedAppointment(appointment)}
                                  >
                                    <Eye className="h-4 w-4 ml-1" />
                                    تفاصيل
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-right">تفاصيل الموعد</DialogTitle>
                                  </DialogHeader>
                                  {selectedAppointment && (
                                    <div className="space-y-4 text-right">
                                      <div>
                                        <h4 className="font-bold mb-2">الخدمة المطلوبة</h4>
                                        <p>{selectedAppointment.serviceType}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">بيانات العميل</h4>
                                        <p>الاسم: {selectedAppointment.customerName}</p>
                                        <p>الهاتف: {selectedAppointment.customerPhone}</p>
                                        <p>البريد: {selectedAppointment.customerEmail}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">بيانات السيارة</h4>
                                        <p>{selectedAppointment.carInfo}</p>
                                        <p>رقم اللوحة: {selectedAppointment.licensePlate}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">تاريخ ووقت الموعد</h4>
                                        <p>{selectedAppointment.appointmentDate} في {selectedAppointment.appointmentTime}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2">مكان الخدمة</h4>
                                        <p>{selectedAppointment.preferredLocation === 'workshop' ? 'في الورشة' : selectedAppointment.preferredLocation === 'home' ? 'في المنزل' : 'في مكان العمل'}</p>
                                      </div>
                                      {selectedAppointment.problemDescription && (
                                        <div>
                                          <h4 className="font-bold mb-2">وصف المشكلة</h4>
                                          <p className="text-sm">{selectedAppointment.problemDescription}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Completed Services */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <h2 className="text-2xl font-bold mb-6 text-right">الخدمات المنفذة مؤخراً</h2>
                <div className="space-y-3">
                  {[
                    {
                      title: "تغيير زيت",
                      customer: "خالد محمد",
                      date: "20 ديسمبر 2024",
                      rating: 5,
                      earnings: "150",
                    },
                    {
                      title: "صيانة محرك",
                      customer: "فاطمة أحمد",
                      date: "18 ديسمبر 2024",
                      rating: 5,
                      earnings: "400",
                    },
                    {
                      title: "فحص كهرباء",
                      customer: "عمر سعد",
                      date: "15 ديسمبر 2024",
                      rating: 4,
                      earnings: "200",
                    },
                  ].map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl border border-border"
                    >
                      <div className="text-right flex-1">
                        <h4 className="font-semibold">{service.title}</h4>
                        <p className="text-xs text-muted-foreground">{service.customer}</p>
                        <p className="text-xs text-muted-foreground">{service.date}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: service.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary">{service.earnings} ج.م</p>
                        <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                          مكتمل
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability Status */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.5s" }}>
                <h3 className="font-bold mb-4 text-right">حالة التوفر</h3>
                <div className="space-y-3">
                  <Button className="w-full rounded-full bg-green-500 hover:bg-green-600">
                    متاح الآن
                  </Button>
                  <Button variant="outline" className="w-full rounded-full">
                    غير متاح
                  </Button>
                </div>
              </Card>

              {/* Earnings */}
              <Card className="p-6 bg-gradient-hero animate-slide-up" style={{ animationDelay: "0.6s" }}>
                <h3 className="font-bold mb-4 text-right">الأرباح</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-2">5,250 ج.م</div>
                  <p className="text-sm text-muted-foreground">هذا الشهر</p>
                </div>
                <Button className="w-full rounded-full bg-white text-primary hover:bg-white/90">
                  سحب الأرباح
                </Button>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.7s" }}>
                <h3 className="font-bold mb-4 text-right">إحصائيات سريعة</h3>
                <div className="space-y-3 text-right">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">معدل القبول</span>
                    <span className="font-semibold">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">معدل الإلغاء</span>
                    <span className="font-semibold">2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">وقت الاستجابة</span>
                    <span className="font-semibold">5 دقائق</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MechanicProfile;
