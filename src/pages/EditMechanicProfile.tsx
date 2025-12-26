import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Wrench,
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

const EditMechanicProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    specialization: "",
    experience: "",
    location: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            specialization: userProfile.specialty || "",
            experience: userProfile.experienceYears
              ? userProfile.experienceYears.toString()
              : "",
            location: userProfile.location || "",
            bio: userProfile.bio || "",
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

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("/placeholder.svg");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        specialty: formData.specialization,
        experienceYears: parseInt(formData.experience) || undefined,
        bio: formData.bio || undefined,
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
        // Refresh user data immediately
        const updatedResponse = await fetch(
          `http://localhost:5000/users/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (updatedResponse.ok) {
          const updatedUser = await updatedResponse.json();
          // Update local storage with new data
          const currentUser = JSON.parse(
            localStorage.getItem("currentUser") || "{}"
          );
          const updatedUserData = { ...currentUser, ...updatedUser };
          localStorage.setItem("currentUser", JSON.stringify(updatedUserData));
        }

        toast.success("تم حفظ التغييرات بنجاح");
        navigate("/profile/mechanic");
      } else {
        throw new Error("فشل في حفظ التغييرات");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("فشل في حفظ التغييرات");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("تم تحديث الصورة بنجاح");
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
              onClick={() => navigate("/profile/mechanic")}
              className="rounded-full hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                تعديل الملف الشخصي
              </h1>
              <p className="text-muted-foreground text-lg">
                قم بتحديث بياناتك المهنية
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
                />
              </div>

              <div className="flex-1">
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  يمكنك تغيير الصورة مباشرة. سيتم تحديثها فوراً.
                </p>
                <div className="flex gap-3">
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
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="text-right"
                    required
                  />
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

            {/* Professional Information */}
            <Card
              className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-3 mb-8">
                <Wrench className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  البيانات المهنية
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-right block">
                    التخصص
                  </Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) =>
                      handleInputChange("specialization", value)
                    }
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="إصلاح المحركات">
                        إصلاح المحركات
                      </SelectItem>
                      <SelectItem value="أنظمة الكهرباء">
                        أنظمة الكهرباء
                      </SelectItem>
                      <SelectItem value="إصلاح الهيكل والطلاء">
                        إصلاح الهيكل والطلاء
                      </SelectItem>
                      <SelectItem value="إصلاح الإطارات والعجلات">
                        إصلاح الإطارات والعجلات
                      </SelectItem>
                      <SelectItem value="صيانة دورية">صيانة دورية</SelectItem>
                      <SelectItem value="إصلاح ناقل الحركة">
                        إصلاح ناقل الحركة
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-right block">
                    سنوات الخبرة
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="text-right block">
                    نبذة عنك
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="text-right"
                    rows={4}
                    placeholder="اكتب نبذة قصيرة عن خبراتك وتخصصك..."
                  />
                </div>
              </div>
            </Card>

            {/* Notice */}
            <Card
              className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/50 animate-slide-up shadow-xl transition-colors duration-300"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div className="text-right flex-1">
                  <h3 className="font-bold text-blue-800 mb-3 text-lg">
                    ملاحظة مهمة
                  </h3>
                  <p className="text-base text-blue-700 leading-relaxed">
                    التغييرات على البيانات الشخصية والمهنية ستحتاج إلى مراجعة
                    وموافقة من قبل الإدارة. قد يستغرق ذلك حتى 24 ساعة. سيتم
                    إشعارك عند الموافقة على التغييرات.
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div
              className="flex gap-6 justify-end animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile/mechanic")}
                className="rounded-full px-8 py-6 text-lg font-semibold hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 px-8 py-6 text-lg font-semibold hover-lift transition-all duration-300 shadow-lg"
              >
                <Save className="h-5 w-5 ml-2" />
                إرسال طلب التعديل
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditMechanicProfile;
