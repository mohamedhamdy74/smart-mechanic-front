import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Phone, Mail, Car, User, Wrench } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

// Mock data for mechanics - should match MechanicPublicProfile
const mechanicsData = {
  1: {
    id: 1,
    name: "أحمد محمد",
    specialization: "إصلاح المحركات",
    location: "أسوان، حي الصداقة",
    services: ["إصلاح المحركات", "تغيير الزيوت", "فحص دوري"]
  },
  2: {
    id: 2,
    name: "محمد علي",
    specialization: "أنظمة الكهرباء",
    location: "أسوان، حي الصفا",
    services: ["إصلاح البطاريات", "أنظمة الإشعال", "الأنظمة الكهربائية"]
  },
  3: {
    id: 3,
    name: "محمد أحمد",
    specialization: "إصلاح الهيكل والطلاء",
    location: "أسوان، حي النصر",
    services: ["إصلاح الهيكل", "الطلاء", "إزالة الصدأ"]
  },
  4: {
    id: 4,
    name: "علي حسن",
    specialization: "إصلاح الإطارات والعجلات",
    location: "أسوان، حي العزيزية",
    services: ["تغيير الإطارات", "موازنة العجلات", "إصلاح الإطارات"]
  },
  5: {
    id: 5,
    name: "أحمد عبدالله",
    specialization: "صيانة دورية",
    location: "أسوان، حي النهضة",
    services: ["الصيانة الدورية", "فحص شامل", "تغيير المرشحات"]
  },
  6: {
    id: 6,
    name: "خالد عبدالله",
    specialization: "إصلاح ناقل الحركة",
    location: "أسوان، حي النخيل",
    services: ["إصلاح ناقل الحركة", "صيانة القير", "إصلاح التفاضلي"]
  }
};

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mechanic = mechanicsData[id as unknown as keyof typeof mechanicsData];

  const [formData, setFormData] = useState({
    serviceType: "",
    appointmentDate: "",
    appointmentTime: "",
    carBrand: "",
    carModel: "",
    carYear: "",
    licensePlate: "",
    problemDescription: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    preferredLocation: "workshop"
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.serviceType || !formData.appointmentDate || !formData.appointmentTime ||
        !formData.customerName || !formData.customerPhone) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // Create appointment object
    const appointment = {
      id: Date.now(),
      mechanicId: mechanic.id,
      mechanicName: mechanic.name,
      serviceType: formData.serviceType,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      carInfo: `${formData.carBrand} ${formData.carModel} ${formData.carYear}`,
      licensePlate: formData.licensePlate,
      problemDescription: formData.problemDescription,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      preferredLocation: formData.preferredLocation,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    // In a real app, this would be sent to the backend
    // For now, we'll store it in localStorage to simulate persistence
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    existingAppointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(existingAppointments));

    toast.success("تم حجز الموعد بنجاح! سيتم تأكيد الحجز قريباً");

    // Navigate back to client profile to show the appointment
    navigate("/profile/client");
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              حجز موعد مع {mechanic.name}
            </h1>
            <p className="text-muted-foreground text-lg">
              {mechanic.specialization} • {mechanic.location}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 animate-slide-up">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Type */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceType" className="text-right block font-semibold">
                      نوع الخدمة المطلوبة *
                    </Label>
                    <Select value={formData.serviceType} onValueChange={(value) => setFormData({...formData, serviceType: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر نوع الخدمة" />
                      </SelectTrigger>
                      <SelectContent>
                        {mechanic.services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointmentDate" className="text-right block">
                        تاريخ الموعد *
                      </Label>
                      <Input
                        id="appointmentDate"
                        type="date"
                        value={formData.appointmentDate}
                        onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                        className="text-right"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointmentTime" className="text-right block">
                        وقت الموعد *
                      </Label>
                      <Input
                        id="appointmentTime"
                        type="time"
                        value={formData.appointmentTime}
                        onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                        className="text-right"
                      />
                    </div>
                  </div>

                  {/* Car Information */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-bold text-right">معلومات السيارة</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="carBrand" className="text-right block">الماركة</Label>
                        <Input
                          id="carBrand"
                          value={formData.carBrand}
                          onChange={(e) => setFormData({...formData, carBrand: e.target.value})}
                          placeholder="مثال: تويوتا"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carModel" className="text-right block">الموديل</Label>
                        <Input
                          id="carModel"
                          value={formData.carModel}
                          onChange={(e) => setFormData({...formData, carModel: e.target.value})}
                          placeholder="مثال: كامري"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carYear" className="text-right block">سنة الصنع</Label>
                        <Input
                          id="carYear"
                          value={formData.carYear}
                          onChange={(e) => setFormData({...formData, carYear: e.target.value})}
                          placeholder="2020"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licensePlate" className="text-right block">رقم اللوحة</Label>
                        <Input
                          id="licensePlate"
                          value={formData.licensePlate}
                          onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                          placeholder="رقم اللوحة"
                          className="text-right"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="space-y-2">
                    <Label htmlFor="problemDescription" className="text-right block">
                      وصف المشكلة (اختياري)
                    </Label>
                    <Textarea
                      id="problemDescription"
                      value={formData.problemDescription}
                      onChange={(e) => setFormData({...formData, problemDescription: e.target.value})}
                      placeholder="وصف المشكلة التي تواجهها في السيارة..."
                      className="text-right"
                      rows={3}
                    />
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-bold text-right">معلومات الاتصال *</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName" className="text-right block">الاسم الكامل *</Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                          placeholder="الاسم الكامل"
                          className="text-right"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerPhone" className="text-right block">رقم الهاتف *</Label>
                          <Input
                            id="customerPhone"
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                            placeholder="+20xxxxxxxxxx"
                            className="text-right"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerEmail" className="text-right block">البريد الإلكتروني</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                            placeholder="email@example.com"
                            className="text-right"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Location */}
                  <div className="space-y-2">
                    <Label className="text-right block font-semibold">مكان الخدمة المفضل</Label>
                    <Select value={formData.preferredLocation} onValueChange={(value) => setFormData({...formData, preferredLocation: value})}>
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">في ورشة الميكانيكي</SelectItem>
                        <SelectItem value="home">في المنزل</SelectItem>
                        <SelectItem value="office">في مكان العمل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full rounded-full py-6 text-lg">
                    <Calendar className="h-5 w-5 ml-2" />
                    تأكيد الحجز
                  </Button>
                </form>
              </Card>
            </div>

            {/* Mechanic Info Sidebar */}
            <div className="space-y-6">
              {/* Mechanic Card */}
              <Card className="p-6 bg-gradient-hero animate-slide-up">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white mx-auto mb-4">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{mechanic.name}</h3>
                  <p className="text-primary font-semibold mb-2">{mechanic.specialization}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{mechanic.location}</span>
                  </div>
                </div>
              </Card>

              {/* Services Offered */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h4 className="font-bold mb-4 text-right">الخدمات المتاحة</h4>
                <div className="space-y-2">
                  {mechanic.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 text-right">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Important Notes */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <h4 className="font-bold mb-4 text-right">ملاحظات مهمة</h4>
                <div className="space-y-3 text-sm text-right text-muted-foreground">
                  <p>• سيتم تأكيد الموعد خلال 24 ساعة</p>
                  <p>• يرجى التأكد من صحة رقم الهاتف</p>
                  <p>• يمكن إلغاء الموعد قبل 24 ساعة</p>
                  <p>• الدفع عند اكتمال الخدمة</p>
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

export default BookAppointment;