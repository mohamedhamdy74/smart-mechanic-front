import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingUp, TrendingDown, Upload, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { api } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  inStock: boolean;
  category: string;
  carType: string;
  description: string;
  images: string[];
}

const InventoryManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 12; // Show 12 products per page

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    carType: "",
    description: "",
    image: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products using React Query for better caching and performance
  const { data: productsResponse, isLoading, error: queryError } = useQuery({
    queryKey: ['workshop-products', user?._id, currentPage, productsPerPage],
    queryFn: async () => {
      const response = await api.get(`/products?workshopId=${user._id}&page=${currentPage}&limit=${productsPerPage}`);
      const data = response.data;
      return {
        products: data.products || [],
        total: data.total || 0,
        pages: data.pages || 1,
        page: data.page || 1
      };
    },
    enabled: !!user?._id,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Update local state when data changes
  useEffect(() => {
    if (productsResponse) {
      setProducts(productsResponse.products);
      setTotalPages(productsResponse.pages);
    }
  }, [productsResponse]);

  // Handle loading and error states
  useEffect(() => {
    if (queryError) {
      toast.error(queryError.message);
    }
  }, [queryError]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', productData.name);
      formDataToSend.append('price', productData.price);
      formDataToSend.append('description', productData.description);
      formDataToSend.append('category', productData.category);
      formDataToSend.append('carType', productData.carType);
      formDataToSend.append('stock', productData.stock);

      if (productData.image) {
        formDataToSend.append('images', productData.image);
      }

      const response = await api.post('/products', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newProduct = response.data;
      setProducts(prev => [...prev, newProduct]);
      toast.success("تم إضافة المنتج بنجاح");
      resetForm();
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج');
    }
  };
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setUpdatingProductId(editingProduct._id);
      const formDataToSend = new FormData();
      formDataToSend.append('name', productData.name);
      formDataToSend.append('price', productData.price);
      formDataToSend.append('description', productData.description);
      formDataToSend.append('category', productData.category);
      formDataToSend.append('carType', productData.carType);
      formDataToSend.append('stock', productData.stock);
      if (productData.image) {
        formDataToSend.append('images', productData.image);
      }

      const response = await api.put(`/products/${editingProduct._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedProduct = response.data;
      setProducts(prev => prev.map(p => p._id === editingProduct._id ? updatedProduct : p));
      toast.success("تم تحديث المنتج بنجاح");
      resetForm();
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error('حدث خطأ أثناء تحديث المنتج');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success("تم حذف المنتج بنجاح");
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('حدث خطأ أثناء حذف المنتج');
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
      carType: product.carType || "",
      description: product.description || "",
      image: null,
    });
    setShowAddProduct(true);
  };

  const resetForm = () => {
    setProductData({
      name: "",
      price: "",
      stock: "",
      category: "",
      carType: "",
      description: "",
      image: null,
    });
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductData({ ...productData, image: file });
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'غير متوفر', variant: 'destructive' as const, icon: AlertTriangle };
    if (stock <= 5) return { label: 'منخفض', variant: 'secondary' as const, icon: TrendingDown };
    return { label: 'متوفر', variant: 'default' as const, icon: TrendingUp };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-7xl">
            {/* Header Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-6 w-96" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-6 text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </Card>
              ))}
            </div>

            {/* Form Skeleton */}
            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>

              <div className="space-y-2 mt-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>

              <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-20" />
              </div>
            </Card>

            {/* Products List Skeleton */}
            <Card className="p-6">
              <Skeleton className="h-7 w-32 mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                    <div className="text-left flex items-center gap-4">
                      <div>
                        <Skeleton className="h-6 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
  
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
  
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
  
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              إدارة المخزون
            </h1>
            <p className="text-muted-foreground text-lg">
              إدارة منتجات مركز الصيانة وتتبع المخزون والمبيعات
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <Package className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{products.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
            </Card>
            <Card className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.inStock).length}
              </p>
              <p className="text-sm text-muted-foreground">متوفر</p>
            </Card>
            <Card className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">
                {products.filter(p => p.stock > 0 && p.stock <= 5).length}
              </p>
              <p className="text-sm text-muted-foreground">منخفض المخزون</p>
            </Card>
            <Card className="p-6 text-center">
              <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </p>
              <p className="text-sm text-muted-foreground">غير متوفر</p>
            </Card>
          </div>

          {/* Add/Edit Product Section */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <Button
                onClick={() => editingProduct ? resetForm() : setShowAddProduct(!showAddProduct)}
                className="rounded-full"
              >
                {showAddProduct ? 'إلغاء' : <Plus className="h-5 w-5 ml-2" />}
                {showAddProduct ? 'إلغاء' : 'إضافة منتج'}
              </Button>
            </div>

            {showAddProduct && (
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">اسم المنتج</Label>
                    <Input
                      id="productName"
                      value={productData.name}
                      onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                      placeholder="مثال: زيت محرك 5W-30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productPrice">السعر (ج.م)</Label>
                    <Input
                      id="productPrice"
                      type="number"
                      value={productData.price}
                      onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                      placeholder="150"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productStock">الكمية المتاحة</Label>
                    <Input
                      id="productStock"
                      type="number"
                      value={productData.stock}
                      onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                      placeholder="10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productCategory">الفئة</Label>
                    <Input
                      id="productCategory"
                      value={productData.category}
                      onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                      placeholder="مثال: زيوت المحركات"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productCarType">نوع السيارة</Label>
                    <Select value={productData.carType} onValueChange={(value) => setProductData({ ...productData, carType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع السيارة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="سيدان">سيدان</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="شاحنة">شاحنة</SelectItem>
                        <SelectItem value="عام">عام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productImage">صورة المنتج</Label>
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
                        className="flex-1"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productDescription">وصف المنتج</Label>
                  <Textarea
                    id="productDescription"
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    placeholder="وصف تفصيلي للمنتج"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={updatingProductId === editingProduct?._id}>
                    {updatingProductId === editingProduct?._id ? (
                      <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Plus className="h-4 w-4 ml-2" />
                    )}
                    {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    إلغاء
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Products List */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">قائمة المنتجات</h2>
            <div className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
                  <p className="text-muted-foreground">ابدأ بإضافة منتجاتك الأولى</p>
                </div>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  const StockIcon = stockStatus.icon;

                  return (
                    <div key={product._id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted/50 rounded-lg overflow-hidden">
                          <img
                            src={product.images?.[0] ? `http://localhost:5000/${product.images[0]}` : "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={stockStatus.variant} className="text-xs">
                              <StockIcon className="h-3 w-3 ml-1" />
                              {stockStatus.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              المخزون: {product.stock} قطعة
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left flex items-center gap-4">
                        <div>
                          <p className="font-bold text-primary text-lg">{product.price.toLocaleString()} ج.م</p>
                          <p className="text-xs text-muted-foreground">{product.carType || 'عام'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditProduct(product)}
                            disabled={updatingProductId === product._id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InventoryManagement;