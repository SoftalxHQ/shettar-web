'use client';

import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  setNotifications,
  markNotificationRead,
  removeNotification,
  type NotificationItem,
} from '@/lib/store/slices/notificationsSlice';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationsMutation,
} from '@/lib/store/services/apiService';

export type { NotificationItem };

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number | 'all') => Promise<void>;
  deleteNotification: (id: number | 'all') => Promise<void>;
}

export function useNotifications(): NotificationContextType {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const loading = useAppSelector((s) => s.notifications.loading);

  // Skip when not authenticated to avoid 401 → logout loop
  const { data, isLoading, refetch } = useGetNotificationsQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Sync RTK Query cache into the notifications slice whenever data arrives
  useEffect(() => {
    if (data) {
      dispatch(setNotifications(data));
    }
  }, [data, dispatch]);

  const [markRead] = useMarkAsReadMutation();
  const [deleteNotifs] = useDeleteNotificationsMutation();

  const refreshNotifications = async () => {
    const result = await refetch();
    if (result.data) {
      dispatch(setNotifications(result.data));
    }
  };

  const markAsRead = async (id: number | 'all') => {
    await markRead({ id });
    dispatch(markNotificationRead(id));
  };

  const deleteNotification = async (id: number | 'all') => {
    try {
      await deleteNotifs({ id });
      dispatch(removeNotification(id));
      toast.success(id === 'all' ? 'All notifications deleted' : 'Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  return {
    notifications,
    unreadCount,
    loading: loading || isLoading,
    refreshNotifications,
    markAsRead,
    deleteNotification,
  };
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
