import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, UserCheck, Wrench, Building2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const UserProfileButton = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const getProfileIcon = () => {
    switch (user.role) {
      case 'client':
        return <User className="h-5 w-5" />;
      case 'mechanic':
        return <Wrench className="h-5 w-5" />;
      case 'workshop':
        return <Building2 className="h-5 w-5" />;
      case 'admin':
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getProfileLabel = () => {
    switch (user.role) {
      case 'client':
        return 'حسابي';
      case 'mechanic':
        return 'لوحة التحكم';
      case 'workshop':
        return 'إدارة الورشة';
      case 'admin':
        return 'لوحة المدير';
      default:
        return 'حسابي';
    }
  };

  const getProfileRoute = () => {
    switch (user.role) {
      case 'client':
        return '/profile/client';
      case 'mechanic':
        return '/profile/mechanic';
      case 'workshop':
        return '/profile/workshop';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/profile/client';
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
        >
          {getProfileIcon()}
          <span className="mr-2 hidden sm:inline">{getProfileLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-right">
          مرحباً، {user.name}
        </div>
        <div className="px-2 py-1.5 text-xs text-muted-foreground text-right">
          {user.role === 'client' && 'عميل'}
          {user.role === 'mechanic' && 'ميكانيكي'}
          {user.role === 'workshop' && 'مركز صيانة'}
          {user.role === 'admin' && 'مدير النظام'}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate(getProfileRoute())}
          className="text-right cursor-pointer"
        >
          {getProfileIcon()}
          <span className="mr-2">{getProfileLabel()}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/profile/client/edit")}
          className="text-right cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span className="mr-2">إعدادات الحساب</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-right cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="mr-2">تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};