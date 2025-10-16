import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package, Star, TrendingUp, DollarSign, Upload } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const WorkshopProfile = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [currentProducts, setCurrentProducts] = useState([
    {
      id: 1,
      name: "زيت محرك أصلي 5W-30",
      price: "150",
      category: "زيوت",
      carType: "سيدان",
      description: "زيت محرك أصلي عالي الجودة مناسب لجميع أنواع السيارات الحديثة",
      image: "/src/assets/products/engine-oil.jpg",
      stock: "50"
    },
    {
      id: 2,
      name: "فلتر هواء احترافي",
      price: "80",
      category: "فلاتر",
      carType: "سيدان",
      description: "فلتر هواء عالي الكفاءة يمنع دخول الغبار والشوائب",
      image: "/src/assets/products/air-filter.jpg",
      stock: "120"
    },
    {
      id: 3,
      name: "بطارية سيارة 70 أمبير",
      price: "450",
      category: "بطاريات",
      carType: "SUV",
      description: "بطارية قوية بقوة 70 أمبير مثالية للسيارات الكبيرة",
      image: "/src/assets/products/battery.jpg",
      stock: "25"
    },
    {
      id: 4,
      name: "إطار 195/65 R15",
      price: "600",
      category: "إطارات",
      carType: "سيدان",
      description: "إطار عالي الجودة مناسب للسيارات السيدان",
      image: "/src/assets/products/tire.jpg",
      stock: "40"
    },
  ]);

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    carType: "",
    image: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // Create image URL for the uploaded file
    const imageUrl = productData.image ? URL.createObjectURL(productData.image) : "/placeholder.svg";

    const newProduct = {
      id: Date.now(),
      name: productData.name,
      price: productData.price,
      category: productData.category,
      carType: productData.carType,
      description: productData.description,
      image: imageUrl,
      stock: "10" // Default stock for new products
    };

    // Add to current products list
    setCurrentProducts(prev => [...prev, newProduct]);

    // Also add to global products array (for store)
    const globalProducts = JSON.parse(localStorage.getItem('workshopProducts') || '[]');
    globalProducts.push({
      ...newProduct,
      carType: productData.carType,
      description: productData.description
    });
    localStorage.setItem('workshopProducts', JSON.stringify(globalProducts));

    toast.success("تم إضافة المنتج بنجاح");
    setShowAddProduct(false);
    setProductData({ name: "", price: "", description: "", category: "", carType: "", image: null });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductData({ ...productData, image: file });
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Profile Header */}
          <div className="bg-gradient-hero rounded-3xl p-8 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-right">
                <h1 className="text-3xl font-bold mb-2">مركز صيانة السيارات المتقدم</h1>
                <p className="text-muted-foreground mb-4">أسوان، حي الصداقة</p>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">4.9 (150+ تقييم)</span>
                </div>
              </div>
              <Button
                className="rounded-full bg-white text-primary hover:bg-white/90"
                onClick={() => {
                  // TODO: Implement workshop profile edit with admin approval
                  toast.info("ميزة تعديل بيانات المركز مع موافقة المدير قيد التطوير");
                }}
              >
                تعديل بيانات المركز
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-6 text-center animate-slide-up">
                  <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold">48</p>
                  <p className="text-sm text-muted-foreground">منتج متاح</p>
                </Card>
                <Card className="p-6 text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold">320</p>
                  <p className="text-sm text-muted-foreground">مبيعات الشهر</p>
                </Card>
                <Card className="p-6 text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold">85K</p>
                  <p className="text-sm text-muted-foreground">إيرادات الشهر</p>
                </Card>
              </div>

              {/* Add Product Section */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
                  <Button
                    onClick={() => setShowAddProduct(!showAddProduct)}
                    className="rounded-full"
                  >
                    <Plus className="h-5 w-5 ml-2" />
                    إضافة منتج جديد
                  </Button>
                </div>

                {showAddProduct && (
                  <form onSubmit={handleAddProduct} className="space-y-4 mb-6 p-4 bg-muted rounded-xl">
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="text-right block">
                        اسم المنتج
                      </Label>
                      <Input
                        id="productName"
                        value={productData.name}
                        onChange={(e) =>
                          setProductData({ ...productData, name: e.target.value })
                        }
                        placeholder="مثال: زيت محرك 5W-30"
                        className="text-right"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productPrice" className="text-right block">
                        السعر (ج.م)
                      </Label>
                      <Input
                        id="productPrice"
                        type="number"
                        value={productData.price}
                        onChange={(e) =>
                          setProductData({ ...productData, price: e.target.value })
                        }
                        placeholder="150"
                        className="text-right"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productCategory" className="text-right block">
                        الفئة
                      </Label>
                      <Input
                        id="productCategory"
                        value={productData.category}
                        onChange={(e) =>
                          setProductData({ ...productData, category: e.target.value })
                        }
                        placeholder="مثال: زيوت المحركات"
                        className="text-right"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productCarType" className="text-right block">
                        نوع السيارة
                      </Label>
                      <Input
                        id="productCarType"
                        value={productData.carType}
                        onChange={(e) =>
                          setProductData({ ...productData, carType: e.target.value })
                        }
                        placeholder="مثال: سيدان، SUV، شاحنة"
                        className="text-right"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productImage" className="text-right block">
                        صورة المنتج
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="productImage"
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
                          className="flex-1 rounded-full"
                        >
                          <Upload className="h-4 w-4 ml-2" />
                          اختر صورة
                        </Button>
                        {productData.image && (
                          <span className="text-sm text-muted-foreground self-center">
                            {productData.image.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productDescription" className="text-right block">
                        وصف المنتج
                      </Label>
                      <Textarea
                        id="productDescription"
                        value={productData.description}
                        onChange={(e) =>
                          setProductData({ ...productData, description: e.target.value })
                        }
                        placeholder="وصف تفصيلي للمنتج"
                        className="text-right"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="rounded-full flex-1">
                        إضافة المنتج
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddProduct(false)}
                        className="rounded-full"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </form>
                )}

                {/* Products List */}
                <div className="space-y-3">
                  <h3 className="font-bold text-right mb-4">المنتجات الحالية</h3>
                  {currentProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted/50 rounded-lg overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-right flex-1">
                          <h4 className="font-bold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            المخزون: {product.stock} قطعة
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary text-lg">{product.price} ج.م</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-xs"
                            onClick={() => {
                              // TODO: Implement edit product functionality
                              toast.info("ميزة تعديل المنتج قيد التطوير");
                            }}
                          >
                            تعديل
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full text-xs text-destructive"
                            onClick={() => {
                              // Remove from current products
                              setCurrentProducts(prev => prev.filter((_, i) => i !== index));

                              // Also remove from workshop products in localStorage
                              const workshopProducts = JSON.parse(localStorage.getItem('workshopProducts') || '[]');
                              const updatedWorkshopProducts = workshopProducts.filter((product: any) =>
                                product.name !== currentProducts[index].name
                              );
                              localStorage.setItem('workshopProducts', JSON.stringify(updatedWorkshopProducts));

                              // Dispatch event to update store
                              window.dispatchEvent(new Event('workshopProductsUpdated'));

                              toast.success("تم حذف المنتج من الورشة والمتجر");
                            }}
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sales Summary */}
              <Card className="p-6 bg-gradient-hero animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <h3 className="font-bold mb-4 text-right">ملخص المبيعات</h3>
                <div className="space-y-3 text-right">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">اليوم</span>
                    <span className="font-bold">12 طلب</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">هذا الأسبوع</span>
                    <span className="font-bold">87 طلب</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">هذا الشهر</span>
                    <span className="font-bold">320 طلب</span>
                  </div>
                </div>
                <Button className="w-full rounded-full bg-white text-primary hover:bg-white/90 mt-4">
                  عرض التقارير
                </Button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.5s" }}>
                <h3 className="font-bold mb-4 text-right">إجراءات سريعة</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full rounded-full justify-start text-sm">
                    إدارة الطلبات
                  </Button>
                  <Button variant="outline" className="w-full rounded-full justify-start text-sm">
                    إدارة المخزون
                  </Button>
                  <Button variant="outline" className="w-full rounded-full justify-start text-sm">
                    التقارير المالية
                  </Button>
                  <Button variant="outline" className="w-full rounded-full justify-start text-sm">
                    إعدادات المتجر
                  </Button>
                </div>
              </Card>

              {/* Top Products */}
              <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.6s" }}>
                <h3 className="font-bold mb-4 text-right">المنتجات الأكثر مبيعاً</h3>
                <div className="space-y-3">
                  {[
                    { name: "زيت محرك", sales: "45 بيع" },
                    { name: "فلتر هواء", sales: "38 بيع" },
                    { name: "إطارات", sales: "32 بيع" },
                  ].map((product, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 rounded-lg bg-muted"
                    >
                      <span className="text-sm">{product.name}</span>
                      <span className="text-xs text-muted-foreground">{product.sales}</span>
                    </div>
                  ))}
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

export default WorkshopProfile;
