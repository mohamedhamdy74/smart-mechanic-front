import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  Hash,
  Activity,
  Award,
  Save,
  ArrowLeft,
  Upload,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SimpleAuthContext";

const EditClientProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    carBrand: "",
    carModel: "",
    carYear: "",
    plateNumber: "",
    mileage: "",
    dealership: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("/placeholder.svg");

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:5000/users/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.ok) {
          const userProfile = await response.json();
          setFormData({
            name: userProfile.name || "",
            phone: userProfile.phone || "",
            email: userProfile.email || "",
            location: userProfile.location || "",
            carBrand: userProfile.carBrand || "",
            carModel: userProfile.carModel || "",
            carYear: userProfile.carYear || "",
            plateNumber: userProfile.plateNumber || "",
            mileage: userProfile.mileage ? userProfile.mileage.toString() : "",
            dealership: userProfile.dealership || "",
          });
          if (userProfile.profileImage) {
            setImagePreview(`http://localhost:5000/${userProfile.profileImage}`);
          }
        } else {
          throw new Error("فشل في تحميل بيانات المستخدم");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("فشل في تحميل بيانات المستخدم");
        toast.error("فشل في تحميل بيانات المستخدم");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        carBrand: formData.carBrand,
        carModel: formData.carModel,
        carYear: formData.carYear,
        plateNumber: formData.plateNumber,
        mileage: formData.mileage !== "" ? parseInt(formData.mileage) : undefined,
        dealership: formData.dealership,
      };

      const response = await fetch(`http://localhost:5000/users/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast.success("تم حفظ التغييرات بنجاح");
        navigate("/profile/client");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في حفظ التغييرات");
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "فشل في حفظ التغييرات");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?._id) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('avatar', file);

        const response = await fetch(`http://localhost:5000/users/${user._id}/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: uploadFormData,
        });

        if (response.ok) {
          const result = await response.json();
          setImagePreview(`http://localhost:5000/${result.user.profileImage}`);
          toast.success("تم تحديث الصورة بنجاح");
        } else {
          toast.error("فشل في تحميل الصورة");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("حدث خطأ أثناء تحميل الصورة");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">
              جاري تحميل بيانات الملف الشخصي...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              حدث خطأ في تحميل البيانات
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="rounded-full"
            >
              إعادة المحاولة
            </Button>
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
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-6 mb-10 animate-fade-in">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/profile/client")}
              className="rounded-full hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                تعديل الملف الشخصي
              </h1>
              <p className="text-muted-foreground text-lg">
                قم بتحديث بياناتك وبيانات سيارتك
              </p>
            </div>
          </div>

          {/* Profile Image Section */}
          <Card className="p-8 mb-10 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-8">
              <Camera className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                صورة الملف الشخصي
              </h2>
            </div>

            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center border-4 border-primary/20 overflow-hidden shadow-lg">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>

              <div className="flex-1">
                <p className="text-base text-muted-foreground mb-6 leading-relaxed text-right">
                  يمكنك تغيير الصورة الشخصية لتظهر في ملفك الشخصي.
                </p>
                <div className="flex gap-3 justify-end">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full px-6 py-3 text-base font-semibold hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
                  >
                    <Upload className="h-5 w-5 ml-2" />
                    اختر صورة جديدة
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal Information */}
            <Card
              className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-3 mb-8">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  البيانات الشخصية
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right block">
                    الاسم الكامل
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block">
                    رقم الهاتف
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="text-right bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">لا يمكن تعديل البريد الإلكتروني</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-right block">
                    الموقع
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="text-right"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Car Information */}
            <Card
              className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-3 mb-8">
                <Car className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  بيانات السيارة
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="carBrand" className="text-right block">
                    ماركة السيارة
                  </Label>
                  <Input
                    id="carBrand"
                    value={formData.carBrand}
                    onChange={(e) => handleInputChange("carBrand", e.target.value)}
                    placeholder="مثال: تويوتا"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carModel" className="text-right block">
                    نوع السيارة
                  </Label>
                  <Input
                    id="carModel"
                    value={formData.carModel}
                    onChange={(e) => handleInputChange("carModel", e.target.value)}
                    placeholder="مثال: كامري"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carYear" className="text-right block">
                    سنة الصنع
                  </Label>
                  <Input
                    id="carYear"
                    value={formData.carYear}
                    onChange={(e) => handleInputChange("carYear", e.target.value)}
                    placeholder="2020"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plateNumber" className="text-right block">
                    رقم اللوحة
                  </Label>
                  <Input
                    id="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) => handleInputChange("plateNumber", e.target.value)}
                    placeholder="رقم اللوحة"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-right block">
                    عداد الكيلومترات
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                    placeholder="مثال: 45000"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealership" className="text-right block">
                    التوكيل المعتمد
                  </Label>
                  <Select
                    value={formData.dealership}
                    onValueChange={(value) => handleInputChange("dealership", value)}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر التوكيل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="تويوتا أسوان">تويوتا أسوان</SelectItem>
                      <SelectItem value="هيونداي أسوان">هيونداي أسوان</SelectItem>
                      <SelectItem value="كيا أسوان">كيا أسوان</SelectItem>
                      <SelectItem value="نيسان أسوان">نيسان أسوان</SelectItem>
                      <SelectItem value="ميتسوبيشي أسوان">ميتسوبيشي أسوان</SelectItem>
                      <SelectItem value="شيفروليه أسوان">شيفروليه أسوان</SelectItem>
                      <SelectItem value="غير محدد">غير محدد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div
              className="flex gap-6 justify-end animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile/client")}
                className="rounded-full px-8 py-6 text-lg font-semibold hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 px-8 py-6 text-lg font-semibold hover-lift transition-all duration-300 shadow-lg"
              >
                <Save className="h-5 w-5 ml-2" />
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditClientProfile;
