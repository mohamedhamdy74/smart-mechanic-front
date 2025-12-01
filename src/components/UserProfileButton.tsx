import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, UserCog, Wrench, Building, Shield, ChevronDown, LayoutDashboard, Bell } from "lucide-react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/WebSocketNotificationContext";

export const UserProfileButton = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  const getRoleLabel = () => {
    switch (user.role) {
      case 'admin':
        return 'مدير';
      case 'mechanic':
        return 'فني ميكانيكي';
      case 'workshop':
        return 'ورشة عمل';
      case 'client':
      default:
        return 'عميل';
    }
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin':
        return <Shield className="h-3.5 w-3.5 ml-1" />;
      case 'mechanic':
        return <Wrench className="h-3.5 w-3.5 ml-1" />;
      case 'workshop':
        return <Building className="h-3.5 w-3.5 ml-1" />;
      default:
        return <User className="h-3.5 w-3.5 ml-1" />;
    }
  };

  const getInitials = () => {
    return user?.name
      ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
      : 'U';
  };

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Notification Button - Hidden for workshop role */}
      {user.role !== 'workshop' && (
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-muted/50"
          onClick={() => navigate('/notifications')}
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full p-0 hover:bg-muted/50"
            aria-label="فتح قائمة المستخدم"
          >
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">فتح قائمة المستخدم</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 rounded-md p-2 shadow-lg border"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex flex-col space-y-0.5 text-right">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center justify-end">
            {getRoleIcon()}
            <span>{getRoleLabel()}</span>
          </div>

          <DropdownMenuSeparator className="my-2" />

          {/* <DropdownMenuItem
          onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
          className="px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50"
        >
          <LayoutDashboard className="h-4 w-4 ml-2" />
          <span>{user.role === 'admin' ? 'لوحة المدير' : 'لوحة التحكم'}</span>
        </DropdownMenuItem> */}

          <DropdownMenuItem
            onClick={() => navigate(`/profile/${user.role}`)}
            className="px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50"
          >
            <UserCog className="h-4 w-4 ml-2" />
            <span>الملف الشخصي</span>
          </DropdownMenuItem>

          {/* <DropdownMenuItem
          onClick={() => navigate(`/settings`)}
          className="px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50"
        >
          <Settings className="h-4 w-4 ml-2" />
          <span>الإعدادات</span>
        </DropdownMenuItem> */}

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="px-3 py-2 text-sm rounded-md cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 ml-2" />
            <span>تسجيل الخروج</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};