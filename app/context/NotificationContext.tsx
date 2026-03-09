'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createConsumer, type Consumer, type Subscription } from '@rails/actioncable';
import { getStoredToken, getStoredUser } from '@/app/helpers/auth';
import toast from 'react-hot-toast';
import { useLayoutContext } from '@/app/states';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  data?: any;
  read_at?: string;
  created_at: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number | 'all') => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { account, isAuthenticated } = useLayoutContext();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/api/v1/notifications/unread_count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        // Also update unread count based on what we fetched
        const unread = (data.notifications || []).filter((n: any) => !n.read_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Refresh notifications error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number | 'all') => {
    try {
      const token = getStoredToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/api/v1/notifications/mark_as_read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        if (id === 'all') {
          setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
          setUnreadCount(0);
        } else {
          setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  }, []);

  useEffect(() => {
    let consumer: Consumer | null = null;
    let subscription: Subscription | null = null;
    let isActive = true;

    const setupActionCable = async () => {
      const token = getStoredToken();

      if (!token || !account) {
        if (isActive) {
          setNotifications([]);
          setUnreadCount(0);
        }
        return;
      }

      if (isActive) refreshNotifications();

      try {
        const wsUrl = API_URL.replace(/^http/, 'ws') + '/cable';
        consumer = createConsumer(`${wsUrl}?token=${token}`);

        subscription = consumer.subscriptions.create(
          { channel: 'AccountNotificationsChannel' },
          {
            received: (data: any) => {
              console.log('[NotificationCable] Received:', data);
              // Optimistically update or just refresh
              refreshNotifications();

              // Show toast for new notification
              toast.success(data.message || 'New notification', {
                icon: '🔔',
                duration: 5000,
              });
            },
            connected: () => {
              console.log('[NotificationCable] Connected');
              refreshNotifications();
            },
            disconnected: () => console.log('[NotificationCable] Disconnected'),
          }
        );
      } catch (err) {
        console.error('NotificationCable setup error:', err);
      }
    };

    setupActionCable();

    return () => {
      isActive = false;
      if (subscription) subscription.unsubscribe();
      if (consumer) consumer.disconnect();
    };
  }, [refreshNotifications, account, isAuthenticated]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      refreshNotifications,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
