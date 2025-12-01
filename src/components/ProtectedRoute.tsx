import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useAuthToken } from '@/hooks/useAuthToken';
import { LoadingSpinner } from './ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { accessToken } = useAuthToken();
  const location = useLocation();

  // Check localStorage for admin (for immediate access with mock token)
  const storedUser = localStorage.getItem('user');
  const storedUserData = storedUser ? JSON.parse(storedUser) : null;
  const isAdminWithMockToken = storedUserData?.role === 'admin' && accessToken === 'admin-access-token-123';

  // Show loading while checking session (but not for admin with mock token)
  if (isLoading && !isAdminWithMockToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check authentication (either from context or localStorage for admin)
  const isUserAuthenticated = isAuthenticated || isAdminWithMockToken;
  const currentUser = user || storedUserData;

  // If not authenticated, redirect to login
  if (!isUserAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles && currentUser && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};