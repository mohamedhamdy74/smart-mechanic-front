import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthToken } from '@/hooks/useAuthToken';
import { api } from '@/lib/api';
import { User, RegisterData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { accessToken, setAuthTokens, clearAuthTokens } = useAuthToken();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error: userQueryError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data as User;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (userQueryError) {
      const message = (userQueryError as any)?.response?.data?.message || 'فشل في تحميل بيانات المستخدم';
      setError(message);
    }
  }, [userQueryError]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post('/auth/login', { email, password });
      return response.data as { accessToken: string; refreshToken: string; user: User };
    },
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(['currentUser'], data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setError(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'فشل في تسجيل الدخول';
      setError(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data: any) => {
      try {
        const { accessToken, refreshToken, user } = data;
        if (accessToken && refreshToken) {
          setAuthTokens(accessToken, refreshToken);
        }
        if (user) {
          queryClient.setQueryData(['currentUser'], user);
          localStorage.setItem('user', JSON.stringify(user));
        }
        setError(null);
      } catch (err) {
        setError(null);
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'فشل في إنشاء الحساب';
      setError(message);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.patch('/users/profile', data);
      return response.data as User;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setError(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'فشل في تحديث الملف الشخصي';
      setError(message);
    },
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      await registerMutation.mutateAsync(userData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    clearAuthTokens();
    queryClient.removeQueries({ queryKey: ['currentUser'] });
    localStorage.removeItem('user');
    setError(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      await updateProfileMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    }
  };

  const clearError = () => setError(null);

  const isLoadingCombined = isLoading ||
    loginMutation.isPending ||
    registerMutation.isPending ||
    updateProfileMutation.isPending;

  const combinedError = error ||
    (loginMutation.error as any)?.response?.data?.message ||
    (registerMutation.error as any)?.response?.data?.message ||
    (updateProfileMutation.error as any)?.response?.data?.message;

  const value: AuthContextType = {
    user: user || null,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user && !!accessToken,
    isLoading: isLoadingCombined,
    error: combinedError,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
