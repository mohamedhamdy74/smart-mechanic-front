import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, Mail, MapPin, Wrench, Save, ArrowLeft, Upload, Camera } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EditMechanicProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "أحمد محمد",
    phone: "+20 109 123 4567",
    email: "ahmed.mechanic@email.com",
    specialization: "إصلاح المحركات",
    experience: "8",
    location: "أسوان، حي الصداقة",
    bio: "ميكانيكي محترف متخصص في إصلاح المحركات مع خبرة 8 سنوات في مجال الصيانة السيارات"
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("/placeholder.svg");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم إرسال طلب التعديل. سيتم مراجعته من قبل الإدارة خلال 24 ساعة");
    navigate("/profile/mechanic");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/profile/mechanic")}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">تعديل الملف الشخصي</h1>
              <p className="text-muted-foreground">قم بتحديث بياناتك المهنية</p>
            </div>
          </div>

          {/* Profile Image Section */}
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Camera className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">صورة الملف الشخصي</h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  يمكنك تغيير الصورة مباشرة. سيتم تحديثها فوراً.
                </p>
                <div className="flex gap-2">
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
                    className="rounded-full"
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    اختر صورة جديدة
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">البيانات الشخصية</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right block">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
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
                  <Label htmlFor="location" className="text-right block">الموقع</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Professional Information */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Wrench className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">البيانات المهنية</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-right block">التخصص</Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleInputChange("specialization", value)}>
                    <SelectTrigger className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="إصلاح المحركات">إصلاح المحركات</SelectItem>
                      <SelectItem value="أنظمة الكهرباء">أنظمة الكهرباء</SelectItem>
                      <SelectItem value="إصلاح الهيكل والطلاء">إصلاح الهيكل والطلاء</SelectItem>
                      <SelectItem value="إصلاح الإطارات والعجلات">إصلاح الإطارات والعجلات</SelectItem>
                      <SelectItem value="صيانة دورية">صيانة دورية</SelectItem>
                      <SelectItem value="إصلاح ناقل الحركة">إصلاح ناقل الحركة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-right block">سنوات الخبرة</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="text-right block">نبذة عنك</Label>
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
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-blue-800 mb-2">ملاحظة مهمة</h3>
                  <p className="text-sm text-blue-700">
                    التغييرات على البيانات الشخصية والمهنية ستحتاج إلى مراجعة وموافقة من قبل الإدارة.
                    قد يستغرق ذلك حتى 24 ساعة. سيتم إشعارك عند الموافقة على التغييرات.
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile/mechanic")}
                className="rounded-full"
              >
                إلغاء
              </Button>
              <Button type="submit" className="rounded-full bg-primary hover:bg-primary-hover">
                <Save className="h-4 w-4 ml-2" />
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