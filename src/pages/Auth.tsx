import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useAuthToken } from "@/hooks/useAuthToken";
import { UserCheck, Wrench, Building2, Eye, EyeOff, Shield, MapPin, Upload, Image as ImageIcon } from "lucide-react";

const loginSchema = z.object({
  userType: z.string().min(1, "يرجى اختيار نوع المستخدم"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

const registerSchema = z.object({
  userType: z.string().min(1, "يرجى اختيار نوع المستخدم"),
  name: z.string().min(3, "الإسم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
  phone: z.string().optional(),
  // General
  location: z.string().optional(),
  // Client specific fields
  carBrand: z.string().optional(),
  carModel: z.string().optional(),
  carYear: z.string().optional(),
  plateNumber: z.string().optional(),
  mileage: z.string().optional(),
  lastMaintenance: z.string().optional(),
  dealership: z.string().optional(),
  maintenanceSchedule: z.string().optional(),
  // Mechanic specific fields
  specialty: z.string().optional(),
  experience: z.string().optional(),
  // Workshop specific fields
  workshopName: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  services: z.string().optional(),
  workingHours: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمة المرور وتأكيدها غير متطابقين",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { setAuthTokens } = useAuthToken();
  const queryClient = useQueryClient();
  const mode = searchParams.get("mode") || "login";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userType: "",
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      location: "",
      carBrand: "",
      carModel: "",
      carYear: "",
      plateNumber: "",
      mileage: "",
      lastMaintenance: "",
      dealership: "",
      specialty: "",
      experience: "",
      workshopName: "",
      address: "",
      description: "",
      services: "",
      workingHours: "",
    } as any,
  });

  const userType = mode === "login"
    ? loginForm.watch("userType")
    : registerForm.watch("userType");

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      // Regular user login (including admin)
      const success = await login(data.email, data.password);

      if (success) {
        toast.success("تم تسجيل الدخول بنجاح");

        // Get user from localStorage to check role
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Redirect based on user role
        if (user.role === 'admin') {
          navigate("/admin");
        } else if (user.role === 'mechanic') {
          navigate("/profile/mechanic");
        } else if (user.role === 'workshop') {
          navigate("/profile/workshop");
        } else {
          navigate("/");
        }
      } else {
        toast.error("بيانات الدخول غير صحيحة");
      }
    } catch (error) {
      toast.error("حدث خطأ في تسجيل الدخول");
    }
  };

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Function to get current location
  const handleGetLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      toast.error("متصفحك لا يدعم تحديد الموقع");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationLoading(false);
        toast.success("تم تحديد الموقع بنجاح");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("فشل في تحديد الموقع - يرجى السماح بالوصول للموقع");
        setLocationLoading(false);
      }
    );
  };

  // Function to handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار ملف صورة فقط");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (data: any) => {
    try {
      // Map user types to backend roles
      const roleMap: { [key: string]: string } = {
        'customer': 'client',
        'mechanic': 'mechanic',
        'workshop': 'workshop'
      };

      const userRole = roleMap[data.userType];
      if (!userRole) {
        toast.error('نوع المستخدم غير صحيح');
        return;
      }

      // Prepare additional fields based on user type
      interface MechanicFields {
        skills?: string[];
        experienceYears?: number;
      }

      interface WorkshopFields {
        workshopName?: string;
        workshopAddress?: string;
      }

      const additionalFields: MechanicFields & WorkshopFields = {};

      if (userRole === 'mechanic' && data.specialty) {
        // Split specialties by comma and trim whitespace
        const skillsArray = data.specialty.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0);
        Object.assign(additionalFields, {
          skills: skillsArray,
          experienceYears: parseInt(data.experience || '0')
        });
      } else if (userRole === 'workshop' && data.workshopName) {
        Object.assign(additionalFields, {
          workshopName: data.workshopName,
          workshopAddress: data.address
        });
      }

      // Prepare and send registration data
      const registrationData: any = {
        name: data.name,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: userRole,
        phone: data.phone || undefined,
        location: data.location || data.address || data.dealership || 'أسوان',
        mileage: data.mileage !== "" ? parseInt(data.mileage) : undefined,
        description: data.description,
        services: data.services ? data.services.split(',').map(s => s.trim()) : undefined,
        workingHours: data.workingHours,
        // Client specific fields
        carBrand: data.carBrand || undefined,
        carModel: data.carModel || undefined,
        carYear: data.carYear || undefined,
        plateNumber: data.plateNumber || undefined,
        lastMaintenance: data.lastMaintenance || undefined,
        dealership: data.dealership || undefined,
        ...additionalFields
      };

      const success = await register(registrationData);

      if (success) {
        toast.success("تم التسجيل بنجاح");

        // Read user from localStorage (register now stores tokens + user)
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Step 2: If mechanic and coordinates exist, update location immediately
        if (userRole === 'mechanic' && coordinates && user.id) {
          try {
            const { api } = await import('@/lib/api');
            // Update location using the axios instance (which handles token automatically)
            await api.post(`/users/${user.id}/location`, {
              latitude: coordinates.lat,
              longitude: coordinates.lng
            });
            console.log("Location coordinates updated successfully via frontend 2-step process");
          } catch (locError) {
            console.error("Failed to update coordinates after registration:", locError);
            // Don't block the redirect, just log the error
          }
        }

        // Step 3: If mechanic and image selected, upload avatar
        if (userRole === 'mechanic' && selectedImage && user.id) {
          try {
            const { api } = await import('@/lib/api');
            const formData = new FormData();
            formData.append('avatar', selectedImage);
            await api.post(`/users/${user.id}/avatar`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            console.log("Avatar uploaded successfully");
          } catch (avatarError) {
            console.error("Failed to upload avatar:", avatarError);
            // Don't block the redirect, just log the error
          }
        }

        // Redirect based on role (same logic as login)
        if (user && user.role === 'admin') {
          navigate("/admin");
        } else if (user && user.role === 'mechanic') {
          navigate("/profile/mechanic");
        } else if (user && user.role === 'workshop') {
          navigate("/profile/workshop");
        } else {
          navigate("/");
        }
      } else {
        toast.error("فشل التسجيل - يرجى التحقق من البيانات المدخلة");
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("حدث خطأ في التسجيل - يرجى المحاولة مرة أخرى");
    }
  };

  const switchMode = () => {
    setSearchParams(new URLSearchParams({ mode: mode === "login" ? "register" : "login" }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-orange-500/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-orange-500/5 rounded-full animate-soft-pulse"></div>
      </div>

      {/* Car decorative elements */}
      <div className="absolute top-20 left-20 text-primary/20 animate-float" style={{ animationDelay: '2s' }}>
        <div className="text-4xl transform rotate-12">🚗</div>
      </div>
      <div className="absolute bottom-20 right-20 text-orange-500/20 animate-float" style={{ animationDelay: '3s' }}>
        <div className="text-3xl transform -rotate-12">🔧</div>
      </div>
      <div className="absolute top-1/3 right-32 text-primary/15 animate-float" style={{ animationDelay: '4s' }}>
        <div className="text-3xl transform rotate-45">⚙️</div>
      </div>
      <div className="absolute top-1/2 left-32 text-orange-500/15 animate-float" style={{ animationDelay: '5s' }}>
        <div className="text-2xl transform -rotate-45">🛠️</div>
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-10 border border-border/50 shadow-xl animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent animate-shimmer">
              {mode === "login" ? "تسجيل الدخول" : "تسجيل مستخدم جديد"}
            </h1>
            <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {mode === "login" ? "أهلاً بك مرة أخرى" : "انضم إلى عائلتنا"}
            </p>
          </div>

          {mode === "login" ? (
            <>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <FormField
                    control={loginForm.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right block">اختر نوع المستخدم:</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-right">
                              <SelectValue placeholder="-- اختر --" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="customer">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4" />
                                عميل
                              </div>
                            </SelectItem>
                            <SelectItem value="mechanic">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4" />
                                ميكانيكي
                              </div>
                            </SelectItem>
                            <SelectItem value="workshop">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                مركز صيانة
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right block">البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="البريد الإلكتروني"
                            className="text-right"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right block">كلمة المرور</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="كلمة المرور"
                              className="text-right pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 py-6 text-lg font-bold hover-lift transition-all duration-300 shadow-lg animate-soft-pulse"
                  >
                    دخول
                  </Button>
                </form>
              </Form>

              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={switchMode}
                >
                  تسجيل مستخدم جديد
                </Button>
              </div>
            </>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <FormField
                  control={registerForm.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block">اختر نوع المستخدم:</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="-- اختر --" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              عميل
                            </div>
                          </SelectItem>
                          <SelectItem value="mechanic">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4" />
                              ميكانيكي
                            </div>
                          </SelectItem>
                          <SelectItem value="workshop">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              مركز صيانة
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block">الإسم الكامل</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="الإسم الكامل"
                          className="text-right"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block">البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="البريد الإلكتروني"
                          className="text-right"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block">كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="كلمة المرور"
                            className="text-right pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block">تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="تأكيد كلمة المرور"
                            className="text-right pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {userType === "customer" && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-bold text-right">بيانات السيارة</h3>

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+20xxxxxxxxxx"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="carBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">ماركة السيارة</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="مثال: تويوتا"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="carModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">نوع السيارة</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="مثال: كامري"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="carYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">سنة الصنع</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="2020"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="plateNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">رقم اللوحة</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="رقم اللوحة"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">عداد الكيلومترات</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="مثال: 45000"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="lastMaintenance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">تاريخ آخر صيانة</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <FormField
                      control={registerForm.control}
                      name="dealership"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">التوكيل المعتمد</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-right">
                                <SelectValue placeholder="اختر التوكيل" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="تويوتا أسوان">تويوتا أسوان</SelectItem>
                              <SelectItem value="هيونداي أسوان">هيونداي أسوان</SelectItem>
                              <SelectItem value="كيا أسوان">كيا أسوان</SelectItem>
                              <SelectItem value="نيسان أسوان">نيسان أسوان</SelectItem>
                              <SelectItem value="ميتسوبيشي أسوان">ميتسوبيشي أسوان</SelectItem>
                              <SelectItem value="شيفروليه أسوان">شيفروليه أسوان</SelectItem>
                              <SelectItem value="فورد أسوان">فورد أسوان</SelectItem>
                              <SelectItem value="بي إم دبليو أسوان">بي إم دبليو أسوان</SelectItem>
                              <SelectItem value="مرسيدس أسوان">مرسيدس أسوان</SelectItem>
                              <SelectItem value="أودي أسوان">أودي أسوان</SelectItem>
                              <SelectItem value="فولكس فاجن أسوان">فولكس فاجن أسوان</SelectItem>
                              <SelectItem value="سكودا أسوان">سكودا أسوان</SelectItem>
                              <SelectItem value="سيات أسوان">سيات أسوان</SelectItem>
                              <SelectItem value="رينو أسوان">رينو أسوان</SelectItem>
                              <SelectItem value="بيجو أسوان">بيجو أسوان</SelectItem>
                              <SelectItem value="سيتورين أسوان">سيتورين أسوان</SelectItem>
                              <SelectItem value="أوبل أسوان">أوبل أسوان</SelectItem>
                              <SelectItem value="فيات أسوان">فيات أسوان</SelectItem>
                              <SelectItem value="هوندا أسوان">هوندا أسوان</SelectItem>
                              <SelectItem value="مازدا أسوان">مازدا أسوان</SelectItem>
                              <SelectItem value="سوبارو أسوان">سوبارو أسوان</SelectItem>
                              <SelectItem value="سوزوكي أسوان">سوزوكي أسوان</SelectItem>
                              <SelectItem value="ديهاتسو أسوان">ديهاتسو أسوان</SelectItem>
                              <SelectItem value="إيسوزو أسوان">إيسوزو أسوان</SelectItem>
                              <SelectItem value="جي إم سي أسوان">جي إم سي أسوان</SelectItem>
                              <SelectItem value="جيب أسوان">جيب أسوان</SelectItem>
                              <SelectItem value="كرايسلر أسوان">كرايسلر أسوان</SelectItem>
                              <SelectItem value="دودج أسوان">دودج أسوان</SelectItem>
                              <SelectItem value="رام أسوان">رام أسوان</SelectItem>
                              <SelectItem value="تيسلا أسوان">تيسلا أسوان</SelectItem>
                              <SelectItem value="بورش أسوان">بورش أسوان</SelectItem>
                              <SelectItem value="لامبورغيني أسوان">لامبورغيني أسوان</SelectItem>
                              <SelectItem value="فيراري أسوان">فيراري أسوان</SelectItem>
                              <SelectItem value="مازيراتي أسوان">مازيراتي أسوان</SelectItem>
                              <SelectItem value="بنتلي أسوان">بنتلي أسوان</SelectItem>
                              <SelectItem value="رولز رويس أسوان">رولز رويس أسوان</SelectItem>
                              <SelectItem value="ماكلارين أسوان">ماكلارين أسوان</SelectItem>
                              <SelectItem value="غير محدد">غير محدد</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {userType === "mechanic" && (
                  <>
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+20xxxxxxxxxx"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <div className="space-y-2">
                      <Label className="text-right block font-semibold">الموقع الجغرافي</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetLocation}
                        disabled={locationLoading}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        {locationLoading ? "جاري تحديد الموقع..." : coordinates ? "تم تحديد الموقع بنجاح ✅" : "تحديد موقعي الحالي"}
                      </Button>
                      {coordinates && (
                        <p className="text-xs text-green-600 text-right">
                          تم حفظ الإحداثيات: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-right block font-semibold">الصورة الشخصية</Label>
                      <div className="flex flex-col items-center gap-4">
                        {imagePreview && (
                          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                            <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="w-full">
                          <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <label htmlFor="avatar-upload">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full flex items-center justify-center gap-2 cursor-pointer"
                              onClick={() => document.getElementById('avatar-upload')?.click()}
                            >
                              <Upload className="h-4 w-4" />
                              {selectedImage ? "تغيير الصورة" : "اختر صورة شخصية"}
                            </Button>
                          </label>
                          {selectedImage && (
                            <p className="text-xs text-green-600 text-right mt-2">
                              تم اختيار: {selectedImage.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-right block font-semibold">التخصصات المقدمة *</Label>
                      <div className="space-y-2">
                        {[
                          "صيانة عامة",
                          "محرك",
                          "كهرباء",
                          "عفشة",
                          "فرامل",
                          "تكييف",
                          "جير",
                          "إطارات",
                          "سمكرة ودوكو",
                          "فحص كمبيوتر",
                          "ضبط زوايا",
                          "تغيير زيوت وفلاتر",
                          "زجاج"
                        ].map((service, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`specialty-${index}`}
                              checked={registerForm.watch("specialty")?.includes(service)}
                              onChange={(e) => {
                                const currentSpecialties = registerForm.watch("specialty") || "";
                                const specialtiesArray = currentSpecialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
                                let newSpecialties;
                                if (e.target.checked) {
                                  newSpecialties = [...specialtiesArray, service];
                                } else {
                                  newSpecialties = specialtiesArray.filter(s => s !== service);
                                }
                                registerForm.setValue("specialty", newSpecialties.join(', '));
                              }}
                              className="rounded"
                            />
                            <label htmlFor={`specialty-${index}`} className="text-right cursor-pointer">
                              {service}
                            </label>
                          </div>
                        ))}
                      </div>
                      {registerForm.watch("specialty") && (
                        <p className="text-xs text-muted-foreground text-right">
                          التخصصات المختارة: {registerForm.watch("specialty")}
                        </p>
                      )}
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">سنوات الخبرة</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="عدد سنوات الخبرة"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Location for mechanic (required by backend) */}
                    <FormField
                      control={registerForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">الموقع / المدينة</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="مثال: القاهرة"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {userType === "workshop" && (
                  <>
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+20xxxxxxxxxx"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="workshopName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">اسم المركز</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="اسم مركز الصيانة"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">العنوان</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="عنوان المركز"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">وصف المركز</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="وصف مختصر للمركز"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="services"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">الخدمات المقدمة</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="مثال: صيانة، إصلاح، تغيير زيوت"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="workingHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">ساعات العمل</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="مثال: 9 ص - 6 م"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 py-6 text-lg font-semibold hover-lift transition-all duration-300 shadow-lg"
                >
                  تسجيل
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={switchMode}
                >
                  لدي حساب بالفعل
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;