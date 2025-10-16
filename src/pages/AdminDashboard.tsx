import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Wrench,
  Building2,
  ShoppingCart,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, User } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Mock data for demonstration
  const [stats] = useState({
    totalUsers: 245,
    totalMechanics: 67,
    totalWorkshops: 23,
    totalOrders: 189,
    totalAppointments: 156,
    monthlyRevenue: 45600
  });

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+20123456789',
      role: 'mechanic',
      location: 'أسوان، حي الصداقة',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      phone: '+20198765432',
      role: 'client',
      location: 'أسوان، حي النصر',
      createdAt: '2024-02-20'
    },
    {
      id: '3',
      name: 'مركز الصيانة المتقدم',
      email: 'workshop@example.com',
      phone: '+20111222333',
      role: 'workshop',
      location: 'أسوان، حي الشاطئ',
      createdAt: '2024-01-10'
    },
    {
      id: '4',
      name: 'محمد حسن',
      email: 'mohamed@example.com',
      phone: '+20155556666',
      role: 'client',
      location: 'أسوان، حي السلام',
      createdAt: '2024-03-10'
    },
    {
      id: '5',
      name: 'سارة أحمد',
      email: 'sara@example.com',
      phone: '+20177778888',
      role: 'mechanic',
      location: 'أسوان، حي الزهور',
      createdAt: '2024-02-15'
    }
  ]);

  const [orders] = useState([
    {
      id: '1',
      customerName: 'محمد أحمد',
      items: ['زيت محرك', 'فلتر هواء'],
      total: 280,
      status: 'completed',
      date: '2024-12-15'
    },
    {
      id: '2',
      customerName: 'سارة محمد',
      items: ['بطارية سيارة'],
      total: 450,
      status: 'pending',
      date: '2024-12-16'
    }
  ]);

  const [appointments] = useState([
    {
      id: '1',
      customerName: 'علي حسن',
      mechanicName: 'أحمد محمد',
      service: 'صيانة دورية',
      date: '2024-12-18',
      time: '10:00',
      status: 'confirmed'
    },
    {
      id: '2',
      customerName: 'فاطمة أحمد',
      mechanicName: 'محمد علي',
      service: 'إصلاح المحرك',
      date: '2024-12-19',
      time: '14:30',
      status: 'pending'
    }
  ]);

  const [pendingChanges, setPendingChanges] = useState([
    {
      id: '1',
      mechanicId: '1',
      mechanicName: 'أحمد محمد',
      changeType: 'profile_update',
      changes: {
        specialty: 'إصلاح المحركات والصيانة الشاملة',
        experience: '10 سنوات',
        phone: '+20123456789'
      },
      submittedAt: '2024-12-15',
      status: 'pending'
    },
    {
      id: '2',
      mechanicId: '5',
      mechanicName: 'سارة أحمد',
      changeType: 'service_addition',
      changes: {
        newService: 'صيانة الفرامل المتقدمة',
        description: 'خدمة شاملة لصيانة وإصلاح جميع أنواع الفرامل'
      },
      submittedAt: '2024-12-16',
      status: 'pending'
    }
  ]);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'mechanic': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'client': return 'عميل';
      case 'mechanic': return 'ميكانيكي';
      case 'workshop': return 'مركز صيانة';
      case 'admin': return 'مدير';
      default: return role;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغي';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              لوحة تحكم المدير
            </h1>
            <p className="text-muted-foreground text-lg">
              إدارة شاملة للموقع والمستخدمين
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
            <Card className="p-4 text-center animate-slide-up">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">المستخدمون</p>
            </Card>
            <Card className="p-4 text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <Wrench className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalMechanics}</p>
              <p className="text-sm text-muted-foreground">الميكانيكيين</p>
            </Card>
            <Card className="p-4 text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalWorkshops}</p>
              <p className="text-sm text-muted-foreground">مراكز الصيانة</p>
            </Card>
            <Card className="p-4 text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <ShoppingCart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-sm text-muted-foreground">الطلبات</p>
            </Card>
            <Card className="p-4 text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
              <p className="text-sm text-muted-foreground">المواعيد</p>
            </Card>
            <Card className="p-4 text-center animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{pendingChanges.length}</p>
              <p className="text-sm text-muted-foreground">تعديلات معلقة</p>
            </Card>
            <Card className="p-4 text-center animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.monthlyRevenue} ج.م</p>
              <p className="text-sm text-muted-foreground">الإيرادات</p>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="users">المستخدمون</TabsTrigger>
              <TabsTrigger value="pending-changes">تعديلات معلقة</TabsTrigger>
              <TabsTrigger value="orders">الطلبات</TabsTrigger>
              <TabsTrigger value="appointments">المواعيد</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-right">النشاط الأخير</h3>
                  <div className="space-y-3">
                    {[
                      { action: 'تسجيل ميكانيكي جديد', user: 'أحمد محمد', time: 'منذ 5 دقائق' },
                      { action: 'طلب جديد', user: 'فاطمة علي', time: 'منذ 15 دقيقة' },
                      { action: 'حجز موعد', user: 'محمد حسن', time: 'منذ ساعة' },
                      { action: 'تسجيل عميل جديد', user: 'سارة أحمد', time: 'منذ ساعتين' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="text-right">
                          <p className="font-semibold">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.user}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* System Health */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-right">حالة النظام</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-right">حالة الخادم</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        نشط
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-right">قاعدة البيانات</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        متصلة
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-right">نظام النسخ الاحتياطي</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 ml-1" />
                        يحتاج تحديث
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-right">معدل الاستجابة</span>
                      <span className="font-semibold text-green-600">98.5%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* Filters */}
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="search" className="text-right block mb-2">البحث</Label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="البحث بالاسم أو البريد الإلكتروني..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 text-right"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Label htmlFor="role-filter" className="text-right block mb-2">النوع</Label>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="جميع الأنواع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع الأنواع</SelectItem>
                        <SelectItem value="client">عملاء</SelectItem>
                        <SelectItem value="mechanic">ميكانيكيين</SelectItem>
                        <SelectItem value="workshop">مراكز صيانة</SelectItem>
                        <SelectItem value="admin">مديرين</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 text-right">الطلبات الأخيرة</h3>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="text-right flex-1">
                        <h4 className="font-semibold">{order.customerName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.items.join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">{order.total} ج.م</span>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Pending Changes Tab */}
            <TabsContent value="pending-changes" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 text-right">التعديلات المعلقة للموافقة</h3>
                <div className="space-y-4">
                  {pendingChanges.map((change) => (
                    <div key={change.id} className="p-4 border border-border rounded-lg bg-orange-50/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-right flex-1">
                          <h4 className="font-semibold">{change.mechanicName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {change.changeType === 'profile_update' ? 'تحديث البروفايل' : 'إضافة خدمة جديدة'}
                          </p>
                          <p className="text-xs text-muted-foreground">{change.submittedAt}</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">
                          معلق للموافقة
                        </Badge>
                      </div>

                      <div className="bg-white p-3 rounded-lg mb-3">
                        <h5 className="font-semibold text-sm mb-2 text-right">التعديلات المطلوبة:</h5>
                        <div className="space-y-1 text-sm text-right">
                          {change.changeType === 'profile_update' ? (
                            <>
                              {change.changes.specialty && (
                                <p><span className="font-medium">التخصص:</span> {change.changes.specialty}</p>
                              )}
                              {change.changes.experience && (
                                <p><span className="font-medium">سنوات الخبرة:</span> {change.changes.experience}</p>
                              )}
                              {change.changes.phone && (
                                <p><span className="font-medium">الهاتف:</span> {change.changes.phone}</p>
                              )}
                            </>
                          ) : (
                            <>
                              <p><span className="font-medium">الخدمة الجديدة:</span> {change.changes.newService}</p>
                              <p><span className="font-medium">الوصف:</span> {change.changes.description}</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => {
                            setPendingChanges(prev => prev.filter(p => p.id !== change.id));
                            toast.success(`تمت الموافقة على تعديل ${change.mechanicName}`);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 ml-1" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setPendingChanges(prev => prev.filter(p => p.id !== change.id));
                            toast.success(`تم رفض تعديل ${change.mechanicName}`);
                          }}
                        >
                          <XCircle className="h-4 w-4 ml-1" />
                          رفض
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 ml-1" />
                          مراجعة
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {pendingChanges.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد تعديلات معلقة للموافقة</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 text-right">المواعيد المجدولة</h3>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="text-right flex-1">
                        <h4 className="font-semibold">{appointment.customerName}</h4>
                        <p className="text-sm text-muted-foreground">
                          مع {appointment.mechanicName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.service} • {appointment.date} • {appointment.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusBadgeColor(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;