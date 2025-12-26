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
  getStats: (): Promise<SystemStats> =>
    (api.get('/admin/stats').then(res => res.data)) as any,

  // Orders
  getOrders: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ListOrdersResponse> =>
    (api.get('/admin/orders', { params }).then(res => res.data)) as any,

  updateOrderStatus: (orderId: string, status: string): Promise<Order> =>
    (api.patch(`/admin/orders/${orderId}/status`, { status }).then(res => res.data)) as any,

  // Appointments
  getAppointments: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ListAppointmentsResponse> =>
    (api.get('/admin/appointments', { params }).then(res => res.data)) as any,

  updateAppointmentStatus: (appointmentId: string, status: string): Promise<Appointment> =>
    (api.patch(`/admin/appointments/${appointmentId}/status`, { status }).then(res => res.data)) as any,

  // Pending Changes
  getPendingChanges: (params: PaginationParams & SortParams & FilterParams = {}): Promise<ListPendingChangesResponse> =>
    (api.get('/admin/pending-changes', { params }).then(res => res.data)) as any,

  approvePendingChange: (changeId: string): Promise<PendingChange> =>
    (api.post(`/admin/pending-changes/${changeId}/approve`).then(res => res.data)) as any,

  rejectPendingChange: (changeId: string): Promise<PendingChange> =>
    (api.post(`/admin/pending-changes/${changeId}/reject`).then(res => res.data)) as any,

  // Pending Registrations
  getPendingRegistrations: (): Promise<any> =>
    (api.get('/admin/pending-registrations').then(res => res.data)) as any,

  approveRegistration: (userId: string): Promise<any> =>
    (api.post(`/admin/pending-registrations/${userId}/approve`).then(res => res.data)) as any,

  // Users
  getUsers: (params: PaginationParams & SortParams & FilterParams = {}): Promise<any> =>
    (api.get('/admin/users', { params }).then(res => res.data)) as any,

  updateUserStatus: (userId: string, isActive: boolean): Promise<any> =>
    (api.patch(`/admin/users/${userId}/status`, { isActive }).then(res => res.data)) as any,

  deleteUser: (userId: string): Promise<any> =>
    (api.delete(`/admin/users/${userId}`).then(res => res.data)) as any,

  updateUser: (userId: string, data: any): Promise<any> =>
    (api.put(`/users/${userId}`, data).then(res => res.data)) as any,

  // Mechanics
  getMechanics: (params: PaginationParams & SortParams & FilterParams = {}): Promise<any> =>
    (api.get('/admin/mechanics', { params }).then(res => res.data)) as any,

  updateMechanic: (mechanicId: string, data: any): Promise<any> =>
    (api.put(`/users/${mechanicId}`, data).then(res => res.data)) as any,

  // Shops
  getShops: (params: PaginationParams & SortParams & FilterParams = {}): Promise<any> =>
    (api.get('/admin/shops', { params }).then(res => res.data)) as any,

  updateShop: (shopId: string, data: any): Promise<any> =>
    (api.put(`/users/${shopId}`, data).then(res => res.data)) as any,

  // Products
  getProducts: (params: PaginationParams & SortParams & FilterParams = {}): Promise<any> =>
    (api.get('/admin/products', { params }).then(res => res.data)) as any,

  updateProduct: (productId: string, data: any): Promise<any> =>
    (api.put(`/products/${productId}`, data).then(res => res.data)) as any,

  // Notifications
  getNotifications: (params: PaginationParams & SortParams & FilterParams = {}): Promise<any> =>
    (api.get('/admin/notifications', { params }).then(res => res.data)) as any,

  updateNotificationStatus: (notificationId: string, isRead: boolean): Promise<any> =>
    (api.patch(`/admin/notifications/${notificationId}/read`, { isRead }).then(res => res.data)) as any,

  // Reviews
  getReviews: (params: PaginationParams & SortParams & FilterParams = {}): Promise<any> =>
    (api.get('/admin/reviews', { params }).then(res => res.data)) as any,

  // Analytics
  getAnalytics: (params: { period: string }): Promise<any> =>
    (api.get('/admin/analytics', { params }).then(res => res.data)) as any,

  // Activities
  getActivities: (): Promise<{ activities: any[] }> =>
    (api.get('/admin/activities').then(res => res.data)) as any,

  // Registration
  registerClient: (data: any): Promise<any> =>
    (api.post('/auth/register', { ...data, role: 'client' }).then(res => res.data)) as any,

  registerMechanic: (data: any): Promise<any> =>
    (api.post('/auth/register', { ...data, role: 'mechanic' }).then(res => res.data)) as any,

  registerWorkshop: (data: any): Promise<any> =>
    (api.post('/auth/register', { ...data, role: 'workshop' }).then(res => res.data)) as any,
};