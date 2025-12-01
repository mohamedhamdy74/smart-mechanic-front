import { useState, useEffect } from 'react';
import { orderService, Order, OrderFilters } from '@/services/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async (filters?: OrderFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.getOrders(filters);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderById = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const order = await orderService.getOrderById(id);
      return order;
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const newOrder = await orderService.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrder = async (id: string, orderData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedOrder = await orderService.updateOrder(id, orderData);
      setOrders(prev => prev.map(order =>
        order._id === id ? updatedOrder : order
      ));
      return updatedOrder;
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedOrder = await orderService.updateOrderStatus(id, status);
      setOrders(prev => prev.map(order =>
        order._id === id ? updatedOrder : order
      ));
      return updatedOrder;
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (id: string, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const cancelledOrder = await orderService.cancelOrder(id, reason);
      setOrders(prev => prev.map(order =>
        order._id === id ? cancelledOrder : order
      ));
      return cancelledOrder;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await orderService.deleteOrder(id);
      setOrders(prev => prev.filter(order => order._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomerOrders = async (customerId: string, filters?: OrderFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const customerOrders = await orderService.getCustomerOrders(customerId, filters);
      return customerOrders;
    } catch (err: any) {
      setError(err.message || 'Failed to load customer orders');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    isLoading,
    error,
    loadOrders,
    getOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    getCustomerOrders,
  };
};

export const useOrderStats = () => {
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.getOrderStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order statistics');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
};

export const useOrderTracking = (orderId: string) => {
  const [tracking, setTracking] = useState<{
    orderId: string;
    status: Order['status'];
    trackingNumber?: string;
    estimatedDelivery?: string;
    trackingHistory: Array<{
      status: string;
      timestamp: string;
      description: string;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.getOrderTracking(orderId);
      setTracking(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order tracking');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchTracking();
    }
  }, [orderId]);

  return {
    tracking,
    isLoading,
    error,
    fetchTracking,
  };
};