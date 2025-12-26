import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
  LogOut,
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
import logoIcon from "@/assets/logo-icon.png";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useNavigate } from "react-router-dom";

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
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [mechanicsPage, setMechanicsPage] = useState(1);
  const [shopsPage, setShopsPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const exportOrdersToCSV = (orders: any[]) => {
    if (!orders || orders.length === 0) {
      toast.error("لا توجد بيانات لتصديرها");
      return;
    }

    const csvData = [
      ["رقم الطلب", "التاريخ", "العميل", "الهاتف", "المنتجات", "المبلغ الإجمالي", "الحالة", "طريقة الدفع"],
      ...orders.map((order) => [
        order._id?.slice(-8) || "",
        new Date(order.createdAt).toLocaleDateString("ar-EG"),
        order.customerInfo?.name || order.userId?.name || "غير محدد",
        order.customerInfo?.phone || order.userId?.phone || "غير محدد",
        order.products?.map((p: any) => p.productId?.name || p.name || "منتج غير متوفر").join(" - "),
        order.totalAmount || 0,
        order.status === "pending" ? "قيد الانتظار" : order.status === "completed" ? "مكتمل" : "ملغي",
        order.paymentMethod === "cod" ? "دفع عند الاستلام" : "دفع إلكتروني",
      ]),
    ];

    const csvContent = "\uFEFF" + csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `طلبات_العملاء_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير البيانات بنجاح");
  };

  const queryClient = useQueryClient();

  // No dialog states needed as Add/Edit functionality is removed

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
  } = useQuery<SystemStats>({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch analytics data with real backend data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery<any>({
    queryKey: ["admin-analytics", "30d"],
    queryFn: () => adminApi.getAnalytics({ period: "30d" }),
    staleTime: 60000,
    refetchInterval: 300000,
  });

  // Enhanced data fetching for users
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery<ListUsersResponse>({
    queryKey: ["admin-users", { search: searchTerm, role: selectedRole, page: usersPage }],
    queryFn: () => adminApi.getUsers({
      search: searchTerm || undefined,
      role: selectedRole !== "all" ? selectedRole : undefined,
      page: usersPage,
      limit: ITEMS_PER_PAGE,
    }),
  });

  // Reset page when search or filters change
  useEffect(() => {
    setUsersPage(1);
  }, [searchTerm, selectedRole]);

  // Enhanced data fetching for mechanics
  const {
    data: mechanicsData,
    isLoading: mechanicsLoading,
    refetch: refetchMechanics,
  } = useQuery<any>({
    queryKey: ["admin-mechanics", { search: searchTerm, page: mechanicsPage }],
    queryFn: () => adminApi.getMechanics({
      search: searchTerm || undefined,
      page: mechanicsPage,
      limit: ITEMS_PER_PAGE,
    }),
  });

  useEffect(() => {
    setMechanicsPage(1);
  }, [searchTerm]);

  // Enhanced data fetching for shops
  const {
    data: shopsData,
    isLoading: shopsLoading,
    refetch: refetchShops,
  } = useQuery<any>({
    queryKey: ["admin-shops", { search: searchTerm, page: shopsPage }],
    queryFn: () => adminApi.getShops({
      search: searchTerm || undefined,
      page: shopsPage,
      limit: ITEMS_PER_PAGE,
    }),
  });

  useEffect(() => {
    setShopsPage(1);
  }, [searchTerm]);

  // Enhanced data fetching for products
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery<ListProductsResponse>({
    queryKey: ["admin-products", { search: searchTerm, page: productsPage }],
    queryFn: () => adminApi.getProducts({
      search: searchTerm || undefined,
      page: productsPage,
      limit: ITEMS_PER_PAGE,
    }),
  });

  useEffect(() => {
    setProductsPage(1);
  }, [searchTerm]);

  // Enhanced data fetching for notifications
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery<any>({
    queryKey: [
      "admin-notifications",
      {
        isRead:
          selectedStatus === "all" ? undefined : selectedStatus === "read",
      },
    ],
    queryFn: () => adminApi.getNotifications({
      isRead:
        selectedStatus === "all" ? undefined : selectedStatus === "read",
      limit: 20,
    }),
  });

  // Enhanced data fetching for orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery<ListOrdersResponse>({
    queryKey: ["admin-orders", { search: searchTerm, page: ordersPage }],
    queryFn: () => adminApi.getOrders({
      search: searchTerm || undefined,
      page: ordersPage,
      limit: ITEMS_PER_PAGE,
    }),
  });

  useEffect(() => {
    setOrdersPage(1);
  }, [searchTerm]);

  // Enhanced data fetching for appointments
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useQuery<any>({
    queryKey: ["admin-appointments", { search: searchTerm }],
    queryFn: () => adminApi.getAppointments({
      search: searchTerm || undefined,
      limit: 20,
    }),
  });

  // Enhanced data fetching for reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery<any>({
    queryKey: ["admin-reviews", { search: searchTerm }],
    queryFn: () => adminApi.getReviews({
      search: searchTerm || undefined,
      limit: 20,
    }),
  });

  // Fetch pending registrations
  const {
    data: pendingRegistrations,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useQuery<{ users: any[] }>({
    queryKey: ["admin-pending-registrations"],
    queryFn: adminApi.getPendingRegistrations,
  });

  // Fetch recent activities
  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    refetch: refetchActivities,
  } = useQuery<{ activities: any[] }>({
    queryKey: ["admin-activities"],
    queryFn: adminApi.getActivities,
    staleTime: 30000,
    refetchInterval: 60000,
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
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      return await adminApi.updateUser(userId, data);
    },
    onSuccess: () => {
      toast.success("✅ تم تحديث المستخدم بنجاح");
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في تحديث المستخدم");
    },
  });

  const approveRegistrationMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await adminApi.approveRegistration(userId);
    },
    onSuccess: () => {
      toast.success("✅ تم تفعيل الحساب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-registrations"] });
      refetchStats();
      refetchMechanics();
      refetchShops();
    },
    onError: () => {
      toast.error("❌ فشل في تفعيل الحساب");
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
      setSelectedMechanic(null);
      queryClient.invalidateQueries({ queryKey: ["admin-mechanics"] });
      refetchStats();
    },
    onError: () => {
      toast.error("❌ فشل في تحديث الميكانيكي");
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
        refetchPending(),
        refetchActivities(),
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

  // Dialog management functions removed as Add/Edit functionality is removed

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

  const salesChartData = {
    labels: typedAnalytics?.sales?.map((item: any) => item._id) || [],
    datasets: [
      {
        label: "المبيعات اليومية",
        data: typedAnalytics?.sales?.map((item: any) => item.revenue) || [],
        borderColor: "rgb(234, 88, 12)",
        backgroundColor: "rgba(234, 88, 12, 0.1)",
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
      id: "pending-approvals",
      label: "طلبات الانضمام",
      icon: UserPlus,
      color: "from-amber-500 to-yellow-600",
      description: "الموافقة على الميكانيكيين والمراكز",
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
                          {item.id === "pending-approvals" && pendingRegistrations?.users?.length > 0 && (
                            <Badge variant="destructive" className="mr-auto">
                              {pendingRegistrations.users.length}
                            </Badge>
                          )}
                        </Button>
                      </motion.div>
                    );
                  })}
                  {/* Logout Button */}
                  <Separator className="my-4" />
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navigationItems.length * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-right h-12 transition-all duration-300 group hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 text-red-600 dark:text-red-400"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      title={sidebarCollapsed ? "تسجيل الخروج" : undefined}
                    >
                      <LogOut
                        className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                      />
                      {!sidebarCollapsed && (
                        <div className="flex flex-col items-start mr-3">
                          <span className="text-sm font-medium">
                            تسجيل الخروج
                          </span>
                          <span className="text-xs opacity-70">
                            الخروج من لوحة التحكم
                          </span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                        {/* Improved KPI Cards - Vibrant Version */}
                        <motion.div variants={fadeInUp}>
                          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.2 }}>
                            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-2xl rounded-2xl group h-full">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Users className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                                    %+{((analyticsData?.performance?.monthlyGrowth) || 0).toFixed(1)}
                                  </div>
                                </div>
                                <p className="text-blue-100 text-xs font-medium mb-1">إجمالي المستخدمين</p>
                                <h3 className="text-3xl font-bold mb-4">{stats.users.total.toLocaleString()}</h3>
                                <div className="flex justify-between text-[10px] text-blue-100 pt-4 border-t border-white/10">
                                  <span>{stats.users.mechanics} ميكانيكي</span>
                                  <span>{stats.users.workshops} مركز</span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.2 }}>
                            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-2xl rounded-2xl group h-full">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <ShoppingCart className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                                    نشط
                                  </div>
                                </div>
                                <p className="text-emerald-100 text-xs font-medium mb-1">مبيعات المنتجات</p>
                                <h3 className="text-3xl font-bold mb-4">{stats.orders.total.toLocaleString()}</h3>
                                <div className="flex justify-between text-[10px] text-emerald-100 pt-4 border-t border-white/10">
                                  <span>{stats.orders.pending} بانتظار الشحن</span>
                                  <span>{stats.orders.completed} تم شحنه</span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.2 }}>
                            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-2xl rounded-2xl group h-full">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Calendar className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                                    {analyticsData?.performance?.successRate}% نجاح
                                  </div>
                                </div>
                                <p className="text-purple-100 text-xs font-medium mb-1">المواعيد</p>
                                <h3 className="text-3xl font-bold mb-4">{stats.bookings.total.toLocaleString()}</h3>
                                <div className="flex justify-between text-[10px] text-purple-100 pt-4 border-t border-white/10">
                                  <span>{stats.bookings.new || 0} مواعيد جديدة</span>
                                  <span>{stats.bookings.completed} اكتملت</span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.2 }}>
                            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-2xl rounded-2xl group h-full">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <DollarSign className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                                    ج.م
                                  </div>
                                </div>
                                <p className="text-orange-100 text-xs font-medium mb-1">الأرباح الكلية</p>
                                <h3 className="text-3xl font-bold mb-4">{stats.revenue.total.toLocaleString()}</h3>
                                <div className="flex justify-between text-[10px] text-orange-100 pt-4 border-t border-white/10">
                                  <span>إجمالي الحركات المالية</span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.2 }}>
                            <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-cyan-600 text-white border-0 shadow-2xl rounded-2xl group h-full">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Activity className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                                    20% عمولة
                                  </div>
                                </div>
                                <p className="text-indigo-100 text-xs font-medium mb-1">أرباح المنصة</p>
                                <h3 className="text-3xl font-bold mb-4">{Number(stats.revenue.platformProfits.toFixed(2)).toLocaleString()}</h3>
                                <div className="flex justify-between text-[10px] text-indigo-100 pt-4 border-t border-white/10">
                                  <span>صافي عمولة النظام</span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>
                      </div>
                    )}


                    {/* Enhanced Charts Section */}
                    {analyticsData && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <motion.div variants={fadeInUp}>
                          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                إحصائيات المواعيد
                              </CardTitle>
                              <CardDescription>يوضح الرسم البياني المواعيد المحجوزة والمكتملة خلال الفترة الحالية.</CardDescription>
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
                              <CardDescription>تحليل تقييمات العملاء لجودة الخدمات المقدمة من الميكانيكيين.</CardDescription>
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
                              <CardDescription>معدل انضمام العملاء ومزودي الخدمة الجدد إلى المنصة.</CardDescription>
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
                              {activitiesData?.activities?.map((activity, index) => {
                                const Icon = activity.type === 'user' ? UserCheck :
                                  activity.type === 'order' ? ShoppingCart :
                                    activity.type === 'booking' ? Calendar :
                                      activity.type === 'review' ? Star :
                                        activity.type === 'product' ? Package : Activity;

                                const colorClass = activity.type === 'user' ? "text-green-600" :
                                  activity.type === 'order' ? "text-blue-600" :
                                    activity.type === 'booking' ? "text-purple-600" :
                                      activity.type === 'review' ? "text-yellow-600" :
                                        activity.type === 'product' ? "text-orange-600" : "text-slate-600";

                                // Function to format relative time
                                const formatRelativeTime = (dateString: string) => {
                                  const date = new Date(dateString);
                                  const now = new Date();
                                  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

                                  if (diffInSeconds < 60) return "الآن";
                                  const diffInMinutes = Math.floor(diffInSeconds / 60);
                                  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
                                  const diffInHours = Math.floor(diffInMinutes / 60);
                                  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
                                  const diffInDays = Math.floor(diffInHours / 24);
                                  if (diffInDays < 30) return `منذ ${diffInDays} يوم`;
                                  return date.toLocaleDateString("ar-EG");
                                };

                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                  >
                                    <div
                                      className={`p-2 rounded-full bg-slate-100 dark:bg-slate-600 ${colorClass}`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {activity.action}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {activity.user} • {activity.detail}
                                      </p>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                      {formatRelativeTime(activity.createdAt)}
                                    </span>
                                  </motion.div>
                                );
                              })}
                              {(!activitiesData?.activities || activitiesData.activities.length === 0) && !activitiesLoading && (
                                <div className="text-center py-8 text-muted-foreground">
                                  لا توجد أنشطة مؤخراً
                                </div>
                              )}
                              {activitiesLoading && (
                                <div className="flex justify-center py-8">
                                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                              )}
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
                                    <CardTitle>اتجاهات نمو المستخدمين</CardTitle>
                                    <CardDescription>يوضح هذا الرسم البياني عدد العملاء والميكانيكيين ومراكز الخدمة الجدد الذين انضموا للنظام يومياً.</CardDescription>
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
                                    <CardTitle>توزيع التقييمات العامة</CardTitle>
                                    <CardDescription>تحليل لتقييمات العملاء للخدمات المقدمة (من نجمة واحدة إلى 5 نجوم).</CardDescription>
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
                                    <CardTitle>نمو عدد المستخدمين</CardTitle>
                                    <CardDescription>مقارنة بين انضمام العملاء الجدد ومزودي الخدمة خلال الفترة المحددة.</CardDescription>
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
                                    <CardTitle>توزيع أدوار المستخدمين</CardTitle>
                                    <CardDescription>نسبة كل فئة من المستخدمين (عميل، ميكانيكي، مركز خدمة) في النظام.</CardDescription>
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
                                  <CardTitle>اتجاهات المبيعات اليومية</CardTitle>
                                  <CardDescription>يوضح هذا الرسم حجم المبيعات اليومية خلال الفترة المختارة، مما يساعد في تتبع الأداء المالي.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="h-96">
                                    <Line
                                      data={salesChartData}
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
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl rounded-2xl overflow-hidden group">
                                  <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="p-2 bg-blue-500/10 rounded-xl">
                                        <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">معدل النجاح</p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{analyticsData?.performance?.successRate || 0}%</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl rounded-2xl overflow-hidden group">
                                  <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="p-2 bg-green-500/10 rounded-xl">
                                        <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">وقت الاستجابة</p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                          {analyticsData?.performance?.avgResponseTime || 0} د
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl rounded-2xl overflow-hidden group">
                                  <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="p-2 bg-yellow-500/10 rounded-xl">
                                        <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">التقييم العام</p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{analyticsData?.performance?.avgRating || 0}/5</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl rounded-2xl overflow-hidden group">
                                  <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="p-2 bg-purple-500/10 rounded-xl">
                                        {analyticsData?.performance?.monthlyGrowth >= 0 ? (
                                          <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        ) : (
                                          <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">النمو الشهري</p>
                                        <p className={`text-xl font-bold ${analyticsData?.performance?.monthlyGrowth >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                          {analyticsData?.performance?.monthlyGrowth >= 0 ? "+" : ""}
                                          {(analyticsData?.performance?.monthlyGrowth || 0).toFixed(1)}%
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

                          {/* Pagination for Users */}
                          {usersData?.pages > 1 && (
                            <div className="mt-4 border-t pt-4">
                              <div className="flex justify-between items-center mb-4 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                <span>الصفحة {usersPage} من {usersData.pages}</span>
                                <span>إجمالي المستخدمين: {usersData.total}</span>
                              </div>
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      className="cursor-pointer"
                                      onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                                    />
                                  </PaginationItem>
                                  {[...Array(usersData.pages)].map((_, i) => (
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        className="cursor-pointer"
                                        isActive={usersPage === i + 1}
                                        onClick={() => setUsersPage(i + 1)}
                                      >
                                        {i + 1}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  <PaginationItem>
                                    <PaginationNext
                                      className="cursor-pointer"
                                      onClick={() => setUsersPage(p => Math.min(usersData.pages, p + 1))}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
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

                          {/* Pagination for Mechanics */}
                          {mechanicsData?.pages > 1 && (
                            <div className="mt-4 border-t pt-4">
                              <div className="flex justify-between items-center mb-4 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                <span>الصفحة {mechanicsPage} من {mechanicsData.pages}</span>
                                <span>إجمالي الميكانيكيين: {mechanicsData.total}</span>
                              </div>
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      className="cursor-pointer"
                                      onClick={() => setMechanicsPage(p => Math.max(1, p - 1))}
                                    />
                                  </PaginationItem>
                                  {[...Array(mechanicsData.pages)].map((_, i) => (
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        className="cursor-pointer"
                                        isActive={mechanicsPage === i + 1}
                                        onClick={() => setMechanicsPage(i + 1)}
                                      >
                                        {i + 1}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  <PaginationItem>
                                    <PaginationNext
                                      className="cursor-pointer"
                                      onClick={() => setMechanicsPage(p => Math.min(mechanicsData.pages, p + 1))}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
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
                                            {shop.workshopAddress || shop.address || shop.location || "غير محدد"}
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

                          {/* Pagination for Shops */}
                          {shopsData?.pages > 1 && (
                            <div className="mt-4 border-t pt-4">
                              <div className="flex justify-between items-center mb-4 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                <span>الصفحة {shopsPage} من {shopsData.pages}</span>
                                <span>إجمالي المراكز: {shopsData.total}</span>
                              </div>
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      className="cursor-pointer"
                                      onClick={() => setShopsPage(p => Math.max(1, p - 1))}
                                    />
                                  </PaginationItem>
                                  {[...Array(shopsData.pages)].map((_, i) => (
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        className="cursor-pointer"
                                        isActive={shopsPage === i + 1}
                                        onClick={() => setShopsPage(i + 1)}
                                      >
                                        {i + 1}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  <PaginationItem>
                                    <PaginationNext
                                      className="cursor-pointer"
                                      onClick={() => setShopsPage(p => Math.min(shopsData.pages, p + 1))}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
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
                                            (product.stock ?? product.quantity ?? 0) > 10
                                              ? "default"
                                              : "destructive"
                                          }
                                        >
                                          {product.stock ?? product.quantity ?? 0}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm">
                                          {product.workshopName || "غير محدد"}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
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

                          {/* Pagination for Products */}
                          {productsData?.pages > 1 && (
                            <div className="mt-4 border-t pt-4">
                              <div className="flex justify-between items-center mb-4 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                <span>الصفحة {productsPage} من {productsData.pages}</span>
                                <span>إجمالي المنتجات: {productsData.total}</span>
                              </div>
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      className="cursor-pointer"
                                      onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                                    />
                                  </PaginationItem>
                                  {[...Array(productsData.pages)].map((_, i) => (
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        className="cursor-pointer"
                                        isActive={productsPage === i + 1}
                                        onClick={() => setProductsPage(i + 1)}
                                      >
                                        {i + 1}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  <PaginationItem>
                                    <PaginationNext
                                      className="cursor-pointer"
                                      onClick={() => setProductsPage(p => Math.min(productsData.pages, p + 1))}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
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
                            <Button onClick={() => exportOrdersToCSV((ordersData as any)?.orders)}>
                              <Download className="h-4 w-4 ml-2" />
                              تصدير
                            </Button>
                          </div>

                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>رقم الطلب</TableHead>
                                  <TableHead>المنتج</TableHead>
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
                                          <p className="text-[10px] text-muted-foreground">
                                            {order.products?.length || 0} منتج
                                          </p>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-medium line-clamp-1">
                                            {order.products?.[0]?.productId?.name || order.products?.[0]?.name || "منتج غير متوفر"}
                                          </span>
                                          {order.products?.length > 1 && (
                                            <span className="text-[10px] text-muted-foreground">
                                              +{order.products.length - 1} منتج آخر
                                            </span>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <Avatar>
                                            <AvatarFallback>
                                              {(order.customerInfo?.name || order.userId?.name || "?").charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span>
                                            {order.customerInfo?.name || order.userId?.name || "غير محدد"}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-4 w-4 text-green-600" />
                                          <span className="font-medium">
                                            {order.totalAmount?.toLocaleString() || 0}
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
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedOrder(order);
                                              setOrderDetailsOpen(true);
                                            }}
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </motion.tr>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Pagination for Orders */}
                          {ordersData?.pages > 1 && (
                            <div className="mt-4 border-t pt-4">
                              <div className="flex justify-between items-center mb-4 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                <span>الصفحة {ordersPage} من {ordersData.pages}</span>
                                <span>إجمالي الطلبات: {ordersData.total}</span>
                              </div>
                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      className="cursor-pointer"
                                      onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                    />
                                  </PaginationItem>
                                  {[...Array(ordersData.pages)].map((_, i) => (
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        className="cursor-pointer"
                                        isActive={ordersPage === i + 1}
                                        onClick={() => setOrdersPage(i + 1)}
                                      >
                                        {i + 1}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  <PaginationItem>
                                    <PaginationNext
                                      className="cursor-pointer"
                                      onClick={() => setOrdersPage(p => Math.min(ordersData.pages, p + 1))}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Pending Approvals Management Tab */}
                {activeTab === "pending-approvals" && (
                  <div className="space-y-8">
                    <motion.div variants={fadeInUp}>
                      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            إدارة طلبات الانضمام
                          </CardTitle>
                          <CardDescription>
                            مراجعة وقبول الميكانيكيين ومراكز الصيانة الجديدة
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {pendingLoading ? (
                            <div className="flex justify-center p-8">
                              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : !pendingRegistrations?.users || pendingRegistrations.users.length === 0 ? (
                            <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                              <UserCheck className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                لا توجد طلبات معلقة
                              </h3>
                              <p className="text-slate-500 dark:text-slate-400">
                                تم معالجة جميع طلبات الانضمام السابقة.
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>المستخدم</TableHead>
                                    <TableHead>النوع</TableHead>
                                    <TableHead>التواصل</TableHead>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {pendingRegistrations.users.map((user: any) => (
                                    <motion.tr
                                      key={user._id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="hover:bg-muted/50"
                                    >
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                          <Avatar>
                                            <AvatarFallback>
                                              {user.name?.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p>{user.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {user.workshopName || (user.role === 'mechanic' ? 'ميكانيكي حر' : '')}
                                            </p>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {getRoleBadge(user.role)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="text-sm space-y-1">
                                          <div className="flex items-center gap-1 text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            {user.email}
                                          </div>
                                          {user.phone && (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                              <Phone className="h-3 w-3" />
                                              {user.phone}
                                            </div>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Calendar className="h-3 w-3" />
                                          {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => approveRegistrationMutation.mutate(user._id)}
                                            disabled={approveRegistrationMutation.isPending}
                                          >
                                            {approveRegistrationMutation.isPending ? (
                                              <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <>
                                                <CheckCircle className="h-4 w-4 ml-1" />
                                                قبول
                                              </>
                                            )}
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:bg-red-50"
                                              >
                                                <XCircle className="h-4 w-4 ml-1" />
                                                رفض
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                  رفض طلب الانضمام
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  هل أنت متأكد من رفض طلب انضمام {user.name}؟ هذا سيؤدي لحذف الحساب نهائياً.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                  إلغاء
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                  onClick={() => deleteUserMutation.mutate(user._id)}
                                                >
                                                  تأكيد الرفض
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </TableCell>
                                    </motion.tr>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <ShoppingCart className="h-6 w-6 text-primary" />
                تفاصيل الطلب #{selectedOrder?._id?.slice(-8)}
              </DialogTitle>
              <DialogDescription>
                عرض معلومات كاملة عن الطلب والمنتجات والعميل
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 py-4">
                  {/* Status and Summary */}
                  <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(selectedOrder.status)}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(selectedOrder.createdAt).toLocaleString("ar-EG")}
                        </div>
                      </div>
                      <div className="text-right text-lg font-bold text-primary">
                        {selectedOrder.totalAmount?.toLocaleString()} ج.م
                      </div>
                    </div>
                    {selectedOrder.products?.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-muted-foreground mb-1">المنتجات:</p>
                        <p className="font-semibold text-sm">
                          {selectedOrder.products.map((p: any) => p.productId?.name || p.name).join(" ، ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                      <Users className="h-4 w-4 text-primary" />
                      معلومات العميل
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border bg-white/50 dark:bg-slate-800/50">
                        <Label className="text-xs text-muted-foreground">الاسم</Label>
                        <p className="font-medium">{selectedOrder.customerInfo?.name || selectedOrder.userId?.name || "غير محدد"}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-white/50 dark:bg-slate-800/50">
                        <Label className="text-xs text-muted-foreground">رقم الهاتف</Label>
                        <p className="font-medium">{selectedOrder.customerInfo?.phone || selectedOrder.userId?.phone || "غير محدد"}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-white/50 dark:bg-slate-800/50">
                        <Label className="text-xs text-muted-foreground">العنوان</Label>
                        <p className="font-medium text-sm">{selectedOrder.customerInfo?.address || "غير محدد"}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-white/50 dark:bg-slate-800/50">
                        <Label className="text-xs text-muted-foreground">البريد الإلكتروني</Label>
                        <p className="font-medium text-sm">{selectedOrder.customerInfo?.email || selectedOrder.userId?.email || "غير محدد"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Products Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                      <Package className="h-4 w-4 text-primary" />
                      المنتجات ({selectedOrder.products?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.products?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border">
                              <AvatarImage src={item.productId?.images?.[0]} />
                              <AvatarFallback>{item.productId?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{item.productId?.name || item.name || "منتج غير متوفر"}</p>
                              <p className="text-xs text-muted-foreground">ج.م {item.price?.toLocaleString()} × {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            ج.م {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        المركز المسئول
                      </h3>
                      <div className="p-3 rounded-lg border bg-white/50 dark:bg-slate-800/50">
                        <p className="font-medium">{selectedOrder.workshopId?.workshopName || "غير محدد"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        طريقة الدفع
                      </h3>
                      <div className="p-3 rounded-lg border bg-white/50 dark:bg-slate-800/50">
                        <p className="font-medium">{selectedOrder.paymentMethod === 'cod' ? 'دفع عند الاستلام' : 'دفع إلكتروني'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
              <Button variant="outline" onClick={() => setOrderDetailsOpen(false)}>
                إغلاق
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div >
  );
};

export default AdminDashboard;
