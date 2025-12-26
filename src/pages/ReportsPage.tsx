import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Package, Download, Calendar, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportData {
  monthlySales: number;
  monthlyRevenue: number;
  totalProducts: number;
  topProducts: Array<{
    name: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  dailyOrders: Array<{
    _id: string;
    orders: number;
    revenue: number;
  }>;
}

const ReportsPage = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  // Fetch report data using React Query
  const { data: reportData, isLoading, error: queryError } = useQuery({
    queryKey: ['workshop-reports', user?._id, selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/orders/workshop/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات التقارير');
      }

      return await response.json();
    },
    enabled: !!user?._id,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Handle loading and error states
  useEffect(() => {
    if (queryError) {
      toast.error(queryError.message);
    }
  }, [queryError]);

  const exportToCSV = () => {
    if (!reportData) return;

    const csvData = [
      ['المنتج', 'عدد المبيعات', 'إجمالي الإيرادات'],
      ...reportData.topProducts.map(product => [
        product.name,
        product.totalSold.toString(),
        product.totalRevenue.toString()
      ])
    ];

    const csvContent = "\uFEFF" + csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_المبيعات_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getChartData = () => {
    if (!reportData) return [];

    switch (chartType) {
      case 'pie':
        return reportData.topProducts.map(product => ({
          name: product.name,
          value: product.totalSold,
          revenue: product.totalRevenue
        }));
      case 'line':
      case 'bar':
      default:
        return reportData.dailyOrders.map(day => ({
          date: new Date(day._id).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
          orders: day.orders,
          revenue: day.revenue
        }));
    }
  };

  const renderChart = () => {
    const data = getChartData();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

    switch (chartType) {
      case 'line':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'orders' ? `${value} طلب` : `${value.toLocaleString()} ج.م`,
                    name === 'orders' ? 'الطلبات' : 'الإيرادات'
                  ]}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        );
      case 'pie':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
                  outerRadius={140}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value} مبيع`, 'الكمية']}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        );
      case 'bar':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'orders' ? `${value} طلب` : `${value.toLocaleString()} ج.م`,
                    name === 'orders' ? 'الطلبات' : 'الإيرادات'
                  ]}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="orders"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="الطلبات"
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="الإيرادات"
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        );
    }
  };

  if (isLoading) {
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

            {/* Controls Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Skeleton className="h-10 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
              <Skeleton className="h-10 w-32 ml-auto" />
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6 text-center">
                  <Skeleton className="h-12 w-12 mx-auto mb-4" />
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </Card>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="p-6">
                <Skeleton className="h-7 w-48 mb-6" />
                <Skeleton className="h-80 w-full" />
              </Card>
              <Card className="p-6">
                <Skeleton className="h-7 w-40 mb-6" />
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="text-left">
                        <Skeleton className="h-5 w-12 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Table Skeleton */}
            <Card className="p-6">
              <Skeleton className="h-7 w-48 mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border-b">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </Card>
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
              التقارير والإحصائيات
            </h1>
            <p className="text-muted-foreground text-lg">
              تحليل شامل لأداء مركز الصيانة ومبيعات المنتجات
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="quarter">هذا الربع</SelectItem>
                <SelectItem value="year">هذا العام</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={exportToCSV} className="ml-auto">
              <Download className="h-4 w-4 ml-2" />
              تصدير CSV
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6 text-center shadow-xl border-border/50 bg-gradient-to-br from-primary/5 to-background hover:shadow-2xl transition-all duration-300">
                <Package className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                <motion.p
                  className="text-4xl font-bold text-primary mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {reportData?.totalProducts || 0}
                </motion.p>
                <p className="text-base text-muted-foreground font-medium">إجمالي المنتجات</p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 text-center shadow-xl border-border/50 bg-gradient-to-br from-orange-500/5 to-background hover:shadow-2xl transition-all duration-300" style={{ animationDelay: "0.1s" }}>
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
                <motion.p
                  className="text-4xl font-bold text-primary mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {reportData?.monthlySales || 0}
                </motion.p>
                <p className="text-base text-muted-foreground font-medium">إجمالي المبيعات</p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 text-center shadow-xl border-border/50 bg-gradient-to-br from-green-500/5 to-background hover:shadow-2xl transition-all duration-300" style={{ animationDelay: "0.2s" }}>
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                <motion.p
                  className="text-4xl font-bold text-primary mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {reportData?.monthlyRevenue ? reportData.monthlyRevenue.toLocaleString() : 0} ج.م
                </motion.p>
                <p className="text-base text-muted-foreground font-medium">إجمالي الإيرادات</p>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <h3 className="text-xl font-bold mb-6 text-right">
                {chartType === 'pie' ? 'توزيع المبيعات حسب المنتج' : 'المبيعات والإيرادات اليومية'}
              </h3>
              {renderChart()}
            </Card>

            <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <h3 className="text-xl font-bold mb-6 text-right">المنتجات الأكثر مبيعاً</h3>
              <div className="space-y-4">
                {reportData?.topProducts?.length ? (
                  reportData.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 rounded-xl bg-card/50 border border-border/30 hover-lift transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="text-base font-medium">{product.name}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary">{product.totalSold} مبيع</p>
                        <p className="text-sm text-muted-foreground">{product.totalRevenue.toLocaleString()} ج.م</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد بيانات مبيعات بعد</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <h3 className="text-xl font-bold mb-6 text-right">تفاصيل المبيعات اليومية</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right p-4 font-semibold">التاريخ</th>
                    <th className="text-right p-4 font-semibold">عدد الطلبات</th>
                    <th className="text-right p-4 font-semibold">الإيرادات</th>
                    <th className="text-right p-4 font-semibold">متوسط الطلب</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.dailyOrders?.map((day, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        {new Date(day._id).toLocaleDateString('ar-EG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4 font-medium">{day.orders}</td>
                      <td className="p-4 font-medium">{day.revenue.toLocaleString()} ج.م</td>
                      <td className="p-4 font-medium">
                        {day.orders > 0 ? (day.revenue / day.orders).toFixed(0) : 0} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportsPage;