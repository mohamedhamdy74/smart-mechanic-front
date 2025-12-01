import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Package, Truck, CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  _id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  totalAmount: number;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
  };
  products: Array<{
    productId: {
      _id: string;
      name: string;
      brand?: string;
      category?: string;
      images?: string[];
    };
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  workshopId: string;
}

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch orders using React Query
  const { data: ordersData, isLoading, error: queryError } = useQuery({
    queryKey: ['workshop-orders', user?._id],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل الطلبات');
      }

      const data = await response.json();
      return data.orders || [];
    },
    enabled: !!user?._id,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Update local state when data changes
  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
    }
  }, [ordersData]);

  // Handle loading and error states
  useEffect(() => {
    setLoading(isLoading);
    if (queryError) {
      toast.error(queryError.message);
    }
  }, [isLoading, queryError]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`http://localhost:5000/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order =>
          order._id === orderId ? { ...order, status: updatedOrder.status } : order
        ));

        const statusMessages = {
          'confirmed': 'تم تأكيد الطلب بنجاح',
          'shipped': 'تم تحديث الطلب إلى "تم الشحن"',
          'completed': 'تم إكمال الطلب بنجاح',
          'cancelled': 'تم إلغاء الطلب'
        };

        toast.success(statusMessages[newStatus as keyof typeof statusMessages] || 'تم تحديث حالة الطلب');
      } else {
        toast.error('فشل في تحديث حالة الطلب');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('حدث خطأ أثناء تحديث الطلب');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'في الانتظار', variant: 'secondary' as const, icon: AlertTriangle },
      confirmed: { label: 'مؤكد', variant: 'default' as const, icon: Package },
      shipped: { label: 'تم الشحن', variant: 'outline' as const, icon: Truck },
      completed: { label: 'مكتمل', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'ملغي', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusActions = (order: Order) => {
    const actions = [];

    if (order.status === 'pending') {
      actions.push(
        <Button
          key="confirm"
          size="sm"
          onClick={() => updateOrderStatus(order._id, 'confirmed')}
          disabled={updatingOrderId === order._id}
          className="bg-green-600 hover:bg-green-700"
        >
          {updatingOrderId === order._id ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 ml-1" />
          )}
          تأكيد الطلب
        </Button>
      );
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="destructive"
          onClick={() => updateOrderStatus(order._id, 'cancelled')}
          disabled={updatingOrderId === order._id}
        >
          <XCircle className="h-4 w-4 ml-1" />
          رفض الطلب
        </Button>
      );
    } else if (order.status === 'confirmed') {
      actions.push(
        <Button
          key="ship"
          size="sm"
          onClick={() => updateOrderStatus(order._id, 'shipped')}
          disabled={updatingOrderId === order._id}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {updatingOrderId === order._id ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Truck className="h-4 w-4 ml-1" />
          )}
          شحن الطلب
        </Button>
      );
    } else if (order.status === 'shipped') {
      actions.push(
        <Button
          key="complete"
          size="sm"
          onClick={() => updateOrderStatus(order._id, 'completed')}
          disabled={updatingOrderId === order._id}
          className="bg-green-600 hover:bg-green-700"
        >
          {updatingOrderId === order._id ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 ml-1" />
          )}
          إكمال الطلب
        </Button>
      );
    }

    return actions;
  };

  if (loading) {
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

            {/* Orders Skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="p-6 animate-slide-up">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-16" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Skeleton className="h-4 w-12 mb-1" />
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-6 w-28" />
                        </div>
                      </div>

                      <Skeleton className="h-3 w-40 mt-2" />
                    </div>

                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              إدارة الطلبات
            </h1>
            <p className="text-muted-foreground text-lg">
              إدارة وتتبع جميع الطلبات الخاصة بمنتجات مركز الصيانة الخاص بك
            </p>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {orders.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد طلبات</h3>
                <p className="text-muted-foreground">لم يتم العثور على أي طلبات خاصة بمركز الصيانة الخاص بك</p>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order._id} className="p-6 animate-slide-up">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xl font-bold">طلب #{order._id.slice(-8)}</h3>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-muted-foreground">العميل</p>
                          <p className="font-medium">{order.customerInfo.name}</p>
                          <p className="text-muted-foreground">{order.customerInfo.phone}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-muted-foreground">العنوان</p>
                          <p className="font-medium">{order.customerInfo.address}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-muted-foreground">المبلغ الإجمالي</p>
                          <p className="font-bold text-primary text-lg">{order.totalAmount.toLocaleString()} ج.م</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="font-semibold text-muted-foreground mb-2">المنتجات ({order.products.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {order.products.map((product, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {product.productId?.name || 'منتج'} - {product.quantity} × {product.price} ج.م
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      {getStatusActions(order)}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 ml-1" />
                            عرض التفاصيل
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-right">تفاصيل الطلب #{order._id.slice(-8)}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 text-right">
                            {/* Order Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-2xl">📦</span>
                                <span className="font-bold text-blue-800">تفاصيل الطلب</span>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-blue-700">رقم الطلب: #{order._id.slice(-8).toUpperCase()}</p>
                                <p className="text-sm text-blue-700">
                                  تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                                </p>
                                <p className="text-sm text-blue-700">الحالة: {order.status === 'pending' ? 'في الانتظار' : order.status === 'confirmed' ? 'مؤكد' : order.status === 'shipped' ? 'تم الشحن' : order.status === 'completed' ? 'مكتمل' : 'ملغي'}</p>
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                              <h4 className="font-bold mb-3 text-lg">معلومات العميل</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">الاسم:</span>
                                  <span className="font-semibold">{order.customerInfo.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">الهاتف:</span>
                                  <span className="font-semibold">{order.customerInfo.phone}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">العنوان:</span>
                                  <span className="font-semibold">{order.customerInfo.address}</span>
                                </div>
                              </div>
                            </div>

                            {/* Products */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                              <h4 className="font-bold mb-3 text-lg">المنتجات المطلوبة</h4>
                              <div className="space-y-3">
                                {order.products.map((product, index) => (
                                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-semibold text-primary">{product.productId?.name || 'منتج غير محدد'}</span>
                                      <span className="text-sm text-muted-foreground">الكمية: {product.quantity}</span>
                                    </div>
                                    {product.productId?.brand && (
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-muted-foreground">الماركة:</span>
                                        <span className="font-medium">{product.productId.brand}</span>
                                      </div>
                                    )}
                                    {product.productId?.category && (
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-muted-foreground">الفئة:</span>
                                        <span className="font-medium">{product.productId.category}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">السعر:</span>
                                      <span className="font-semibold">{product.price} ج.م</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1 font-bold border-t pt-2">
                                      <span>المجموع:</span>
                                      <span>{(product.quantity * product.price).toLocaleString()} ج.م</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                              <h4 className="font-bold mb-3 text-lg text-green-800">ملخص الطلب</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-green-700">عدد المنتجات:</span>
                                  <span className="font-semibold">{order.products.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-green-700">إجمالي الكميات:</span>
                                  <span className="font-semibold">{order.products.reduce((sum, p) => sum + p.quantity, 0)}</span>
                                </div>
                                <div className="border-t border-green-300 pt-3 mt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-green-800">المبلغ الإجمالي:</span>
                                    <span className="font-bold text-xl text-green-800">{order.totalAmount.toLocaleString()} ج.م</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderManagement;