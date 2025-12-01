import { api } from './api';
import { ApiResponse, PaginationParams, SortParams, FilterParams } from '@/types/api';
import { Order, Appointment, PendingChange, SystemStats } from '@/types/admin';

export interface ListOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

export interface ListAppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  pages: number;
}

export interface ListPendingChangesResponse {
  changes: PendingChange[];
  total: number;
  page: number;
  pages: number;
}

export const adminApi = {
  // System stats
  getStats: (): Promise<ApiResponse<SystemStats>> =>
    api.get('/admin/stats').then(res => res.data),

  // Orders
  getOrders: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ApiResponse<ListOrdersResponse>> =>
    api.get('/admin/orders', { params }).then(res => res.data),

  updateOrderStatus: (orderId: string, status: string): Promise<ApiResponse<Order>> =>
    api.patch(`/admin/orders/${orderId}/status`, { status }).then(res => res.data),

  // Appointments
  getAppointments: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ApiResponse<ListAppointmentsResponse>> =>
    api.get('/admin/appointments', { params }).then(res => res.data),

  updateAppointmentStatus: (appointmentId: string, status: string): Promise<ApiResponse<Appointment>> =>
    api.patch(`/admin/appointments/${appointmentId}/status`, { status }).then(res => res.data),

  // Pending Changes
  getPendingChanges: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ApiResponse<ListPendingChangesResponse>> =>
    api.get('/admin/pending-changes', { params }).then(res => res.data),

  approvePendingChange: (changeId: string): Promise<ApiResponse<PendingChange>> =>
    api.post(`/admin/pending-changes/${changeId}/approve`).then(res => res.data),

  rejectPendingChange: (changeId: string): Promise<ApiResponse<PendingChange>> =>
    api.post(`/admin/pending-changes/${changeId}/reject`).then(res => res.data),

  // Users
  getUsers: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ApiResponse<any>> =>
    api.get('/admin/users', { params }).then(res => res.data),

  updateUserStatus: (userId: string, isActive: boolean): Promise<ApiResponse<any>> =>
    api.patch(`/admin/users/${userId}/status`, { isActive }).then(res => res.data),

  deleteUser: (userId: string): Promise<ApiResponse<any>> =>
    api.delete(`/admin/users/${userId}`).then(res => res.data),

  updateUser: (userId: string, data: any): Promise<ApiResponse<any>> =>
    api.put(`/users/${userId}`, data).then(res => res.data),

  // Mechanics
  getMechanics: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ApiResponse<any>> =>
    api.get('/admin/mechanics', { params }).then(res => res.data),

  updateMechanic: (mechanicId: string, data: any): Promise<ApiResponse<any>> =>
    api.put(`/users/${mechanicId}`, data).then(res => res.data),

  // Shops
  getShops: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ApiResponse<any>> =>
    api.get('/admin/shops', { params }).then(res => res.data),

  updateShop: (shopId: string, data: any): Promise<ApiResponse<any>> =>
    api.put(`/users/${shopId}`, data).then(res => res.data),

  // Products
  getProducts: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ApiResponse<any>> =>
    api.get('/admin/products', { params }).then(res => res.data),

  updateProduct: (productId: string, data: any): Promise<ApiResponse<any>> =>
    api.put(`/products/${productId}`, data).then(res => res.data),

  // Notifications
  getNotifications: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ApiResponse<any>> =>
    api.get('/admin/notifications', { params }).then(res => res.data),

  updateNotificationStatus: (notificationId: string, isRead: boolean): Promise<ApiResponse<any>> =>
    api.patch(`/admin/notifications/${notificationId}/read`, { isRead }).then(res => res.data),

  // Reviews
  getReviews: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ApiResponse<any>> =>
    api.get('/admin/reviews', { params }).then(res => res.data),

  // Analytics
  getAnalytics: (params: { period: string }): Promise<ApiResponse<any>> =>
    api.get('/admin/analytics', { params }).then(res => res.data),

  // Registration
  registerClient: (data: any): Promise<ApiResponse<any>> =>
    api.post('/auth/register', { ...data, role: 'client' }).then(res => res.data),

  registerMechanic: (data: any): Promise<ApiResponse<any>> =>
    api.post('/auth/register', { ...data, role: 'mechanic' }).then(res => res.data),

  registerWorkshop: (data: any): Promise<ApiResponse<any>> =>
    api.post('/auth/register', { ...data, role: 'workshop' }).then(res => res.data),
};