import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { UserCheck, Wrench, Building2 } from "lucide-react";

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
  // Client specific fields
  carBrand: z.string().optional(),
  carModel: z.string().optional(),
  carYear: z.string().optional(),
  plateNumber: z.string().optional(),
  lastMaintenance: z.string().optional(),
  dealership: z.string().optional(),
  maintenanceSchedule: z.string().optional(),
  // Mechanic specific fields
  specialty: z.string().optional(),
  experience: z.string().optional(),
  // Workshop specific fields
  workshopName: z.string().optional(),
  address: z.string().optional(),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const mode = searchParams.get("mode") || "login";

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
      carBrand: "",
      carModel: "",
      carYear: "",
      plateNumber: "",
      lastMaintenance: "",
      dealership: "",
      specialty: "",
      experience: "",
      workshopName: "",
      address: "",
    },
  });

  const userType = mode === "login" 
    ? loginForm.watch("userType") 
    : registerForm.watch("userType");

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      const success = await login(data.email, data.password);

      if (success) {
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/");
      } else {
        toast.error("بيانات الدخول غير صحيحة");
      }
    } catch (error) {
      toast.error("حدث خطأ في تسجيل الدخول");
    }
  };

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      // Map user types
      const roleMap: { [key: string]: 'client' | 'mechanic' | 'workshop' } = {
        'customer': 'client',
        'mechanic': 'mechanic',
        'workshop': 'workshop'
      };

      const userRole = roleMap[data.userType];

      const success = await register({
        name: data.name,
        email: data.email,
        phone: '+20' + Math.random().toString().slice(2, 11), // Generate random phone for demo
        password: data.password,
        role: userRole,
        location: data.address || data.dealership || 'أسوان'
      });

      if (success) {
        toast.success("تم التسجيل بنجاح");
        navigate("/");
      } else {
        toast.error("البريد الإلكتروني مستخدم بالفعل");
      }
    } catch (error) {
      toast.error("حدث خطأ في التسجيل");
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-8">
              {mode === "login" ? "تسجيل الدخول" : "تسجيل مستخدم جديد"}
            </h1>

            {mode === "login" ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
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
                          <Input
                            type="password"
                            placeholder="كلمة المرور"
                            className="text-right"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full rounded-full bg-primary hover:bg-primary-hover py-6 text-lg"
                  >
                    دخول
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
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
                          <Input
                            type="password"
                            placeholder="كلمة المرور"
                            className="text-right"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {userType === "customer" && (
                    <>
                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-bold text-right">بيانات السيارة</h3>
                        
                        <FormField
                          control={registerForm.control}
                          name="carBrand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-right block">الماركة</FormLabel>
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
                              <FormLabel className="text-right block">الموديل</FormLabel>
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
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {userType === "mechanic" && (
                    <>
                      <FormField
                        control={registerForm.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-right block">التخصص</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="مثال: ميكانيكي عام، كهربائي، إلخ..."
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
                    </>
                  )}

                  {userType === "workshop" && (
                    <>
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
                    </>
                  )}

                  <Button
                    type="submit"
                    className="w-full rounded-full bg-primary hover:bg-primary-hover py-6 text-lg"
                  >
                    تسجيل
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  ليس لديك حساب؟{" "}
                  <Link
                    to="/auth?mode=register"
                    className="text-primary hover:underline font-semibold"
                  >
                    سجل الآن
                  </Link>
                </>
              ) : (
                <>
                  لديك حساب بالفعل؟{" "}
                  <Link
                    to="/auth?mode=login"
                    className="text-primary hover:underline font-semibold"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
