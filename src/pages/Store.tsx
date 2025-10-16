import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Filter, Plus, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import engineOilImg from "@/assets/products/engine-oil.jpg";
import airFilterImg from "@/assets/products/air-filter.jpg";
import batteryImg from "@/assets/products/battery.jpg";
import tireImg from "@/assets/products/tire.jpg";

const products = [
  {
    name: "زيت محرك أصلي 5W-30",
    price: 150,
    category: "زيوت",
    carType: "سيدان",
    description: "زيت محرك أصلي عالي الجودة مناسب لجميع أنواع السيارات الحديثة. يوفر حماية ممتازة للمحرك ويحسن الأداء.",
    image: engineOilImg
  },
  {
    name: "بطارية سيارة 70 أمبير",
    price: 450,
    category: "بطاريات",
    carType: "SUV",
    description: "بطارية قوية بقوة 70 أمبير مثالية للسيارات الكبيرة والـ SUV. تدوم لفترة طويلة وتوفر بدء سريع.",
    image: batteryImg
  },
  {
    name: "فلتر هواء احترافي",
    price: 80,
    category: "فلاتر",
    carType: "سيدان",
    description: "فلتر هواء عالي الكفاءة يمنع دخول الغبار والشوائب إلى المحرك، مما يحسن الأداء ويوفر الوقود.",
    image: airFilterImg
  },
  {
    name: "إطار 195/65 R15",
    price: 600,
    category: "إطارات",
    carType: "سيدان",
    description: "إطار عالي الجودة مناسب للسيارات السيدان. يوفر قبضة ممتازة على الطرق المختلفة ويقلل من الضوضاء.",
    image: tireImg
  },
  {
    name: "زيت محرك صناعي",
    price: 180,
    category: "زيوت",
    carType: "شاحنة",
    description: "زيت محرك صناعي قوي مناسب للشاحنات والمركبات التجارية. يتحمل الظروف القاسية والحمل الثقيل.",
    image: engineOilImg
  },
  {
    name: "فلتر زيت أصلي",
    price: 75,
    category: "فلاتر",
    carType: "SUV",
    description: "فلتر زيت أصلي يضمن تنقية مثالية للزيت ويحمي المحرك من التآكل والترسبات.",
    image: airFilterImg
  },
  {
    name: "بطارية 80 أمبير",
    price: 500,
    category: "بطاريات",
    carType: "شاحنة",
    description: "بطارية قوية 80 أمبير مثالية للشاحنات والمركبات التجارية الكبيرة. تدعم الأحمال الكهربائية العالية.",
    image: batteryImg
  },
  {
    name: "إطار 205/55 R16",
    price: 650,
    category: "إطارات",
    carType: "SUV",
    description: "إطار واسع مناسب للسيارات الرياضية متعددة الاستخدامات. يوفر أداء ممتاز في الظروف المختلفة.",
    image: tireImg
  },
];

const Store = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [carTypeFilter, setCarTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [allProducts, setAllProducts] = useState(products);

  // Load cart and workshop products from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Load workshop products
    const loadWorkshopProducts = () => {
      const workshopProducts = JSON.parse(localStorage.getItem('workshopProducts') || '[]');
      const formattedWorkshopProducts = workshopProducts.map((product: any) => ({
        name: product.name,
        price: parseInt(product.price),
        category: product.category,
        carType: product.carType || "سيدان",
        description: product.description || "منتج من مركز صيانة معتمد",
        image: product.image
      }));
      setAllProducts(prev => {
        // Remove existing workshop products first, then add updated ones
        const existingProducts = prev.filter(p => !workshopProducts.some((wp: any) => wp.name === p.name));
        return [...existingProducts, ...formattedWorkshopProducts];
      });
    };

    loadWorkshopProducts();

    // Listen for workshop product updates
    const handleWorkshopProductsUpdate = () => {
      loadWorkshopProducts();
    };

    window.addEventListener('workshopProductsUpdated', handleWorkshopProductsUpdate);

    return () => {
      window.removeEventListener('workshopProductsUpdated', handleWorkshopProductsUpdate);
    };
  }, []);

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

    const existingItem = cartItems.find((item: any) => item.id === product.name);

    if (existingItem) {
      // Update quantity if item already exists
      const updatedCart = cartItems.map((item: any) =>
        item.id === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      // Add new item to cart
      const cartItem = {
        id: product.name,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: product.category,
        carType: product.carType
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

  const filteredProducts = allProducts.filter(
    (product) => {
      const matchesSearch = product.name.includes(searchTerm) ||
                           product.category.includes(searchTerm) ||
                           product.description.includes(searchTerm);
      const matchesCarType = carTypeFilter === "" || carTypeFilter === "all" || product.carType === carTypeFilter;
      const matchesCategory = categoryFilter === "" || categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCarType && matchesCategory;
    }
  );

  return (
    <div className="min-h-screen">
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

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={index}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary transition-all hover-lift hover-glow animate-slide-up"
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
                  <p className="text-sm text-muted-foreground mb-3">
                    {product.description}
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
