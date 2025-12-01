import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { api } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Building2,
  Package,
  ShoppingCart,
  Star,
  Bell,
  BarChart3,
  Settings,
  Shield,
  Search,
  Filter,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Crown,
  Rocket,
  Target,
  Award,
  Gauge,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Flame,
  Heart,
  Globe,
  Car,
  WrenchIcon,
  UserPlus,
} from "lucide-react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { AddEditUserDialog } from "@/components/admin/AddEditUserDialog";
import { AddEditMechanicDialog } from "@/components/admin/AddEditMechanicDialog";
import { AddEditShopDialog } from "@/components/admin/AddEditShopDialog";
import { AddEditProductDialog } from "@/components/admin/AddEditProductDialog";
import logoIcon from "@/assets/logo-icon.png";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const queryClient = useQueryClient();

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mechanicDialogOpen, setMechanicDialogOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [shopDialogOpen, setShopDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Simple animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Fetch system stats with real data
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await adminApi.getStats();
      return response;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch analytics data with real backend data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["admin-analytics", "30d"],
    queryFn: async () => {
      const response = await adminApi.getAnalytics({ period: "30d" });
      return response;
    },
    staleTime: 60000,
    refetchInterval: 300000,
  });

  // Enhanced data fetching for users
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["admin-users", { search: searchTerm, role: selectedRole }],
    queryFn: async () => {
      const response = await adminApi.getUsers({
        search: searchTerm || undefined,
        role: selectedRole !== "all" ? selectedRole : undefined,
        limit: 20,
      });
      return response;
    },
  });

  // Enhanced data fetching for mechanics
  const {
    data: mechanicsData,
    isLoading: mechanicsLoading,
    refetch: refetchMechanics,
  } = useQuery({
    queryKey: ["admin-mechanics", { search: searchTerm }],
    queryFn: async () => {
      const response = await adminApi.getMechanics({
        search: searchTerm || undefined,
        limit: 20,
      });
      return response;
    },
  });

  // Enhanced data fetching for shops
  const {
    data: shopsData,
    isLoading: shopsLoading,
    refetch: refetchShops,
  } = useQuery({
    queryKey: ["admin-shops", { search: searchTerm }],
    queryFn: async () => {
      const response = await adminApi.getShops({
        search: searchTerm || undefined,
        limit: 20,
      });
      return response;
    },
  });

  // Enhanced data fetching for products
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["admin-products", { search: searchTerm }],
    queryFn: async () => {
      const response = await adminApi.getProducts({
        search: searchTerm || undefined,
        limit: 20,
      });
      return response;
    },
  });

  // Enhanced data fetching for notifications
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: [
      "admin-notifications",
      {
        isRead:
          selectedStatus === "all" ? undefined : selectedStatus === "read",
      },
    ],
    queryFn: async () => {
      const response = await adminApi.getNotifications({
        isRead:
          selectedStatus === "all" ? undefined : selectedStatus === "read",
        limit: 20,
      });
      return response;
    },
  });

  // Enhanced data fetching for orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["admin-orders", { search: searchTerm }],
    queryFn: async () => {
      const response = await adminApi.getOrders({
        search: searchTerm || undefined,
        limit: 20,
      });
      return response;
    },
  });

  // Enhanced data fetching for appointments
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ["admin-appointments", { search: searchTerm }],
    queryFn: async () => {
      const response = await adminApi.getAppointments({
        search: searchTerm || undefined,
        limit: 20,
      });
      return response;
    },
  });

  // Enhanced data fetching for reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["admin-reviews", { search: searchTerm }],
    queryFn: async () => {
      const response = await adminApi.getReviews({
        search: searchTerm || undefined,
        limit: 20,
      });
      return response;
    },
  });

  // Enhanced mutations for user actions
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) => {
      const response = await adminApi.updateUserStatus(userId, isActive);
      return response;
    },
    onSuccess: () => {
      toast.success("✅ تم تحديث حالة المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في تحديث حالة المستخدم");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await adminApi.deleteUser(userId);
      return response;
    },
    onSuccess: () => {
      toast.success("✅ تم حذف المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في حذف المستخدم");
    },
  });

  // Enhanced mutations for notification actions
  const toggleNotificationStatusMutation = useMutation({
    mutationFn: async ({
      notificationId,
      isRead,
    }: {
      notificationId: string;
      isRead: boolean;
    }) => {
      const response = await adminApi.updateNotificationStatus(
        notificationId,
        isRead
      );
      return response;
    },
    onSuccess: () => {
      toast.success("✅ تم تحديث حالة الإشعار بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: () => {
      toast.error("❌ فشل في تحديث حالة الإشعار");
    },
  });

  // Enhanced mutations for CRUD operations
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.role === "client") {
        return await adminApi.registerClient(data);
      } else if (data.role === "mechanic") {
        return await adminApi.registerMechanic(data);
      } else if (data.role === "workshop") {
        return await adminApi.registerWorkshop(data);
      }
    },
    onSuccess: () => {
      toast.success("✅ تم إضافة المستخدم بنجاح");
      setUserDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في إضافة المستخدم");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      return await adminApi.updateUser(userId, data);
    },
    onSuccess: () => {
      toast.success("✅ تم تحديث المستخدم بنجاح");
      setUserDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في تحديث المستخدم");
    },
  });

  const createMechanicMutation = useMutation({
    mutationFn: async (data: any) => {
      return await adminApi.registerMechanic(data);
    },
    onSuccess: () => {
      toast.success("✅ تم إضافة الميكانيكي بنجاح");
      setMechanicDialogOpen(false);
      setSelectedMechanic(null);
      queryClient.invalidateQueries({ queryKey: ["admin-mechanics"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في إضافة الميكانيكي");
    },
  });

  const updateMechanicMutation = useMutation({
    mutationFn: async ({
      mechanicId,
      data,
    }: {
      mechanicId: string;
      data: any;
    }) => {
      return await adminApi.updateMechanic(mechanicId, data);
    },
    onSuccess: () => {
      toast.success("✅ تم تحديث الميكانيكي بنجاح");
      setMechanicDialogOpen(false);
      setSelectedMechanic(null);
      queryClient.invalidateQueries({ queryKey: ["admin-mechanics"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في تحديث الميكانيكي");
    },
  });

  const createShopMutation = useMutation({
    mutationFn: async (data: any) => {
      return await adminApi.registerWorkshop(data);
    },
    onSuccess: () => {
      toast.success("✅ تم إضافة مركز الخدمة بنجاح");
      setShopDialogOpen(false);
      setSelectedShop(null);
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في إضافة مركز الخدمة");
    },
  });

  const updateShopMutation = useMutation({
    mutationFn: async ({ shopId, data }: { shopId: string; data: any }) => {
      return await adminApi.updateShop(shopId, data);
    },
    onSuccess: () => {
      toast.success("✅ تم تحديث مركز الخدمة بنجاح");
      setShopDialogOpen(false);
      setSelectedShop(null);
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في تحديث مركز الخدمة");
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post("/products", data);
    },
    onSuccess: () => {
      toast.success("✅ تم إضافة المنتج بنجاح");
      setProductDialogOpen(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => {
      toast.error("❌ فشل في إضافة المنتج");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: any;
    }) => {
      return await adminApi.updateProduct(productId, data);
    },
    onSuccess: () => {
      toast.success("✅ تم تحديث المنتج بنجاح");
      setProductDialogOpen(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => {
      toast.error("❌ فشل في تحديث المنتج");
    },
  });

  // Enhanced refresh function
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchAnalytics(),
        refetchUsers(),
        refetchMechanics(),
        refetchShops(),
        refetchProducts(),
        refetchNotifications(),
      ]);
      toast.success("🔄 تم تحديث جميع البيانات بنجاح");
    } catch (error) {
      toast.error("❌ فشل في تحديث بعض البيانات");
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleToggleNotificationStatus = (
    notificationId: string,
    currentStatus: boolean
  ) => {
    toggleNotificationStatusMutation.mutate({
      notificationId,
      isRead: !currentStatus,
    });
  };

  // Dialog management functions
  const handleSaveUser = (data: any) => {
    if (selectedUser) {
      updateUserMutation.mutate({ userId: selectedUser._id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleSaveMechanic = (data: any) => {
    if (selectedMechanic) {
      updateMechanicMutation.mutate({ mechanicId: selectedMechanic._id, data });
    } else {
      createMechanicMutation.mutate(data);
    }
  };

  const handleSaveShop = (data: any) => {
    if (selectedShop) {
      updateShopMutation.mutate({ shopId: selectedShop._id, data });
    } else {
      createShopMutation.mutate(data);
    }
  };

  const handleSaveProduct = (data: any) => {
    if (selectedProduct) {
      updateProductMutation.mutate({ productId: selectedProduct._id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const openUserDialog = (user?: any) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const openMechanicDialog = (mechanic?: any) => {
    setSelectedMechanic(mechanic);
    setMechanicDialogOpen(true);
  };

  const openShopDialog = (shop?: any) => {
    setSelectedShop(shop);
    setShopDialogOpen(true);
  };

  const openProductDialog = (product?: any) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const closeAllDialogs = () => {
    setUserDialogOpen(false);
    setMechanicDialogOpen(false);
    setShopDialogOpen(false);
    setProductDialogOpen(false);
    setSelectedUser(null);
    setSelectedMechanic(null);
    setSelectedShop(null);
    setSelectedProduct(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: "default" as const,
        label: "نشط",
        icon: UserCheck,
        color: "bg-green-500",
      },
      inactive: {
        variant: "secondary" as const,
        label: "غير نشط",
        icon: UserX,
        color: "bg-gray-500",
      },
      pending: {
        variant: "outline" as const,
        label: "في الانتظار",
        icon: Clock,
        color: "bg-yellow-500",
      },
      completed: {
        variant: "default" as const,
        label: "مكتمل",
        icon: CheckCircle,
        color: "bg-blue-500",
      },
      cancelled: {
        variant: "destructive" as const,
        label: "ملغي",
        icon: XCircle,
        color: "bg-red-500",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-1 ${config.color} text-white hover:opacity-80 transition-opacity`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      client: {
        variant: "outline" as const,
        label: "عميل",
        color: "text-blue-600",
        icon: Users,
      },
      mechanic: {
        variant: "outline" as const,
        label: "ميكانيكي",
        color: "text-green-600",
        icon: Wrench,
      },
      workshop: {
        variant: "outline" as const,
        label: "مركز خدمة",
        color: "text-orange-600",
        icon: Building2,
      },
      admin: {
        variant: "default" as const,
        label: "مدير",
        color: "text-purple-600",
        icon: Shield,
      },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.client;
    const Icon = config.icon;
    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-1 ${config.color} hover:opacity-80 transition-opacity`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Enhanced chart data preparation with real data
  const typedAnalytics = analyticsData as any;
  const typedUsersData = usersData as any;
  const typedMechanicsData = mechanicsData as any;
  const typedShopsData = shopsData as any;
  const typedProductsData = productsData as any;
  const typedNotificationsData = notificationsData as any;
  const typedOrdersData = ordersData as any;
  const typedReviewsData = reviewsData as any;

  const salesChartData = {
    labels: typedAnalytics?.sales?.map((item: any) => item._id) || [],
    datasets: [
      {
        label: "الإيرادات (ج.م)",
        data: typedAnalytics?.sales?.map((item: any) => item.revenue) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const bookingsChartData = {
    labels: typedAnalytics?.bookings?.map((item: any) => item._id) || [],
    datasets: [
      {
        label: "المواعيد",
        data: typedAnalytics?.bookings?.map((item: any) => item.bookings) || [],
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: "المكتملة",
        data:
          typedAnalytics?.bookings?.map((item: any) => item.completed) || [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const ratingsChartData = {
    labels:
      typedAnalytics?.ratings?.map((item: any) => `${item._id} نجوم`) || [],
    datasets: [
      {
        data: typedAnalytics?.ratings?.map((item: any) => item.count) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(54, 162, 235, 0.8)",
        ],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const userGrowthChartData = {
    labels: typedAnalytics?.userGrowth?.map((item: any) => item._id) || [],
    datasets: [
      {
        label: "عملاء جدد",
        data:
          typedAnalytics?.userGrowth?.map((item: any) => item.clients) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "ميكانيكيين جدد",
        data:
          typedAnalytics?.userGrowth?.map((item: any) => item.mechanics) || [],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "مراكز جديدة",
        data:
          typedAnalytics?.userGrowth?.map((item: any) => item.workshops) || [],
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "bold" as const,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "rgba(0, 0, 0, 0.6)",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "rgba(0, 0, 0, 0.6)",
        },
      },
    },
  };

  const navigationItems = [
    {
      id: "overview",
      label: "نظرة عامة",
      icon: LayoutDashboard,
      color: "from-blue-500 to-blue-600",
      description: "نظرة شاملة على النظام",
    },
    {
      id: "users",
      label: "إدارة المستخدمين",
      icon: Users,
      color: "from-green-500 to-green-600",
      description: "إدارة العملاء والمستخدمين",
    },
    {
      id: "mechanics",
      label: "إدارة الميكانيكيين",
      icon: Wrench,
      color: "from-orange-500 to-orange-600",
      description: "إدارة الميكانيكيين المتخصصين",
    },
    {
      id: "shops",
      label: "إدارة المراكز",
      icon: Building2,
      color: "from-purple-500 to-purple-600",
      description: "إدارة مراكز الصيانة",
    },
    {
      id: "products",
      label: "إدارة المنتجات",
      icon: Package,
      color: "from-pink-500 to-pink-600",
      description: "إدارة قطع الغيار والمتجر",
    },
    {
      id: "orders",
      label: "إدارة الطلبات",
      icon: ShoppingCart,
      color: "from-indigo-500 to-indigo-600",
      description: "تتبع وإدارة الطلبات",
    },
    {
      id: "analytics",
      label: "التحليلات المتقدمة",
      icon: BarChart3,
      color: "from-cyan-500 to-cyan-600",
      description: "تحليلات وأحصائيات مفصلة",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900"
      dir="rtl"
    >
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-800 to-orange-600 dark:from-orange-200 dark:to-orange-400 bg-clip-text text-transparent">
                  لوحة تحكم مدير SMART MECHANICH
                </h1>
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              ></motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={logoIcon}
                  alt="Smart Mechanic"
                  className="h-20 w-20"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Navigation */}
          <div
            className={`lg:col-span-1 transition-all duration-300 ${sidebarCollapsed ? "lg:w-16" : "lg:w-72"
              }`}
          >
            <Card className="sticky top-24 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  {!sidebarCollapsed && "القوائم"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-2 px-4 pb-4">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          key={item.id}
                          variant={activeTab === item.id ? "default" : "ghost"}
                          className={`w-full justify-start text-right h-12 transition-all duration-300 group ${activeTab === item.id
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg hover:shadow-xl`
                            : "hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105"
                            }`}
                          onClick={() => setActiveTab(item.id)}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <Icon
                            className={`h-5 w-5 transition-transform duration-300 ${activeTab === item.id
                              ? "scale-110"
                              : "group-hover:scale-110"
                              }`}
                          />
                          {!sidebarCollapsed && (
                            <div className="flex flex-col items-start mr-3">
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                              {!sidebarCollapsed && (
                                <span className="text-xs opacity-70">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.3 }}
              >
                {/* Enhanced Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Enhanced Stats Cards */}
                    {stats && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div variants={fadeInUp}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl group">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-blue-100 text-sm font-medium">
                                      إجمالي المستخدمين
                                    </p>
                                    <motion.p
                                      className="text-4xl font-bold"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        delay: 0.3,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                      }}
                                    >
                                      {stats.users.total}
                                    </motion.p>
                                  </div>
                                  <div className="p-3 bg-white/20 rounded-xl">
                                    <Users className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                <div className="mt-4 text-sm">
                                  <span className="text-blue-100">
                                    {stats.users.mechanics} ميكانيكي •{" "}
                                    {stats.users.workshops} مركز
                                  </span>
                                </div>
                                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl group">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-green-100 text-sm font-medium">
                                      الطلبات
                                    </p>
                                    <motion.p
                                      className="text-4xl font-bold"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        delay: 0.5,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                      }}
                                    >
                                      {stats.orders.total}
                                    </motion.p>
                                  </div>
                                  <div className="p-3 bg-white/20 rounded-xl">
                                    <ShoppingCart className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                <div className="mt-4 text-sm">
                                  <span className="text-green-100">
                                    إجمالي الطلبات المسجلة
                                  </span>
                                </div>
                                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl group">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-purple-100 text-sm font-medium">
                                      المواعيد
                                    </p>
                                    <motion.p
                                      className="text-4xl font-bold"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        delay: 0.7,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                      }}
                                    >
                                      {stats.bookings.total}
                                    </motion.p>
                                  </div>
                                  <div className="p-3 bg-white/20 rounded-xl">
                                    <Calendar className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                <div className="mt-4 text-sm">
                                  <span className="text-purple-100">
                                    إجمالي المواعيد المحجوزة
                                  </span>
                                </div>
                                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl group">
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-orange-100 text-sm font-medium">
                                      الإيرادات الشهرية
                                    </p>
                                    <motion.p
                                      className="text-4xl font-bold"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        delay: 0.9,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                      }}
                                    >
                                      {stats.revenue.total.toLocaleString()}
                                    </motion.p>
                                  </div>
                                  <div className="p-3 bg-white/20 rounded-xl">
                                    <DollarSign className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                <div className="mt-4 text-sm">
                                  <span className="text-orange-100">ج.م</span>
                                </div>
                                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>
                      </div>
                    )}

                    {/* Enhanced Quick Actions */}
                    <motion.div variants={fadeInUp}>
                      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            إجراءات سريعة
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              {
                                icon: Users,
                                label: "إدارة المستخدمين",
                                action: () => setActiveTab("users"),
                                color: "from-blue-500 to-blue-600",
                                stats: `${stats?.users?.total || 0} مستخدم`,
                              },
                              {
                                icon: ShoppingCart,
                                label: "إدارة الطلبات",
                                action: () => setActiveTab("orders"),
                                color: "from-green-500 to-green-600",
                                stats: `${stats?.orders?.total || 0} طلب`,
                              },
                              {
                                icon: Star,
                                label: "إدارة التقييمات",
                                action: () => setActiveTab("reviews"),
                                color: "from-yellow-500 to-yellow-600",
                                stats: `${(reviewsData as any)?.reviews?.length || 0
                                  } تقييم`,
                              },
                              {
                                icon: BarChart3,
                                label: "التحليلات المتقدمة",
                                action: () => setActiveTab("analytics"),
                                color: "from-purple-500 to-purple-600",
                                stats: "عرض مفصل",
                              },
                            ].map((item, index) => {
                              const Icon = item.icon;
                              return (
                                <motion.div
                                  key={item.label}
                                  whileHover={{ scale: 1.05, rotateY: 5 }}
                                  whileTap={{ scale: 0.95 }}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <Button
                                    variant="outline"
                                    className={`h-32 flex flex-col gap-3 bg-gradient-to-br ${item.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
                                    onClick={item.action}
                                  >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <Icon className="h-6 w-6 relative z-10" />
                                    <span className="text-sm font-medium relative z-10">
                                      {item.label}
                                    </span>
                                    <span className="text-xs opacity-80 relative z-10">
                                      {item.stats}
                                    </span>
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full"></div>
                                  </Button>
                                </motion.div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Enhanced Charts Section */}
                    {analyticsData && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div variants={fadeInUp}>
                          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                اتجاهات الإيرادات
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-80">
                                <Line
                                  data={salesChartData}
                                  options={chartOptions}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                إحصائيات المواعيد
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-80">
                                <Bar
                                  data={bookingsChartData}
                                  options={chartOptions}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                توزيع التقييمات
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-80">
                                <Doughnut
                                  data={ratingsChartData}
                                  options={chartOptions}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                نمو المستخدمين
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-80">
                                <Line
                                  data={userGrowthChartData}
                                  options={chartOptions}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                    )}

                    {/* Enhanced Recent Activity */}
                    <motion.div variants={fadeInUp}>
                      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            آخر الأنشطة
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64">
                            <div className="space-y-4">
                              {[
                                {
                                  action: "مستخدم جديد",
                                  user: "أحمد محمد",
                                  time: "منذ 5 دقائق",
                                  icon: UserCheck,
                                  color: "text-green-600",
                                },
                                {
                                  action: "طلب جديد",
                                  user: "طلب #1234",
                                  time: "منذ 10 دقائق",
                                  icon: ShoppingCart,
                                  color: "text-blue-600",
                                },
                                {
                                  action: "تقييم جديد",
                                  user: "محمد علي",
                                  time: "منذ 15 دقيقة",
                                  icon: Star,
                                  color: "text-yellow-600",
                                },
                                {
                                  action: "موعد محجوز",
                                  user: "سارة أحمد",
                                  time: "منذ 20 دقيقة",
                                  icon: Calendar,
                                  color: "text-purple-600",
                                },
                                {
                                  action: "منتج جديد",
                                  user: "متجر السيارات",
                                  time: "منذ 30 دقيقة",
                                  icon: Package,
                                  color: "text-orange-600",
                                },
                              ].map((activity, index) => {
                                const Icon = activity.icon;
                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                  >
                                    <div
                                      className={`p-2 rounded-full bg-slate-100 dark:bg-slate-600 ${activity.color}`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {activity.action}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {activity.user}
                                      </p>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                      {activity.time}
                                    </span>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Enhanced Analytics Tab */}
                {activeTab === "analytics" && (
                  <div className="space-y-8">
                    <motion.div variants={fadeInUp}>
                      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            تحليلات متقدمة ومفصلة
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">
                                نظرة عامة
                              </TabsTrigger>
                              <TabsTrigger value="users">
                                المستخدمين
                              </TabsTrigger>
                              <TabsTrigger value="revenue">
                                الإيرادات
                              </TabsTrigger>
                              <TabsTrigger value="performance">
                                الأداء
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle>اتجاهات النمو الشهري</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="h-80">
                                      <Line
                                        data={userGrowthChartData}
                                        options={chartOptions}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader>
                                    <CardTitle>
                                      توزيع العملاء حسب المنطقة
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="h-80">
                                      <Pie
                                        data={ratingsChartData}
                                        options={chartOptions}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>
                            <TabsContent value="users" className="space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle>
                                      إحصائيات المستخدمين الجديدة
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="h-80">
                                      <Line
                                        data={salesChartData}
                                        options={chartOptions}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader>
                                    <CardTitle>توزيع الأدوار</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="h-80">
                                      <Doughnut
                                        data={ratingsChartData}
                                        options={chartOptions}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>
                            <TabsContent value="revenue" className="space-y-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle>
                                    تحليل الإيرادات التفصيلي
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="h-96">
                                    <Bar
                                      data={bookingsChartData}
                                      options={chartOptions}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent
                              value="performance"
                              className="space-y-6"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                  <CardContent className="p-6">
                                    <div className="flex items-center">
                                      <Target className="h-8 w-8 text-blue-600" />
                                      <div className="mr-4">
                                        <p className="text-sm font-medium text-muted-foreground">
                                          معدل النجاح
                                        </p>
                                        <p className="text-2xl font-bold">
                                          94.5%
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-6">
                                    <div className="flex items-center">
                                      <Clock className="h-8 w-8 text-green-600" />
                                      <div className="mr-4">
                                        <p className="text-sm font-medium text-muted-foreground">
                                          متوسط وقت الاستجابة
                                        </p>
                                        <p className="text-2xl font-bold">
                                          2.3 دقيقة
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-6">
                                    <div className="flex items-center">
                                      <Star className="h-8 w-8 text-yellow-600" />
                                      <div className="mr-4">
                                        <p className="text-sm font-medium text-muted-foreground">
                                          تقييم العملاء
                                        </p>
                                        <p className="text-2xl font-bold">
                                          4.8/5
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-6">
                                    <div className="flex items-center">
                                      <TrendingUp className="h-8 w-8 text-purple-600" />
                                      <div className="mr-4">
                                        <p className="text-sm font-medium text-muted-foreground">
                                          نمو شهري
                                        </p>
                                        <p className="text-2xl font-bold">
                                          +15.2%
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Enhanced Users Management Tab */}
                {activeTab === "users" && (
                  <div className="space-y-8">
                    <motion.div variants={fadeInUp}>
                      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            إدارة المستخدمين المتقدمة
                          </CardTitle>
                          <CardDescription>
                            إدارة شاملة ومتطورة لجميع المستخدمين في النظام
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="البحث عن مستخدم..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <Select
                              value={selectedRole}
                              onValueChange={setSelectedRole}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="اختر الدور" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  جميع الأدوار
                                </SelectItem>
                                <SelectItem value="client">عملاء</SelectItem>
                                <SelectItem value="mechanic">
                                  ميكانيكيين
                                </SelectItem>
                                <SelectItem value="workshop">
                                  مراكز خدمة
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button onClick={() => openUserDialog()}>
                              <Plus className="h-4 w-4 ml-2" />
                              إضافة مستخدم
                            </Button>
                          </div>

                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>المستخدم</TableHead>
                                  <TableHead>الدور</TableHead>
                                  <TableHead>تاريخ التسجيل</TableHead>
                                  <TableHead>الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {((usersData as any)?.users || []).map(
                                  (user: any) => (
                                    <motion.tr
                                      key={user._id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="hover:bg-muted/50"
                                    >
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                          <Avatar>
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>
                                              {user.name?.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p>{user.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {user.email}
                                            </p>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {getRoleBadge(user.role)}
                                      </TableCell>
                                      <TableCell>
                                        {new Date(
                                          user.createdAt
                                        ).toLocaleDateString("ar-EG")}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              openMechanicDialog(mechanic)
                                            }
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                  تأكيد الحذف
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  هل أنت متأكد من حذف هذا
                                                  المستخدم؟ لا يمكن التراجع عن
                                                  هذا الإجراء.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                  إلغاء
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() =>
                                                    handleDeleteUser(user._id)
                                                  }
                                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                  حذف
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </TableCell>
                                    </motion.tr>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Enhanced Mechanics Management Tab */}
                {activeTab === "mechanics" && (
                  <div className="space-y-8">
                    <motion.div variants={fadeInUp}>
                      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            إدارة الميكانيكيين المتخصصين
                          </CardTitle>
                          <CardDescription>
                            إدارة شاملة للمتخصصين والميكانيكيين في النظام
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="البحث عن ميكانيكي..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <Button onClick={() => openMechanicDialog()}>
                              <Plus className="h-4 w-4 ml-2" />
                              إضافة ميكانيكي
                            </Button>
                          </div>

                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>الاسم</TableHead>
                                  <TableHead>التخصصات</TableHead>
                                  <TableHead>الخبرة</TableHead>
                                  <TableHead>التقييم</TableHead>
                                  <TableHead>المهام المكتملة</TableHead>
                                  <TableHead>الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {((mechanicsData as any)?.mechanics || []).map(
                                  (mechanic: any) => (
                                    <motion.tr
                                      key={mechanic._id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="hover:bg-muted/50"
                                    >
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                          <Avatar>
                                            <AvatarImage
                                              src={mechanic.avatar}
                                            />
                                            <AvatarFallback>
                                              {mechanic.name?.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p>{mechanic.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {mechanic.email}
                                            </p>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                          {mechanic.skills?.map(
                                            (skill: string, index: number) => (
                                              <Badge
                                                key={index}
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                {skill}
                                              </Badge>
                                            )
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {mechanic.experienceYears || "غير محدد"}{" "}
                                        سنة
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <Star className="h-4 w-4 text-yellow-500" />
                                          <span>
                                            {mechanic.averageRating?.toFixed(
                                              1
                                            ) || "0.0"}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="text-sm">
                                          <span className="font-medium">
                                            {mechanic.completedBookings || 0}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {" "}
                                            من {mechanic.totalBookings || 0}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              openMechanicDialog(mechanic)
                                            }
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                  تأكيد الحذف
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  هل أنت متأكد من حذف هذا
                                                  الميكانيكي؟ لا يمكن التراجع عن
                                                  هذا الإجراء.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                  إلغاء
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() =>
                                                    handleDeleteUser(
                                                      mechanic._id
                                                    )
                                                  }
                                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                  حذف
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </TableCell>
                                    </motion.tr>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Enhanced Shops Management Tab */}
                {activeTab === "shops" && (
                  <div className="space-y-8">
                    <motion.div variants={fadeInUp}>
                      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            إدارة مراكز الخدمة
                          </CardTitle>
                          <CardDescription>
                            إدارة شاملة لمراكز الخدمة والورش في النظام
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="البحث عن مركز خدمة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <Button onClick={() => openShopDialog()}>
                              <Plus className="h-4 w-4 ml-2" />
                              إضافة مركز
                            </Button>
                          </div>

                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>اسم المركز</TableHead>
                                  <TableHead>العنوان</TableHead>
                                  <TableHead>عدد المنتجات</TableHead>
                                  <TableHead>تاريخ التسجيل</TableHead>
                                  <TableHead>الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {((shopsData as any)?.shops || []).map(
                                  (shop: any) => (
                                    <motion.tr
                                      key={shop._id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="hover:bg-muted/50"
                                    >
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                          <Avatar>
                                            <AvatarImage src={shop.avatar} />
                                            <AvatarFallback>
                                              {shop.name?.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p>{shop.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {shop.email}
                                            </p>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">
                                            {shop.address || "غير محدد"}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <span className="font-medium">
                                          {shop.productsCount || 0}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        {new Date(
                                          shop.createdAt
                                        ).toLocaleDateString("ar-EG")}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              openMechanicDialog(mechanic)
                                            }
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                  تأكيد الحذف
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  هل أنت متأكد من حذف هذا
                                                  المركز؟ لا يمكن التراجع عن هذا
                                                  الإجراء.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                  إلغاء
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() =>
                                                    handleDeleteUser(shop._id)
                                                  }
                                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                  حذف
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </TableCell>
                                    </motion.tr>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Enhanced Products Management Tab */}
                {activeTab === "products" && (
                  <div className="space-y-8">
                    <motion.div variants={fadeInUp}>
                      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            إدارة قطع الغيار والمنتجات
                          </CardTitle>
                          <CardDescription>
                            إدارة شاملة لجميع المنتجات وقطع الغيار في النظام
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="البحث عن منتج..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <Select
                              value={selectedRole}
                              onValueChange={setSelectedRole}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="اختر الفئة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">جميع الفئات</SelectItem>
                                <SelectItem value="engine">
                                  قطع المحرك
                                </SelectItem>
                                <SelectItem value="brake">
                                  قطع الفرامل
                                </SelectItem>
                                <SelectItem value="electrical">
                                  قطع كهربائية
                                </SelectItem>
                                <SelectItem value="tires">إطارات</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button onClick={() => openProductDialog()}>
                              <Plus className="h-4 w-4 ml-2" />
                              إضافة منتج
                            </Button>
                          </div>

                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>المنتج</TableHead>
                                  <TableHead>الفئة</TableHead>
                                  <TableHead>السعر</TableHead>
                                  <TableHead>الكمية</TableHead>
                                  <TableHead>المركز</TableHead>
                                  <TableHead>الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {((productsData as any)?.products || []).map(
                                  (product: any) => (
                                    <motion.tr
                                      key={product._id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="hover:bg-muted/50"
                                    >
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                          <Avatar>
                                            <AvatarImage
                                              src={product.imageUrl}
                                            />
                                            <AvatarFallback>
                                              {product.name?.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p>{product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {product.description}
                                            </p>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">
                                          {product.category || "غير محدد"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-4 w-4 text-green-600" />
                                          <span className="font-medium">
                                            {product.price?.toLocaleString()}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            product.quantity > 10
                                              ? "default"
                                              : "destructive"
                                          }
                                        >
                                          {product.quantity}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm">
                                          {product.workshopName || "غير محدد"}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              openMechanicDialog(mechanic)
                                            }
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                  تأكيد الحذف
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  هل أنت متأكد من حذف هذا
                                                  المنتج؟ لا يمكن التراجع عن هذا
                                                  الإجراء.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                  إلغاء
                                                </AlertDialogCancel>
                                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                  حذف
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </TableCell>
                                    </motion.tr>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Enhanced Orders Management Tab */}
                {activeTab === "orders" && (
                  <div className="space-y-8">
                    <motion.div variants={fadeInUp}>
                      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            إدارة الطلبات
                          </CardTitle>
                          <CardDescription>
                            تتبع وإدارة جميع الطلبات في النظام
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="البحث عن طلب..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <Select
                              value={selectedStatus}
                              onValueChange={setSelectedStatus}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="حالة الطلب" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  جميع الحالات
                                </SelectItem>
                                <SelectItem value="pending">
                                  في الانتظار
                                </SelectItem>
                                <SelectItem value="completed">مكتمل</SelectItem>
                                <SelectItem value="cancelled">ملغي</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button>
                              <Download className="h-4 w-4 ml-2" />
                              تصدير
                            </Button>
                          </div>

                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>رقم الطلب</TableHead>
                                  <TableHead>العميل</TableHead>
                                  <TableHead>المبلغ</TableHead>
                                  <TableHead>الحالة</TableHead>
                                  <TableHead>التاريخ</TableHead>
                                  <TableHead>الإجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {((ordersData as any)?.orders || []).map(
                                  (order: any) => (
                                    <motion.tr
                                      key={order._id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="hover:bg-muted/50"
                                    >
                                      <TableCell className="font-medium">
                                        <div>
                                          <p>#{order._id?.slice(-8)}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {order.items?.length || 0} منتج
                                          </p>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <Avatar>
                                            <AvatarFallback>
                                              {order.customerName?.charAt(0) ||
                                                "?"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span>
                                            {order.customerName || "غير محدد"}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-4 w-4 text-green-600" />
                                          <span className="font-medium">
                                            {order.total?.toLocaleString() || 0}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {getStatusBadge(order.status)}
                                      </TableCell>
                                      <TableCell>
                                        {new Date(
                                          order.date || order.createdAt
                                        ).toLocaleDateString("ar-EG")}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                  تأكيد الحذف
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  هل أنت متأكد من حذف هذا الطلب؟
                                                  لا يمكن التراجع عن هذا
                                                  الإجراء.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                  إلغاء
                                                </AlertDialogCancel>
                                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                  حذف
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </TableCell>
                                    </motion.tr>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dialog Components */}
      <AddEditUserDialog
        isOpen={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      <AddEditMechanicDialog
        isOpen={mechanicDialogOpen}
        onClose={() => setMechanicDialogOpen(false)}
        onSave={handleSaveMechanic}
        mechanic={selectedMechanic}
        isLoading={
          createMechanicMutation.isPending || updateMechanicMutation.isPending
        }
      />

      <AddEditShopDialog
        isOpen={shopDialogOpen}
        onClose={() => setShopDialogOpen(false)}
        onSave={handleSaveShop}
        shop={selectedShop}
        isLoading={createShopMutation.isPending || updateShopMutation.isPending}
      />

      <AddEditProductDialog
        isOpen={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        isLoading={
          createProductMutation.isPending || updateProductMutation.isPending
        }
      />
    </div>
  );
};

export default AdminDashboard;
