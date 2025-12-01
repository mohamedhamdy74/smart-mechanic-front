import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { UserProfileButton } from "./UserProfileButton";
import { Menu, X, ShoppingCart, Bell, Navigation as NavigationIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import logoIcon from "@/assets/logo-icon.png";

export const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  // Hide navigation on auth pages
  if (location.pathname === '/auth') {
    return null;
  }

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const items = JSON.parse(cart);
        const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartItemCount(count);
      } else {
        setCartItemCount(0);
      }
    };

    updateCartCount();

    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);

    // Custom event for cart updates
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Update notification count
  useEffect(() => {
    const updateNotificationCount = async () => {
      if (!user) {
        setNotificationCount(0);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/notifications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const unreadCount = data.notifications.filter((n: any) => !n.read).length;
          setNotificationCount(unreadCount);
        } else {
          setNotificationCount(0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationCount(0);
      }
    };

    updateNotificationCount();

    // Listen for new notifications
    const handleNewNotification = (event: CustomEvent) => {
      console.log('New notification received:', event.detail);
      updateNotificationCount();
    };

    window.addEventListener('newNotification', handleNewNotification as EventListener);

    // Update notification count periodically for real-time updates
    const interval = setInterval(updateNotificationCount, 30000); // Update every 30 seconds

    return () => {
      window.removeEventListener('newNotification', handleNewNotification as EventListener);
      clearInterval(interval);
    };
  }, [user]);

  // Filter navigation links based on user role
  const getNavLinks = () => {
    const baseLinks = [
      { href: "/", label: "الرئيسية" },
      { href: "/services", label: "خدماتنا" },
      { href: "/store", label: "المتجر" },
    ];

    if (!user) {
      // For non-authenticated users, show all links
      return [
        ...baseLinks,
        { href: "/mechanics", label: "الميكانيكيين" },
        { href: "/ai-diagnosis", label: "التشخيص الذكي" },
      ];
    }

    // For authenticated users, filter based on role
    switch (user.role) {
      case 'client':
        return [
          ...baseLinks,
          { href: "/mechanics", label: "الميكانيكيين" },
          { href: "/mechanic-tracker", label: "تتبع الميكانيكي" },
          { href: "/ai-diagnosis", label: "التشخيص الذكي" },
        ];
      case 'mechanic':
        return [
          ...baseLinks,
          // No services page for mechanics
        ];
      case 'workshop':
        return [
          ...baseLinks,
          { href: "/order-management", label: "إدارة الطلبات" },
          { href: "/reports", label: "التقارير" },
          { href: "/ai-diagnosis", label: "التشخيص الذكي" },
        ];
      case 'admin':
        return baseLinks; // Admin only sees basic links
      default:
        return baseLinks;
    }
  };

  const navLinks = getNavLinks();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Cart, Notifications and Auth buttons */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                {/* Removed notification badge from navigation */}
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-full hover:bg-primary/10 relative"
                >
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </>
            )}
            {user ? (
              <UserProfileButton />
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-full hover:bg-primary/10"
                >
                  <Link to="/auth?mode=register">التسجيل</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  <Link to="/auth?mode=login">الدخول</Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary relative ${
                  isActive(link.href) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover-lift">
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold text-primary">SMART</span>
              <span className="text-xl font-bold text-foreground">MECHANIC</span>
            </div>
            <img src={logoIcon} alt="Smart Mechanic" className="h-12 w-12" />
          </Link>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors ${
                  isActive(link.href) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
