'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createConsumer, type Consumer, type Subscription } from '@rails/actioncable';
import { getStoredToken } from '@/app/helpers/auth';
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
  deleteNotification: (id: number | 'all') => Promise<void>;
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

  const deleteNotification = useCallback(async (id: number | 'all') => {
    try {
      const token = getStoredToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/api/v1/notifications/delete_notifications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        if (id === 'all') {
          setNotifications([]);
          setUnreadCount(0);
          toast.success('All notifications deleted');
        } else {
          setNotifications(prev => {
            const removed = prev.find(n => n.id === id);
            if (removed && !removed.read_at) {
              setUnreadCount(count => Math.max(0, count - 1));
            }
            return prev.filter(n => n.id !== id);
          });
          toast.success('Notification deleted');
        }
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error('Failed to delete notification');
    }
  }, []);

  // ── Initial data load when auth state is known ────────────────────────────
  useEffect(() => {
    if (!account) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    refreshNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id]);

  // ── ActionCable subscription — mirrors WalletChannel pattern exactly ───────
  useEffect(() => {
    // Guard: must be authenticated, same as wallet's `if (!profile) return`
    if (!account || !isAuthenticated) return;

    const token = getStoredToken();
    if (!token) return;

    const wsUrl = API_URL.replace(/^http/, 'ws') + '/cable';

    // Synchronous creation — no async wrapper, same as wallet
    const consumer: Consumer = createConsumer(`${wsUrl}?token=${token}`);

    const subscription: Subscription = consumer.subscriptions.create(
      { channel: 'AccountNotificationsChannel' },
      {
        received: (data: any) => {
          console.log('[NotificationCable] Received:', data);

          // Prepend incoming notification optimistically — no extra HTTP request needed
          const newItem: NotificationItem = {
            id: data.notification_id,
            title: data.title,
            message: data.message,
            data: data.data,
            read_at: undefined,
            created_at: data.created_at || new Date().toISOString(),
          };
          setNotifications(prev => [newItem, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Only show toast if the broadcast hasn't flagged that another channel
          // (e.g. WalletChannel) is already handling the user-visible alert
          if (!data.suppress_toast) {
            toast.success(data.message || 'New notification', {
              icon: '🔔',
              duration: 5000,
            });
          }
        },
        connected: () => {
          console.log('[NotificationCable] Connected to AccountNotificationsChannel');
        },
        disconnected: () => {
          console.log('[NotificationCable] Disconnected from AccountNotificationsChannel');
        },
      }
    );

    // Cleanup — same as wallet
    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
    // Only re-run when account identity or auth status changes — NOT refreshNotifications
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id, isAuthenticated]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      refreshNotifications,
      markAsRead,
      deleteNotification
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
