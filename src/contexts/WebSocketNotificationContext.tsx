import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  message: string;
  type: string;
  bookingId: string;
  serviceType: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isConnected: boolean;
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
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

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

  // Fetch notifications using React Query
  const { data: notificationsData } = useQuery({
    queryKey: ['user-notifications', user?._id],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data as { notifications: any[]; total: number; page: number; pages: number };
    },
    enabled: !!user?._id && isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute as backup
  });

  // Process notifications from API
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!notificationsData?.notifications || !Array.isArray(notificationsData.notifications)) {
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

    setNotifications(prevNotifications => {
      const existingIds = new Set(prevNotifications.map(n => n.id));
      const uniqueNewNotifications = apiNotifications.filter(n =>
        !existingIds.has(n.id) && !dismissedNotifications.has(n.id)
      );
      return [...prevNotifications, ...uniqueNewNotifications];
    });
  }, [notificationsData, dismissedNotifications]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?._id || !isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Create socket connection
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to notification server');
      setIsConnected(true);
      // Join user-specific room
      newSocket.emit('join', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification server');
      setIsConnected(false);
    });

    // Listen for new notifications
    newSocket.on('notification', (notificationData: any) => {
      console.log('Received notification:', notificationData);

      const newNotification: Notification = {
        id: notificationData._id,
        message: notificationData.message || notificationData.title,
        type: notificationData.type || 'info',
        bookingId: notificationData.data?.orderId || notificationData._id,
        serviceType: notificationData.data?.serviceType || '',
        createdAt: notificationData.createdAt,
        read: false
      };

      setNotifications(prev => {
        // Check if notification already exists
        const exists = prev.some(n => n.id === newNotification.id);
        if (exists || dismissedNotifications.has(newNotification.id)) {
          return prev;
        }
        return [newNotification, ...prev];
      });

      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['user-notifications', user._id] });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, isAuthenticated, dismissedNotifications, queryClient]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);

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
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/mark-all-read');

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(current => {
      const newDismissed = new Set(dismissedNotifications);
      current.forEach(notification => newDismissed.add(notification.id));
      localStorage.setItem('dismissedNotifications', JSON.stringify([...newDismissed]));
      setDismissedNotifications(newDismissed);
      return [];
    });
  }, [dismissedNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      isConnected,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};