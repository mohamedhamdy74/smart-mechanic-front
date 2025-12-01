import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  carType: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast.success("تم حذف المنتج من السلة");
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    toast.success("تم مسح جميع المنتجات من السلة");
  };

  // Memoized calculations for better performance
  const totalPrice = useMemo(() =>
    cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cartItems]
  );

  const totalItems = useMemo(() =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Checkout mutation using React Query
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (cartItems.length === 0) {
        throw new Error("السلة فارغة");
      }

      if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
        throw new Error("يرجى ملء جميع البيانات المطلوبة");
      }

      if (!paymentMethod) {
        throw new Error("يرجى اختيار طريقة الدفع");
      }

      // Get workshop ID from the first product (assuming all products are from the same workshop)
      let workshopId = null;

      // Try to get workshop ID from the first product
      if (cartItems.length > 0) {
        const productResponse = await fetch(`http://127.0.0.1:5000/products/${cartItems[0].id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          cache: 'no-cache',
        });

        if (productResponse.ok) {
          const productData = await productResponse.json();
          workshopId = productData.userId; // userId is the workshop ID for products
        } else {
          console.error('Failed to fetch product:', productResponse.status, await productResponse.text());
        }
      }

      if (!workshopId) {
        throw new Error("لا يمكن تحديد مركز الصيانة لهذه المنتجات");
      }

      // Prepare order data for backend
      const orderData = {
        workshopId,
        products: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        customerInfo,
        paymentMethod
      };

      // Send order to backend
      const response = await fetch('http://127.0.0.1:5000/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        cache: 'no-cache',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في إنشاء الطلب");
      }

      const order = await response.json();

      // Note: Invoice generation removed for now as orders don't have invoice-pdf endpoint
      // TODO: Implement invoice generation for orders

      return order;
    },
    onSuccess: (order) => {
      // Clear cart
      setCartItems([]);
      localStorage.removeItem('cart');

      // Dispatch custom event to update cart count in navigation
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success("تم تأكيد الطلب بنجاح! سيتم إشعارك عند تأكيد الطلب");

      navigate("/store");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-4">السلة فارغة</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                لم تقم بإضافة أي منتجات إلى السلة بعد. ابدأ التسوق الآن!
              </p>
              <Button onClick={() => navigate("/store")} className="rounded-full">
                <Package className="h-5 w-5 ml-2" />
                تصفح المنتجات
              </Button>
            </div>
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
          <div className="text-center mb-12 animate-bounce-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent pb-4">سلة التسوق</h1>
            <p className="text-muted-foreground text-xl">
              {totalItems} منتج • إجمالي: {totalPrice} جنيه
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">المنتجات</h2>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive rounded-full px-6 py-3 hover-lift transition-all duration-300 hover:border-destructive"
                  >
                    <Trash2 className="h-5 w-5 ml-2" />
                    مسح الكل
                  </Button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-6 p-6 border border-border rounded-2xl hover-lift transition-all duration-300 hover:shadow-lg animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl shadow-md"
                      />

                      <div className="flex-1 text-right">
                        <h3 className="font-bold text-xl mb-2">{item.name}</h3>
                        <p className="text-base text-muted-foreground mb-3">
                          {item.category} • {item.carType}
                        </p>
                        <p className="font-bold text-primary text-lg">{item.price} جنيه</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-muted/50 rounded-full p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-10 w-10 p-0 rounded-full hover-lift transition-all duration-300"
                          >
                            <Minus className="h-5 w-5" />
                          </Button>

                          <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-10 w-10 p-0 rounded-full hover-lift transition-all duration-300"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full p-3 hover-lift transition-all duration-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Order Summary & Checkout */}
            <div className="space-y-8">
              {/* Order Summary */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-gradient-to-br from-primary/5 to-orange-500/5 dark:from-gray-900/50 dark:to-gray-800/30 dark:border-gray-700/50 transition-colors duration-300" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-2xl font-bold mb-6 text-right bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">ملخص الطلب</h3>
                <div className="space-y-4 text-right">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-base">عدد المنتجات:</span>
                    <span className="font-bold text-lg">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-base">إجمالي السعر:</span>
                    <span className="font-bold text-primary text-xl">{totalPrice} جنيه</span>
                  </div>
                </div>
                <Separator className="my-6" />
                <p className="text-base text-muted-foreground text-right font-medium">
                  * الأسعار شاملة الضريبة والشحن
                </p>
              </Card>

              {/* Customer Information */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300" style={{ animationDelay: "0.3s" }}>
                <h3 className="text-2xl font-bold mb-6 text-right bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">بيانات التوصيل</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-right block">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="الاسم الكامل"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-right block">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="+20xxxxxxxxxx"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder="email@example.com"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-right block">عنوان التوصيل *</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      placeholder="العنوان بالتفصيل"
                      className="text-right"
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-8 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300" style={{ animationDelay: "0.4s" }}>
                <h3 className="text-2xl font-bold mb-8 text-right bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">معلومات الدفع</h3>
                <div className="space-y-8">
                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-right">اختر طريقة الدفع</h4>
                    <div className="grid grid-cols-1 gap-3 max-w-full overflow-hidden">
                      <label className="flex items-center gap-3 p-4 border border-border rounded-xl hover:border-primary cursor-pointer transition-colors min-w-0">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="visa"
                          checked={paymentMethod === "visa"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary flex-shrink-0"
                        />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">💳</span>
                          </div>
                          <div className="text-right min-w-0 flex-1">
                            <div className="font-semibold truncate">فيزا/ماستركارد</div>
                            <div className="text-sm text-muted-foreground truncate">دفع فوري آمن</div>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-border rounded-xl hover:border-primary cursor-pointer transition-colors min-w-0">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="vodafone"
                          checked={paymentMethod === "vodafone"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary flex-shrink-0"
                        />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">📱</span>
                          </div>
                          <div className="text-right min-w-0 flex-1">
                            <div className="font-semibold truncate">فودافون كاش</div>
                            <div className="text-sm text-muted-foreground truncate">دفع عبر المحفظة</div>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-border rounded-xl hover:border-primary cursor-pointer transition-colors min-w-0">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="fawry"
                          checked={paymentMethod === "fawry"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary flex-shrink-0"
                        />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">🏪</span>
                          </div>
                          <div className="text-right min-w-0 flex-1">
                            <div className="font-semibold truncate">فوري</div>
                            <div className="text-sm text-muted-foreground truncate">دفع في أي فرع</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800/50 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-700">المجموع الفرعي:</span>
                      <span className="font-semibold text-green-800">{totalPrice} جنيه</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-700">الشحن:</span>
                      <span className="font-semibold text-green-800">مجاني</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-green-300">
                      <span className="font-bold text-green-800">الإجمالي:</span>
                      <span className="font-bold text-lg text-green-800">{totalPrice} جنيه</span>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-green-500">🔒</span>
                      <span className="font-semibold">معاملات آمنة 100%</span>
                    </div>
                    <p>جميع البيانات مشفرة ومحمية</p>
                  </div>
                </div>
              </Card>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                className="w-full rounded-full py-8 text-xl font-bold hover-lift transition-all duration-300 shadow-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 animate-slide-up disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
                style={{ animationDelay: "0.5s" }}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-6 w-6 ml-3 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-6 w-6 ml-3" />
                    تأكيد الطلب ({totalPrice} جنيه)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;