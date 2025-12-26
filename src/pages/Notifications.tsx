import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useNotifications } from "@/contexts/WebSocketNotificationContext";
import { useAuth } from "@/contexts/SimpleAuthContext";

import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_accepted':
      case 'booking_completed':
      case 'order_status_update':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'booking_request':
      case 'product_order':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'booking_status_update':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'booking_accepted':
        return <Badge variant="default" className="bg-green-500">مقبول</Badge>;
      case 'booking_completed':
        return <Badge variant="default" className="bg-green-500">مكتمل</Badge>;
      case 'booking_request':
        return <Badge variant="secondary">طلب جديد</Badge>;
      case 'product_order':
        return <Badge variant="secondary">طلب منتج</Badge>;
      case 'order_status_update':
        return <Badge variant="default" className="bg-blue-500">تحديث طلب</Badge>;
      case 'booking_status_update':
        return <Badge variant="outline">تحديث حجز</Badge>;
      default:
        return <Badge variant="outline">إشعار</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read first
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Smart Navigation Logic
    switch (notification.type) {
      case 'new_message':
        // If we have chatRoomId, navigate to specific chat, otherwise just chat list
        if (notification.bookingId || notification.data?.chatRoomId) {
          // Logic to find chat room or just go to main chat page
          navigate('/chat');
        } else {
          navigate('/chat');
        }
        break;

      case 'booking_request':
      case 'booking_status_update':
      case 'booking_accepted':
      case 'booking_completed':
        // Navigate to profile bookings tab
        if (user?.role === 'mechanic') {
          navigate('/profile/mechanic?tab=bookings');
        } else {
          navigate('/profile/client?tab=bookings');
        }
        break;

      case 'order_status_update':
        // Distinguish between Store Orders and Booking Payments
        // Booking payments have a bookingId in data or top level
        if (notification.bookingId || notification.data?.bookingId || notification.message.includes('دفعة')) {
          // It's a payment for a service -> Go to Mechanic Profile (Earnings/Financials)
          navigate('/profile/mechanic');
        } else {
          // It's a store order -> Go to Store
          navigate('/store');
        }
        break;

      default:
        // Do nothing specific, just stay on page
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12 animate-bounce-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent pb-4">الإشعارات</h1>
            <p className="text-muted-foreground text-xl">
              تابع آخر التحديثات على طلباتك وخدماتك
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-10 animate-fade-in">
            <div className="text-lg text-muted-foreground font-medium">
              {notifications.length} إشعار • {unreadCount} غير مقروء
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-4">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={markAllAsRead}
                    className="rounded-full px-6 py-3 hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
                  >
                    <Check className="h-5 w-5 ml-2" />
                    تحديد الكل كمقروء
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={clearNotifications}
                  className="rounded-full px-6 py-3 hover-lift transition-all duration-300 hover:border-destructive hover:bg-destructive/5"
                >
                  <X className="h-5 w-5 ml-2" />
                  مسح الكل
                </Button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-6">
            {notifications.length === 0 ? (
              <Card className="p-16 text-center animate-fade-in shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                <Bell className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">لا توجد إشعارات</h3>
                <p className="text-muted-foreground text-lg">
                  ستظهر هنا إشعارات التحديثات على طلباتك
                </p>
              </Card>
            ) : (
              notifications.map((notification, index) => (
                <Card
                  key={notification.id}
                  className={`p-8 transition-all duration-300 hover-lift hover:shadow-xl animate-slide-up shadow-lg border-border/50 bg-card/90 dark:bg-gray-900/90 ${!notification.read ? 'border-primary/50 bg-gradient-to-r from-primary/5 to-orange-500/5 dark:from-primary/10 dark:to-orange-500/10' : ''
                    } transition-colors cursor-pointer`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 text-right">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getNotificationBadge(notification.type)}
                          {!notification.read && (
                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <p className="text-base text-muted-foreground font-medium">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      <h4 className="font-bold text-lg mb-4 leading-relaxed">{notification.message}</h4>

                      <div className="flex items-center justify-between">
                        {notification.serviceType && (
                          <div className="text-base text-muted-foreground font-medium">
                            خدمة: {notification.serviceType}
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            markAsRead(notification.id);
                          }}
                          className="rounded-full px-6 py-2 hover-lift transition-all duration-300 hover:border-primary hover:bg-primary/5"
                        >
                          <Check className="h-5 w-5 ml-2" />
                          تم القراءة
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Info Card */}
          <Card className="p-10 mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/50 animate-slide-up shadow-xl transition-colors duration-300" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-start gap-6">
              <AlertCircle className="h-8 w-8 text-blue-600 mt-1" />
              <div className="text-right flex-1">
                <h4 className="font-bold text-blue-900 mb-4 text-xl">كيف تعمل الإشعارات؟</h4>
                <ul className="text-base text-blue-800 space-y-3 leading-relaxed">
                  <li>• تتلقى إشعاراً فورياً عند قبول أو رفض طلبك</li>
                  <li>• يتم إشعارك عند بدء تنفيذ الخدمة</li>
                  <li>• تتلقى تحديثاً عند اكتمال الخدمة</li>
                  <li>• الإشعارات تظهر في الوقت الفعلي كل ثانيتين</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;