import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package, Star, TrendingUp, DollarSign, Upload, AlertTriangle, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const WorkshopProfile = () => {
  const { user } = useAuth();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    carType: "",
    image: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data and products
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?._id) {
        setLoading(false);
        setStatsLoading(false);
        return;
      }

      try {
        setLoading(true);
        setStatsLoading(true);
        setError(null);

        // Fetch user data
        const userProfile = await api.get(`/users/${user._id}`).then(res => res.data);

        setUserData({
          name: userProfile.name,
          workshopName: userProfile.workshopName,
          workshopAddress: userProfile.workshopAddress,
          email: userProfile.email,
          phone: userProfile.phone,
          location: userProfile.location,
          joinDate: new Date(userProfile.createdAt).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long'
          }),
        });

        // Fetch workshop products (public endpoint, no auth required)
        const productsResponse = await fetch(`http://localhost:5000/products?workshopId=${user._id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const products = productsData.products || [];
          setCurrentProducts(products.map((product: any) => ({
            id: product._id,
            name: product.name,
            price: product.price.toString(),
            category: product.category || 'غير محدد',
            carType: product.carType || 'عام',
            description: product.description || '',
            image: product.images?.[0] ? `http://localhost:5000/${product.images[0]}` : "/placeholder.svg",
            stock: product.stock?.toString() || '0'
          })));
        }

        // Fetch workshop statistics
        try {
          const statsData = await api.get(`/orders/workshop/stats`).then(res => res.data);
          setStats(statsData);
        } catch (statsError) {
          console.log('Stats not available:', statsError);
          setStats(null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('فشل في تحميل بيانات المستخدم');
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);


  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', productData.name);
      formDataToSend.append('price', productData.price);
      formDataToSend.append('description', productData.description);
      formDataToSend.append('category', productData.category);
      formDataToSend.append('carType', productData.carType);
      formDataToSend.append('stock', '10'); // Default stock
      if (productData.image) {
        formDataToSend.append('images', productData.image);
      }

      const response = await api.post('/products', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newProduct = response.data;

        // Add to current products list
         setCurrentProducts(prev => [...prev, {
           id: newProduct._id,
           name: newProduct.name,
           price: newProduct.price.toString(),
           category: newProduct.category || productData.category,
           carType: newProduct.carType || productData.carType,
           description: newProduct.description || productData.description,
           image: newProduct.images?.[0] ? `http://localhost:5000/${newProduct.images[0]}` : "/placeholder.svg",
           stock: newProduct.stock?.toString() || '10'
         }]);

        toast.success("تم إضافة المنتج بنجاح");
        setShowAddProduct(false);
        setProductData({ name: "", price: "", description: "", category: "", carType: "", image: null });
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('فشل في إضافة المنتج');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductData({ ...productData, image: file });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">جاري تحميل بيانات الملف الشخصي...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">حدث خطأ في تحميل البيانات</h3>
            <p className="text-muted-foreground mb-4">{error || 'لم يتم العثور على بيانات المستخدم'}</p>
            <Button onClick={() => window.location.reload()} className="rounded-full">
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
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Profile Header */}
          <motion.div
            className="bg-gradient-to-br from-primary/10 via-orange-500/5 to-background dark:from-gray-900/50 dark:via-gray-800/30 dark:to-black rounded-3xl p-10 mb-10 shadow-2xl border border-border/50 dark:border-gray-700/50 transition-colors duration-300"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-right">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">{userData.workshopName || userData.name}</h1>
                <p className="text-muted-foreground mb-6 text-lg">{userData.workshopAddress || userData.location}</p>
                {/* Remove ratings section for workshops - Center-specific feature */}
              </div>
              {/* <Button
                className="rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 text-white font-semibold px-8 py-6 text-lg hover-lift transition-all duration-300 shadow-lg"
                onClick={() => {
                  // TODO: Implement workshop profile edit with admin approval
                  toast.info("ميزة تعديل بيانات المركز مع موافقة المدير قيد التطوير");
                }}
              >
                <Edit className="h-6 w-6 ml-2" />
                تعديل بيانات المركز
              </Button> */}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-8">
                <Card className="p-8 text-center animate-slide-up shadow-xl border-border/50 bg-gradient-to-br from-primary/5 to-background dark:from-gray-900/50 dark:to-gray-800/30 transition-colors duration-300">
                  <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-4xl font-bold text-primary mb-2">
                    {statsLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    ) : (
                      stats?.totalProducts || currentProducts.length
                    )}
                  </p>
                  <p className="text-base text-muted-foreground font-medium">منتج متاح</p>
                </Card>
                <Card className="p-8 text-center animate-slide-up shadow-xl border-border/50 bg-gradient-to-br from-orange-500/5 to-background dark:from-gray-900/50 dark:to-gray-800/30 transition-colors duration-300" style={{ animationDelay: "0.1s" }}>
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-4xl font-bold text-primary mb-2">
                    {statsLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    ) : (
                      stats?.monthlySales || 0
                    )}
                  </p>
                  <p className="text-base text-muted-foreground font-medium">مبيعات الشهر</p>
                </Card>
                <Card className="p-8 text-center animate-slide-up shadow-xl border-border/50 bg-gradient-to-br from-green-500/5 to-background dark:from-gray-900/50 dark:to-gray-800/30 transition-colors duration-300" style={{ animationDelay: "0.2s" }}>
                  <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-4xl font-bold text-primary mb-2">
                    {statsLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    ) : (
                      `${(stats?.monthlyRevenue || 0).toLocaleString()} ج.م`
                    )}
                  </p>
                  <p className="text-base text-muted-foreground font-medium">إيرادات الشهر</p>
                </Card>
              </div>

              {/* Add Product Section */}
              <Card className="p-6 animate-slide-up bg-card/90 dark:bg-gray-900/90 transition-colors duration-300" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
                  <Button
                      onClick={() => {
                        window.location.href = '/inventory-management';
                      }}
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
                            onClick={async () => {
                              try {
                                // Delete from backend
                                await api.delete(`/products/${currentProducts[index].id}`);

                                // Remove from current products list
                                setCurrentProducts(prev => prev.filter((_, i) => i !== index));

                                // Dispatch event to update store
                                window.dispatchEvent(new Event('workshopProductsUpdated'));

                                toast.success("تم حذف المنتج من الورشة والمتجر");
                              } catch (error) {
                                console.error('Failed to delete product:', error);
                                toast.error("حدث خطأ أثناء حذف المنتج");
                              }
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
              <Card className="p-8 bg-gradient-to-br from-primary/10 via-orange-500/5 to-background dark:from-gray-900/50 dark:via-gray-800/30 dark:to-black animate-slide-up shadow-xl border-border/50 dark:border-gray-700/50 transition-colors duration-300" style={{ animationDelay: "0.4s" }}>
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">ملخص المبيعات</h3>
                <div className="space-y-4 text-right">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">اليوم</span>
                    <span className="font-bold text-lg text-primary">
                      {statsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        `${stats?.dailyOrders?.find((d: any) => d._id === new Date().toISOString().split('T')[0])?.orders || 0} طلب`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">هذا الأسبوع</span>
                    <span className="font-bold text-lg text-primary">
                      {statsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        `${stats?.dailyOrders?.slice(-7).reduce((sum: number, d: any) => sum + d.orders, 0) || 0} طلب`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <span className="text-base text-muted-foreground">هذا الشهر</span>
                    <span className="font-bold text-lg text-primary">
                      {statsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        `${stats?.monthlySales || 0} طلب`
                      )}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 text-white font-semibold py-6 text-lg hover-lift transition-all duration-300 shadow-lg mt-6"
                  onClick={() => {
                    window.location.href = '/reports';
                  }}
                >
                  عرض التقارير
                </Button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300" style={{ animationDelay: "0.5s" }}>
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">إجراءات سريعة</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full rounded-full justify-start text-base py-6 hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
                    onClick={() => {
                      window.location.href = '/order-management';
                    }}
                  >
                    إدارة الطلبات
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-full justify-start text-base py-6 hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
                    onClick={() => {
                      window.location.href = '/inventory-management';
                    }}
                  >
                    إدارة المخزون
                  </Button>
                </div>
              </Card>

              {/* Top Products */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300" style={{ animationDelay: "0.6s" }}>
                <h3 className="font-bold mb-6 text-right text-xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">المنتجات الأكثر مبيعاً</h3>
                <div className="space-y-4">
                  {statsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">جاري تحميل البيانات...</p>
                    </div>
                  ) : stats?.topProducts?.length > 0 ? (
                    stats.topProducts.map((product: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30 hover-lift transition-all duration-300"
                      >
                        <span className="text-base font-medium">{product.name}</span>
                        <span className="text-sm text-muted-foreground font-semibold">{product.totalSold} بيع</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">لا توجد بيانات مبيعات بعد</p>
                    </div>
                  )}
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
