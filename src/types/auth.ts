export type UserRole = 'client' | 'mechanic' | 'workshop' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
  level?: string;
  levelColor?: string;
  completedBookings?: number;
  totalBookings?: number;
  rating?: number;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}