import { api } from '@/lib/api';
import { handleAsyncError } from '@/utils/errorHandling';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  location?: string;
}

export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const result = await handleAsyncError(
      () => api.post('/auth/login', credentials)
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'فشل في تسجيل الدخول');
    }

    return result.data.data;
  }

  // Register user
  async register(userData: RegisterData): Promise<AuthResponse> {
    const result = await handleAsyncError(
      () => api.post('/auth/register', userData)
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'فشل في إنشاء الحساب');
    }

    return result.data.data;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Logout should work even if the API call fails
      console.warn('Logout API call failed:', error);
    }

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Refresh access token
  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const result = await handleAsyncError(
      () => api.post('/auth/refresh', { refreshToken })
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'فشل في تجديد الجلسة');
    }

    return result.data.data;
  }

  // Verify token
  async verifyToken(): Promise<any> {
    const result = await handleAsyncError(
      () => api.get('/auth/verify')
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'الجلسة غير صالحة');
    }

    return result.data.data;
  }

  // Update user profile
  async updateProfile(userData: Partial<any>): Promise<any> {
    const result = await handleAsyncError(
      () => api.patch('/users/profile', userData)
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'فشل في تحديث الملف الشخصي');
    }

    return result.data.data;
  }

  // Update user location
  async updateLocation(latitude: number, longitude: number): Promise<any> {
    const result = await handleAsyncError(
      () => api.patch('/users/location', { latitude, longitude })
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'فشل في تحديث الموقع');
    }

    return result.data;
  }

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    const result = await handleAsyncError(
      () => api.patch('/auth/change-password', data)
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'فشل في تغيير كلمة المرور');
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    const result = await handleAsyncError(
      () => api.post('/auth/forgot-password', { email })
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'فشل في إرسال رابط إعادة التعيين');
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const result = await handleAsyncError(
      () => api.post('/auth/reset-password', { token, password: newPassword })
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'فشل في إعادة تعيين كلمة المرور');
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<any> {
    const result = await handleAsyncError(
      () => api.get('/users/profile')
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'فشل في جلب بيانات المستخدم');
    }

    return result.data.data;
  }
}

export const authService = new AuthService();