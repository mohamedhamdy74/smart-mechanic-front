import axios from 'axios';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  ListUsersResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductsResponse,
  Product,
  CreateOrderRequest,
  UpdateOrderRequest,
  ListOrdersResponse,
  CreateCarRequest,
  UpdateCarRequest,
  ListCarsResponse,
  Car,
  ApiResponse,
  PaginationParams,
  SortParams,
  FilterParams
} from '@/types/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
  timeout: 10000, // 10 second timeout
}) as typeof axios;

console.log('API baseURL set to:', api.defaults.baseURL);

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the access token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken
          });

          const newAccessToken = (refreshResponse.data as { accessToken: string }).accessToken;

          // Update stored token
          localStorage.setItem('accessToken', newAccessToken);

          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    // If it's not a 401 or refresh failed, reject with original error
    return Promise.reject(error);
  }
);

// Helper function to build query string from params
const buildQueryString = (params: PaginationParams & SortParams & FilterParams = {}) => {
  const { page, limit, sortBy, order, ...filters } = params;
  const searchParams = new URLSearchParams();

  if (page) searchParams.append('page', String(page));
  if (limit) searchParams.append('limit', String(limit));
  if (sortBy) searchParams.append('sortBy', sortBy);
  if (order) searchParams.append('order', order);

  // Add any additional filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Auth endpoints
export const authApi = {
  login: (data: LoginRequest) =>
    api.post('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post('/auth/register', data),
};

// User endpoints
export const userApi = {
  getAll: (params: PaginationParams & SortParams & FilterParams = {}) =>
    api.get(`/users${buildQueryString(params)}`),

  getById: (id: string) =>
    api.get(`/users/${id}`),

  update: (id: string, data: UpdateUserRequest) =>
    api.put(`/users/${id}`, data),

  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

// Product endpoints
export const productApi = {
  getAll: (params: PaginationParams & SortParams & FilterParams = {}) =>
    api.get(`/products${buildQueryString(params)}`),

  getById: (id: string) =>
    api.get(`/products/${id}`),

  create: (data: CreateProductRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => formData.append('images', file));
      } else {
        formData.append(key, String(value));
      }
    });
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: (id: string, data: UpdateProductRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => formData.append('images', file));
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id: string) =>
    api.delete(`/products/${id}`),
};

// Order endpoints
export const orderApi = {
  getAll: (params: PaginationParams & SortParams & FilterParams = {}) =>
    api.get(`/orders${buildQueryString(params)}`),

  getById: (id: string) =>
    api.get(`/orders/${id}`),

  create: (data: CreateOrderRequest) =>
    api.post('/orders', data),

  update: (id: string, data: UpdateOrderRequest) =>
    api.put(`/orders/${id}`, data),

  delete: (id: string) =>
    api.delete(`/orders/${id}`),
};

// Car endpoints
export const carApi = {
  getAll: (params: PaginationParams & SortParams & FilterParams = {}) =>
    api.get(`/cars${buildQueryString(params)}`),

  getById: (id: string) =>
    api.get(`/cars/${id}`),

  create: (data: CreateCarRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => formData.append('images', file));
      } else {
        formData.append(key, String(value));
      }
    });
    return api.post('/cars', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: (id: string, data: UpdateCarRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => formData.append('images', file));
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    return api.put(`/cars/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id: string) =>
    api.delete(`/cars/${id}`),
};