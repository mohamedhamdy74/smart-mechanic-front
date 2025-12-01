import { User } from './auth';
import { Order, PendingChange, Appointment } from './admin';

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  role: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  // Client specific fields
  carBrand?: string;
  carModel?: string;
  carYear?: string;
  plateNumber?: string;
  lastMaintenance?: string;
  dealership?: string;
  mileage?: number;
  // Mechanic specific fields
  skills?: string[];
  experienceYears?: number;
  specialty?: string;
  // Workshop specific fields
  workshopName?: string;
  workshopAddress?: string;
  description?: string;
  services?: string[];
  workingHours?: string;
}

export interface RegisterResponse {
  message: string;
}

// User API
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  location?: string;
}

export interface UpdateUserResponse {
  user: User;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  pages: number;
}

// Product API
export interface Product {
  _id: string;
  userId: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  inStock: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  brand: string;
  price: number;
  stock: number;
  inStock: boolean;
  images: File[];
}

export interface UpdateProductRequest {
  name?: string;
  brand?: string;
  price?: number;
  stock?: number;
  inStock?: boolean;
  images?: File[];
}

export interface ListProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

// Order API
export interface CreateOrderRequest {
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

export interface UpdateOrderRequest {
  status: string;
}

export interface ListOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

// Car API
export interface Car {
  _id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineCapacity: string;
  ownershipStatus: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarRequest {
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineCapacity: string;
  ownershipStatus: string;
  images: File[];
}

export interface UpdateCarRequest {
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  engineCapacity?: string;
  ownershipStatus?: string;
  images?: File[];
}

export interface ListCarsResponse {
  cars: Car[];
  total: number;
  page: number;
  pages: number;
}

// Common API Response structure for success/error
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

// Common Pagination Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Common Sort Parameters
export interface SortParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// Common Filter Parameters
export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}