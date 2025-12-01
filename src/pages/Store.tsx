import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Filter, Plus, LogIn } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import engineOilImg from "@/assets/products/engine-oil.jpg";
import airFilterImg from "@/assets/products/air-filter.jpg";
import batteryImg from "@/assets/products/battery.jpg";
import tireImg from "@/assets/products/tire.jpg";

const staticProducts = [
  {
    id: '1',
    name: 'زيت محرك تويوتا أصلي',
    price: 150,
    category: 'زيوت',
    carType: 'تويوتا',
    description: 'زيت محرك أصلي لسيارات تويوتا، مضمون الجودة',
    image: engineOilImg,
    stock: 50,
    inStock: true,
    brand: 'تويوتا'
  },
  {
    id: '2',
    name: 'فلتر هواء أصلي',
    price: 80,
    category: 'فلاتر',
    carType: 'عام',
    description: 'فلتر هواء عالي الكفاءة لجميع أنواع السيارات',
    image: airFilterImg,
    stock: 30,
    inStock: true,
    brand: 'مرسيدس'
  },
  {
    id: '3',
    name: 'بطارية سيارة 12 فولت',
    price: 450,
    category: 'بطاريات',
    carType: 'عام',
    description: 'بطارية سيارة قوية وعالية السعة',
    image: batteryImg,
    stock: 15,
    inStock: true,
    brand: 'فارتا'
  },
  {
    id: '4',
    name: 'إطار سيارة 205/55R16',
    price: 350,
    category: 'إطارات',
    carType: 'عام',
    description: 'إطار سيارة عالي الجودة مقاوم للانزلاق',
    image: tireImg,
    stock: 20,
    inStock: true,
    brand: 'ميشلان'
  }
];

const Store = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [carTypeFilter, setCarTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 12; // Show 12 products per page (3 rows of 4)

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Fetch products using React Query for better caching and performance
  const { data: productsResponse, isLoading, error: queryError } = useQuery({
    queryKey: ['products', currentPage, productsPerPage],
    queryFn: async () => {
      // GET products doesn't require authentication
      const response = await fetch(`http://localhost:5000/products?page=${currentPage}&limit=${productsPerPage}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل المنتجات');
      }

      const data = await response.json();
      const formattedProducts = data.products.map((product: any) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category || 'غير مصنف',
        carType: 'عام', // Default car type
        description: product.description || 'منتج من مركز صيانة معتمد',
        image: product.images && product.images.length > 0
          ? `http://localhost:5000/${product.images[0]}`
          : engineOilImg, // Fallback image
        stock: product.stock,
        inStock: product.inStock,
        brand: product.brand,
        workshopName: product.userId?.workshopName || product.userId?.name || 'مركز صيانة'
      }));

      return {
        products: formattedProducts,
        total: data.total || 0,
        pages: data.pages || 1,
        page: data.page || 1
      };
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Update local state when data changes
  const allProducts = productsResponse?.products || [];
  const loading = isLoading;

  useEffect(() => {
    if (productsResponse) {
      setTotalPages(productsResponse.pages);
    }
  }, [productsResponse]);

  const addToCart = (product: any) => {
    // Check if user is logged in and is a client
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً كعميل لإضافة منتجات للسلة");
      navigate('/auth?mode=login');
      return;
    }

    if (user.role !== 'client') {
      toast.error("هذه الخدمة متاحة للعملاء فقط");
      return;
    }

    // Check stock availability
    if (!product.inStock || product.stock <= 0) {
      toast.error('هذا المنتج غير متوفر حالياً');
      return;
    }

    const existingItem = cartItems.find((item: any) => item.id === product.id);

    if (existingItem) {
      // Check if adding more would exceed stock
      if (existingItem.quantity >= product.stock) {
        toast.error('لا يمكن إضافة المزيد من هذا المنتج - الكمية محدودة');
        return;
      }
      // Update quantity if item already exists
      const updatedCart = cartItems.map((item: any) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      // Add new item to cart
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: product.category,
        carType: product.carType,
        stock: product.stock
      };
      const updatedCart = [...cartItems, cartItem];
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }

    toast.success("تم إضافة المنتج إلى السلة!");

    // Dispatch custom event to update cart count in navigation
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const cartItemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCarType = carTypeFilter === "" || carTypeFilter === "all" || product.carType === carTypeFilter;
      const matchesCategory = categoryFilter === "" || categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCarType && matchesCategory;
    });
  }, [allProducts, searchTerm, carTypeFilter, categoryFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              متجر قطع غيار السيارات
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              اطلب قطع الغيار الأصلية والمضمونة بأفضل الأسعار
            </p>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث عن قطع غيار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12 rounded-full h-12"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">تصفية:</span>
                </div>
                <Select value={carTypeFilter} onValueChange={setCarTypeFilter}>
                  <SelectTrigger className="w-40 rounded-full">
                    <SelectValue placeholder="نوع السيارة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="سيدان">سيدان</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="شاحنة">شاحنة</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 rounded-full">
                    <SelectValue placeholder="فئة المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="زيوت">زيوت</SelectItem>
                    <SelectItem value="فلاتر">فلاتر</SelectItem>
                    <SelectItem value="بطاريات">بطاريات</SelectItem>
                    <SelectItem value="إطارات">إطارات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-card/90 dark:bg-gray-900/90 rounded-2xl p-6 border border-border/50">
                  <div className="bg-muted/50 rounded-xl h-48 mb-4 overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="text-right mb-4">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-24 mb-3" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-card/90 dark:bg-gray-900/90 rounded-2xl p-6 border border-border/50 dark:border-gray-700/50 hover:border-primary transition-all hover-lift hover-glow animate-slide-up transition-colors duration-300"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {/* Product image */}
                  <div className="bg-muted/50 rounded-xl h-48 mb-4 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="text-right mb-4">
                    <div className="text-xs text-muted-foreground mb-1">
                      {product.category} • {product.carType}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.description}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mb-3">
                      من: {product.workshopName}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">جنيه</span>
                      <span className="text-2xl font-bold text-primary">
                        {product.price}
                      </span>
                    </div>
                  </div>

                  {user && user.role === 'client' ? (
                    <Button
                      onClick={() => addToCart(product)}
                      className="w-full rounded-full bg-primary hover:bg-primary-hover"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      أضف للسلة
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/auth?mode=login')}
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      <LogIn className="h-4 w-4 ml-2" />
                      تسجيل الدخول للشراء
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-12">
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                لم يتم العثور على منتجات
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Store;
