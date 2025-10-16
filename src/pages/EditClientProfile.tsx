import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Car, Phone, Mail, MapPin, Save, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EditClientProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "محمد أحمد",
    phone: "+20 109 123 4567",
    email: "client@example.com",
    carBrand: "تويوتا",
    carModel: "كامري",
    carYear: "2020",
    licensePlate: "أ ب ج 1234",
    lastService: "15 مارس 2024",
    mileage: "45000",
    dealership: "تويوتا أسوان",
    address: "أسوان، حي الصداقة"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم حفظ التغييرات بنجاح");
    navigate("/profile/client");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              onClick={() => navigate("/profile/client")}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">تعديل الملف الشخصي</h1>
              <p className="text-muted-foreground">قم بتحديث بياناتك الشخصية</p>
            </div>
          </div>

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
                  <Label htmlFor="address" className="text-right block">العنوان</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Car Information */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Car className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">بيانات السيارة</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="carBrand" className="text-right block">الماركة</Label>
                  <Select value={formData.carBrand} onValueChange={(value) => handleInputChange("carBrand", value)}>
                    <SelectTrigger className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="تويوتا">تويوتا</SelectItem>
                      <SelectItem value="هيونداي">هيونداي</SelectItem>
                      <SelectItem value="كيا">كيا</SelectItem>
                      <SelectItem value="نيسان">نيسان</SelectItem>
                      <SelectItem value="ميتسوبيشي">ميتسوبيشي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carModel" className="text-right block">الموديل</Label>
                  <Input
                    id="carModel"
                    value={formData.carModel}
                    onChange={(e) => handleInputChange("carModel", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carYear" className="text-right block">سنة الصنع</Label>
                  <Input
                    id="carYear"
                    type="number"
                    value={formData.carYear}
                    onChange={(e) => handleInputChange("carYear", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate" className="text-right block">رقم اللوحة</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => handleInputChange("licensePlate", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-right block">عداد الكيلومترات</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealership" className="text-right block">الوكالة المعتمدة</Label>
                  <Select value={formData.dealership} onValueChange={(value) => handleInputChange("dealership", value)}>
                    <SelectTrigger className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="تويوتا أسوان">تويوتا أسوان</SelectItem>
                      <SelectItem value="هيونداي أسوان">هيونداي أسوان</SelectItem>
                      <SelectItem value="كيا أسوان">كيا أسوان</SelectItem>
                      <SelectItem value="نيسان أسوان">نيسان أسوان</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile/client")}
                className="rounded-full"
              >
                إلغاء
              </Button>
              <Button type="submit" className="rounded-full bg-primary hover:bg-primary-hover">
                <Save className="h-4 w-4 ml-2" />
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