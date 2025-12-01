import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Calendar, Edit, Save, X, UserCheck, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const { toast } = useToast();

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="p-12 text-center animate-fade-in shadow-xl border border-border/50 rounded-3xl bg-card">
                <LoadingSpinner size="lg" className="mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">جاري تحميل البيانات</h2>
                <p className="text-lg text-muted-foreground">يرجى الانتظار...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="p-12 text-center animate-fade-in shadow-xl border border-border/50 rounded-3xl bg-card">
                <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">يرجى تسجيل الدخول</h2>
                <p className="text-lg text-muted-foreground">يجب عليك تسجيل الدخول لعرض الملف الشخصي</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const success = await updateProfile(formData);
      if (success) {
        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم تحديث ملفك الشخصي بنجاح',
        });
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('فشل في تحديث الملف الشخصي:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  };

  // Function to format date in Arabic
  const formatArabicDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory',
      numberingSystem: 'arab'
    };

    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  // Function to get role name in Arabic
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير';
      case 'mechanic':
        return 'فني ميكانيكي';
      case 'workshop':
        return 'ورشة عمل';
      case 'client':
      default:
        return 'عميل';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-bounce-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">الملف الشخصي</h1>
            <p className="text-xl text-muted-foreground">إدارة وتخصيص ملفك الشخصي</p>
          </div>

          <div className="flex items-center justify-between mb-10 animate-fade-in">
            <div className="text-right">
              <p className="text-base text-muted-foreground">
                آخر تحديث: {user.updatedAt ? formatArabicDate(user.updatedAt) : 'غير متوفر'}
              </p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-full px-6 py-3 hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5">
                <Edit className="h-5 w-5 ml-2" />
                <span>تعديل الملف الشخصي</span>
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button onClick={handleSubmit} className="rounded-full px-6 py-3 bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 hover-lift transition-all duration-300">
                  <Save className="h-5 w-5 ml-2" />
                  <span>حفظ التغييرات</span>
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-full px-6 py-3 hover-lift transition-all duration-300 hover:border-destructive hover:bg-destructive/5">
                  <X className="h-5 w-5 ml-2" />
                  <span>إلغاء</span>
                </Button>
              </div>
            )}
          </div>

          <div className="bg-card/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-border/50 dark:border-gray-700/50 overflow-hidden animate-slide-up transition-colors duration-300">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-primary/10 via-orange-500/5 to-background dark:from-gray-900/50 dark:via-gray-800/30 dark:to-black p-10 border-b border-border/20 dark:border-gray-700/30 transition-colors duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-orange-500/20 text-primary font-bold">
                        {user.name ?
                          user.name.split(' ').map(n => n[0]).join('').toUpperCase() :
                          'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                        <Edit className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="mt-6 md:mt-0 md:mr-8 text-center md:text-right">
                    <h2 className="text-3xl font-bold mb-2">
                      {isEditing ? (
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="text-3xl font-bold h-auto p-2 text-right bg-white/50 border-2 border-primary/30 rounded-xl"
                          dir="rtl"
                        />
                      ) : (
                        user.name
                      )}
                    </h2>
                    <div className="mt-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-semibold bg-gradient-to-r from-primary/20 to-orange-500/20 text-primary border border-primary/30">
                        <Shield className="h-5 w-5 ml-2" />
                        {getRoleName(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-0 text-center md:text-left">
                  <div className="text-base text-muted-foreground font-medium">
                    <Calendar className="inline-block h-5 w-5 ml-2" />
                    <span>مسجل منذ {formatArabicDate(user.createdAt)}</span>
                  </div>
                  {user.updatedAt && user.updatedAt !== user.createdAt && (
                    <div className="text-sm text-muted-foreground mt-2 font-medium">
                      تم التحديث في {formatArabicDate(user.updatedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoField
                  icon={<Mail className="h-6 w-6 text-blue-500" />}
                  label="البريد الإلكتروني"
                  value={isEditing ? (
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      className="text-right text-lg p-4 rounded-xl border-2 border-blue-200"
                      dir="ltr"
                    />
                  ) : (
                    <a href={`mailto:${user.email}`} className="hover:underline text-blue-600 text-lg font-medium">
                      {user.email}
                    </a>
                  )}
                />

                <InfoField
                  icon={<Phone className="h-6 w-6 text-green-500" />}
                  label="رقم الجوال"
                  value={isEditing ? (
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="أدخل رقم الجوال"
                      className="text-right text-lg p-4 rounded-xl border-2 border-green-200"
                      dir="ltr"
                    />
                  ) : user.phone ? (
                    <a href={`tel:${user.phone}`} className="hover:underline text-green-600 text-lg font-medium">
                      {user.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-lg">غير مضاف</span>
                  )}
                />

                <InfoField
                  icon={<MapPin className="h-6 w-6 text-amber-500" />}
                  label="العنوان"
                  value={isEditing ? (
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="أدخل عنوانك"
                      className="text-right text-lg p-4 rounded-xl border-2 border-amber-200"
                      dir="rtl"
                    />
                  ) : user.address ? (
                    <span className="text-lg font-medium">{user.address}</span>
                  ) : (
                    <span className="text-muted-foreground text-lg">غير مضاف</span>
                  )}
                />

                <InfoField
                  icon={<Calendar className="h-6 w-6 text-purple-500" />}
                  label="حالة الحساب"
                  value={
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center">
                        <span className="ml-3 text-lg">الحالة:</span>
                        <span className="text-green-600 font-bold text-lg">نشط</span>
                      </div>
                      <div className="flex items-center text-base text-muted-foreground">
                        <span className="ml-3">تاريخ التسجيل:</span>
                        <span className="font-medium">{formatArabicDate(user.createdAt)}</span>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoField({ icon, label, value }: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-gradient-to-r from-muted/50 to-muted/30 dark:from-gray-800/50 dark:to-gray-700/30 rounded-2xl border border-border/50 dark:border-gray-600/50 hover-lift transition-all duration-300 animate-slide-up transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-base text-muted-foreground font-semibold">
          {icon && <span className="ml-3">{icon}</span>}
          <span>{label}</span>
        </div>
      </div>
      <div className="text-lg font-bold text-right">
        {value}
      </div>
    </div>
  );
}
