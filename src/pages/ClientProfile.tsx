import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Car, Clock, MapPin, Star, User, Wrench, AlertTriangle, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const ClientProfile = () => {
  const navigate = useNavigate();
  const [maintenanceTasks, setMaintenanceTasks] = useState([
    { id: 1, task: "تغيير زيت المحرك", dueDate: "15 يناير 2025", status: "قريباً", km: "500 كم" },
    { id: 2, task: "فحص الفرامل", dueDate: "30 ديسمبر 2024", status: "متأخر", km: "مستحق فوراً" },
    { id: 3, task: "تغيير مرشح الهواء", dueDate: "1 فبراير 2025", status: "مخطط", km: "2000 كم" },
    { id: 4, task: "فحص البطارية", dueDate: "15 مارس 2025", status: "مخطط", km: "3000 كم" },
  ]);

  const [bookedAppointments, setBookedAppointments] = useState([]);

  // Load appointments from localStorage on component mount
  useState(() => {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments);
      // Filter appointments for current user (in real app, filter by user ID)
      setBookedAppointments(appointments);
    }
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    task: "",
    dueDate: "",
    kmInterval: "",
    frequency: "شهري"
  });

  const handleAddTask = () => {
    if (!formData.task || !formData.dueDate) {
      toast.error("يرجى إدخال اسم المهمة وتاريخ الاستحقاق");
      return;
    }

    const newTask = {
      id: Date.now(),
      task: formData.task,
      dueDate: new Date(formData.dueDate).toLocaleDateString('ar-EG'),
      status: "مخطط",
      km: formData.kmInterval || "غير محدد"
    };

    setMaintenanceTasks([...maintenanceTasks, newTask]);
    setFormData({ task: "", dueDate: "", kmInterval: "", frequency: "شهري" });
    setIsAddDialogOpen(false);
    toast.success("تم إضافة مهمة الصيانة بنجاح");
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      task: task.task,
      dueDate: task.dueDate,
      kmInterval: task.km,
      frequency: "شهري"
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

    const updatedTasks = maintenanceTasks.map(task =>
      task.id === editingTask.id
        ? {
            ...task,
            task: formData.task,
            dueDate: new Date(formData.dueDate).toLocaleDateString('ar-EG'),
            km: formData.kmInterval || "غير محدد"
          }
        : task
    );

    setMaintenanceTasks(updatedTasks);
    setEditingTask(null);
    setFormData({ task: "", dueDate: "", kmInterval: "", frequency: "شهري" });
    setIsAddDialogOpen(false);
    toast.success("تم تحديث مهمة الصيانة بنجاح");
  };

  const handleDeleteTask = (taskId) => {
    setMaintenanceTasks(maintenanceTasks.filter(task => task.id !== taskId));
    toast.success("تم حذف مهمة الصيانة");
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
                <h1 className="text-3xl font-bold mb-2">محمد أحمد</h1>
                <p className="text-muted-foreground mb-4">عميل ذهبي ⭐</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    <span>5 خدمات مكتملة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>عضو منذ 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>وكالة تويوتا الرسمية</span>
                  </div>
                </div>
              </div>
              <Button
                className="rounded-full bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/profile/client/edit")}
              >
                تعديل الملف الشخصي
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Car Information */}
              <Card className="p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Car className="h-6 w-6 text-primary" />
                    معلومات السيارة
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => navigate("/profile/client/edit")}
                  >
                    تعديل
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-right">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">الماركة</p>
                    <p className="font-semibold">تويوتا</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">الموديل</p>
                    <p className="font-semibold">كامري</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">سنة الصنع</p>
                    <p className="font-semibold">2020</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">رقم اللوحة</p>
                    <p className="font-semibold">أ ب ج 1234</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm mb-1">آخر صيانة</p>
                    <p className="font-semibold">15 مارس 2024</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm mb-1">عداد الكيلومترات</p>
                    <p className="font-semibold">45,000 كم</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm mb-1">الوكالة المعتمدة</p>
                    <p className="font-semibold">تويوتا أسوان</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm mb-1">رقم الهاتف</p>
                    <p className="font-semibold">+20 109 123 4567</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm mb-1">البريد الإلكتروني</p>
                    <p className="font-semibold">client@example.com</p>
                  </div>
                </div>
              </Card>

              {/* Recent Orders */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h2 className="text-2xl font-bold mb-6 text-right">الطلبات الأخيرة</h2>
                <div className="space-y-4">
                  {[
                    {
                      title: "صيانة دورية",
                      date: "20 ديسمبر 2024",
                      status: "مكتمل",
                      price: "300",
                      rating: 5,
                    },
                    {
                      title: "تغيير زيت",
                      date: "15 ديسمبر 2024",
                      status: "مكتمل",
                      price: "150",
                      rating: 5,
                    },
                    {
                      title: "فحص جهواء",
                      date: "10 ديسمبر 2024",
                      status: "مكتمل",
                      price: "100",
                      rating: 4,
                    },
                  ].map((order, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold">{order.title}</h3>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: order.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary text-lg">{order.price} ج.م</p>
                        <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="font-bold mb-4 text-right">إجراءات سريعة</h3>
                <div className="space-y-3">
                  <Button className="w-full rounded-full justify-start">
                    <Calendar className="h-5 w-5 ml-2" />
                    حجز موعد جديد
                  </Button>
                  <Button variant="outline" className="w-full rounded-full justify-start">
                    <MapPin className="h-5 w-5 ml-2" />
                    تتبع الميكانيكي
                  </Button>
                  <Button variant="outline" className="w-full rounded-full justify-start">
                    <Wrench className="h-5 w-5 ml-2" />
                    تشخيص ذكي
                  </Button>
                </div>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <h3 className="font-bold mb-4 text-right">المواعيد القادمة</h3>
                <div className="space-y-3">
                  {/* Booked Appointments */}
                  {bookedAppointments.map((appointment: any) => (
                    <div key={appointment.id} className={`p-3 rounded-xl border ${
                      appointment.status === 'accepted' ? 'bg-green-50 border-green-200' :
                      appointment.status === 'rejected' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className={`h-4 w-4 ${
                          appointment.status === 'accepted' ? 'text-green-600' :
                          appointment.status === 'rejected' ? 'text-red-600' :
                          'text-blue-600'
                        }`} />
                        <p className={`font-semibold text-sm ${
                          appointment.status === 'accepted' ? 'text-green-800' :
                          appointment.status === 'rejected' ? 'text-red-800' :
                          'text-blue-800'
                        }`}>{appointment.serviceType}</p>
                      </div>
                      <p className={`text-xs mb-1 ${
                        appointment.status === 'accepted' ? 'text-green-700' :
                        appointment.status === 'rejected' ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                        مع {appointment.mechanicName} - {appointment.appointmentDate} في {appointment.appointmentTime}
                      </p>
                      <p className={`text-xs mb-2 ${
                        appointment.status === 'accepted' ? 'text-green-700' :
                        appointment.status === 'rejected' ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                        السيارة: {appointment.carInfo} - {appointment.licensePlate}
                      </p>
                      <Badge variant="outline" className={`text-xs ${
                        appointment.status === 'accepted' ? 'border-green-300 text-green-700' :
                        appointment.status === 'rejected' ? 'border-red-300 text-red-700' :
                        'border-blue-300 text-blue-700'
                      }`}>
                        {appointment.status === 'pending' ? 'في انتظار التأكيد' :
                         appointment.status === 'accepted' ? 'مؤكد من الميكانيكي' :
                         appointment.status === 'rejected' ? 'مرفوض من الميكانيكي' :
                         appointment.status}
                      </Badge>
                    </div>
                  ))}

                  {/* Default Appointments */}
                  {bookedAppointments.length === 0 && (
                    <>
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <p className="font-semibold text-sm">صيانة دورية</p>
                        </div>
                        <p className="text-xs text-muted-foreground">12 يناير 2025 - 10:00 ص</p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <p className="font-semibold text-sm text-orange-800">تذكير: تغيير زيت المحرك</p>
                        </div>
                        <p className="text-xs text-orange-700">مستحق خلال 500 كم - 15 يناير 2025</p>
                        <Badge variant="outline" className="mt-2 text-xs border-orange-300 text-orange-700">
                          مستحق قريباً
                        </Badge>
                      </div>
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <p className="font-semibold text-sm text-red-800">فحص الفرامل</p>
                        </div>
                        <p className="text-xs text-red-700">متأخر عن الموعد المحدد - 30 ديسمبر 2024</p>
                        <Badge variant="outline" className="mt-2 text-xs border-red-300 text-red-700">
                          مستحق فوراً
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Maintenance Tasks */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center justify-between mb-4">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          setEditingTask(null);
                          setFormData({ task: "", dueDate: "", kmInterval: "", frequency: "شهري" });
                        }}
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة مهمة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-right">
                          {editingTask ? "تعديل مهمة الصيانة" : "إضافة مهمة صيانة جديدة"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="task" className="text-right block">اسم المهمة</Label>
                          <Input
                            id="task"
                            value={formData.task}
                            onChange={(e) => setFormData({...formData, task: e.target.value})}
                            placeholder="مثال: تغيير زيت المحرك"
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dueDate" className="text-right block">تاريخ الاستحقاق</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kmInterval" className="text-right block">الفاصل بالكيلومترات (اختياري)</Label>
                          <Input
                            id="kmInterval"
                            value={formData.kmInterval}
                            onChange={(e) => setFormData({...formData, kmInterval: e.target.value})}
                            placeholder="مثال: 5000 كم"
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="frequency" className="text-right block">التكرار</Label>
                          <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                            <SelectTrigger className="text-right">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="يومي">يومي</SelectItem>
                              <SelectItem value="أسبوعي">أسبوعي</SelectItem>
                              <SelectItem value="شهري">شهري</SelectItem>
                              <SelectItem value="كل 3 أشهر">كل 3 أشهر</SelectItem>
                              <SelectItem value="كل 6 أشهر">كل 6 أشهر</SelectItem>
                              <SelectItem value="سنوي">سنوي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                            className="rounded-full"
                          >
                            إلغاء
                          </Button>
                          <Button
                            onClick={editingTask ? handleUpdateTask : handleAddTask}
                            className="rounded-full"
                          >
                            {editingTask ? "تحديث" : "إضافة"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <h3 className="font-bold text-right">مهام الصيانة الدورية</h3>
                </div>

                <div className="space-y-3">
                  {maintenanceTasks.map((maintenance) => (
                    <div
                      key={maintenance.id}
                      className={`p-3 rounded-xl border ${
                        maintenance.status === "متأخر"
                          ? "bg-red-50 border-red-200"
                          : maintenance.status === "قريباً"
                          ? "bg-orange-50 border-orange-200"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(maintenance)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(maintenance.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              maintenance.status === "متأخر"
                                ? "border-red-300 text-red-700"
                                : maintenance.status === "قريباً"
                                ? "border-orange-300 text-orange-700"
                                : "border-muted-foreground text-muted-foreground"
                            }`}
                          >
                            {maintenance.status}
                          </Badge>
                          <p className="font-semibold text-sm">{maintenance.task}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {maintenance.dueDate} • {maintenance.km}
                      </p>
                    </div>
                  ))}

                  {maintenanceTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد مهام صيانة محددة</p>
                      <p className="text-sm">اضغط على "إضافة مهمة" لبدء إضافة مهام الصيانة</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Loyalty Program */}
              <Card className="p-6 bg-gradient-hero animate-slide-up" style={{ animationDelay: "0.5s" }}>
                <h3 className="font-bold mb-4 text-right">برنامج الولاء</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-2">150</div>
                  <p className="text-sm text-muted-foreground">نقطة متاحة</p>
                </div>
                <Button className="w-full rounded-full bg-white text-primary hover:bg-white/90">
                  استبدال النقاط
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientProfile;
