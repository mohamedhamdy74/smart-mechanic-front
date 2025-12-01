import { api } from '@/lib/api';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface OrderFilters {
  status?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: Order['shippingAddress'];
  paymentMethod: string;
}

export interface UpdateOrderData {
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  shippingAddress?: Partial<Order['shippingAddress']>;
}

class OrderService {
  // Get all orders with optional filters
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `orders${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return (response.data as any).orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await api.get(`orders/${id}`);
      return response.data as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Create new order
  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post('orders', data);
      return response.data as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Update order
  async updateOrder(id: string, data: UpdateOrderData): Promise<Order> {
    try {
      const response = await api.put(`orders/${id}`, data);
      return response.data as Order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }

  // Update order status
  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const response = await api.patch(`orders/${id}/status`, { status });
      return response.data as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Cancel order
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    try {
      const response = await api.patch(`orders/${id}/cancel`, { reason });
      return response.data as Order;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  // Delete order
  async deleteOrder(id: string): Promise<void> {
    try {
      await api.delete(`orders/${id}`);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error('Failed to delete order');
    }
  }

  // Get customer's orders
  async getCustomerOrders(customerId: string, filters?: OrderFilters): Promise<Order[]> {
    try {
      const queryParams = new URLSearchParams({ customerId });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `orders/customer${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return (response.data as any).orders || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw new Error('Failed to fetch customer orders');
    }
  }

  // Get order statistics
  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
  }> {
    try {
      const response = await api.get('orders/stats');
      return response.data as {
        totalOrders: number;
        totalRevenue: number;
        pendingOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        averageOrderValue: number;
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw new Error('Failed to fetch order statistics');
    }
  }

  // Process payment for order
  async processPayment(orderId: string, paymentData: any): Promise<Order> {
    try {
      const response = await api.post(`orders/${orderId}/payment`, paymentData);
      return response.data as Order;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error('Failed to process payment');
    }
  }

  // Get order tracking information
  async getOrderTracking(orderId: string): Promise<{
    orderId: string;
    status: Order['status'];
    trackingNumber?: string;
    estimatedDelivery?: string;
    trackingHistory: Array<{
      status: string;
      timestamp: string;
      description: string;
    }>;
  }> {
    try {
      const response = await api.get(`orders/${orderId}/tracking`);
      return response.data as {
        orderId: string;
        status: Order['status'];
        trackingNumber?: string;
        estimatedDelivery?: string;
        trackingHistory: Array<{
          status: string;
          timestamp: string;
          description: string;
        }>;
      };
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      throw new Error('Failed to fetch order tracking');
    }
  }
}

export const orderService = new OrderService();