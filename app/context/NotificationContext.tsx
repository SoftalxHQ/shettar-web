'use client';

import React from 'react';
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
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const loading = useAppSelector((s) => s.notifications.loading);

  const { refetch } = useGetNotificationsQuery();
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
    await deleteNotifs({ id });
    dispatch(removeNotification(id));
  };

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    deleteNotification,
  };
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
