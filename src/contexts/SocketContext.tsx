import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useQuery } from '@tanstack/react-query';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  userLocation: {lat: number, lng: number} | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();

  // Get user location using React Query for better caching
  const { data: userLocation } = useQuery({
    queryKey: ['user-location', user?._id],
    queryFn: async (): Promise<{lat: number, lng: number} | null> => {
      if (!navigator.geolocation || !user?._id) {
        // Return default location for Cairo, Egypt if geolocation not available
        return { lat: 30.0444, lng: 31.2357 };
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.log('Geolocation error:', error);
            // Fallback to default location
            resolve({ lat: 30.0444, lng: 31.2357 });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      });
    },
    staleTime: 300000, // Consider location fresh for 5 minutes
    refetchInterval: 600000, // Refetch every 10 minutes for location updates
    enabled: !!user?._id
  });

  // Store dismissed notification IDs in localStorage
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedNotifications');
    if (dismissed) {
      try {
        setDismissedNotifications(new Set(JSON.parse(dismissed)));
      } catch (error) {
        console.error('Error parsing dismissed notifications:', error);
      }
    }
  }, []);

  // Fetch notifications from backend
  const { data: notificationsData } = useQuery({
    queryKey: ['user-notifications', user?._id],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');

      const response = await fetch(`http://127.0.0.1:5000/notifications?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!user?._id,
    staleTime: 30000,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });


  // Process notifications from API
  useEffect(() => {
    console.log('Processing notifications data:', notificationsData);
    if (!notificationsData || !notificationsData.notifications || !Array.isArray(notificationsData.notifications)) {
      console.log('No notifications data or not an array');
      return;
    }

    const apiNotifications = notificationsData.notifications.map((notification: any) => ({
      id: notification._id,
      message: notification.message || notification.title,
      type: notification.type || 'info',
      bookingId: notification.data?.orderId || notification._id,
      serviceType: notification.data?.serviceType || '',
      createdAt: notification.createdAt,
      read: notification.read || false
    }));

    console.log('Processed notifications:', apiNotifications);

    // Update notifications state
    setNotifications(prevNotifications => {
      const existingIds = new Set(prevNotifications.map(n => n.id));
      const uniqueNewNotifications = apiNotifications.filter(n =>
        !existingIds.has(n.id) && !dismissedNotifications.has(n.id)
      );
      console.log('Unique new notifications:', uniqueNewNotifications);
      return [...prevNotifications, ...uniqueNewNotifications];
    });
  }, [notificationsData, dismissedNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await fetch(`http://127.0.0.1:5000/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await fetch(`http://127.0.0.1:5000/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotifications = () => {
    // Add all current notifications to dismissed
    setNotifications(current => {
      const newDismissed = new Set(dismissedNotifications);
      current.forEach(notification => newDismissed.add(notification.id));
      localStorage.setItem('dismissedNotifications', JSON.stringify([...newDismissed]));
      setDismissedNotifications(newDismissed);
      return []; // Clear all notifications
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      userLocation,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};