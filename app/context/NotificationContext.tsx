'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  mergeNotificationsFromApi,
  markNotificationRead,
  removeNotification,
  type NotificationItem,
} from '@/lib/store/slices/notificationsSlice';
import {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationsMutation,
} from '@/lib/store/services/apiService';
import { deleteGuestNotification, markGuestRead } from '@/app/helpers/guest-notifications';

export type { NotificationItem };

const PAGE_SIZE = 20;

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  refreshNotifications: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: number | 'all') => Promise<void>;
  deleteNotification: (id: number | 'all') => Promise<void>;
}

export function useNotifications(): NotificationContextType {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const loading = useAppSelector((s) => s.notifications.loading);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const { data, isLoading, refetch } = useGetNotificationsQuery(
    { page: 1, limit: PAGE_SIZE },
    { skip: !isAuthenticated }
  );
  const [fetchPage, { isFetching: loadingMore }] = useLazyGetNotificationsQuery();

  useEffect(() => {
    if (!data) return;
    dispatch(mergeNotificationsFromApi(data.notifications));
    if (data.pagination) {
      setPage(data.pagination.page ?? 1);
      setLastPage(data.pagination.last ?? 1);
    }
  }, [data, dispatch]);

  const [markRead] = useMarkAsReadMutation();
  const [deleteNotifs] = useDeleteNotificationsMutation();

  const refreshNotifications = async () => {
    const result = await refetch();
    if (result.data) {
      dispatch(mergeNotificationsFromApi(result.data.notifications));
      if (result.data.pagination) {
        setPage(result.data.pagination.page ?? 1);
        setLastPage(result.data.pagination.last ?? 1);
      }
    }
  };

  const loadMore = useCallback(async () => {
    if (!isAuthenticated || loadingMore || page >= lastPage) return;
    const result = await fetchPage({ page: page + 1, limit: PAGE_SIZE }).unwrap();
    dispatch(mergeNotificationsFromApi(result.notifications));
    setPage(result.pagination?.page ?? page + 1);
    setLastPage(result.pagination?.last ?? lastPage);
  }, [dispatch, fetchPage, isAuthenticated, lastPage, loadingMore, page]);

  const markAsRead = async (id: number | 'all') => {
    if (isAuthenticated) {
      await markRead({ id });
    } else {
      markGuestRead(id);
    }
    dispatch(markNotificationRead(id));
  };

  const deleteNotification = async (id: number | 'all') => {
    try {
      if (isAuthenticated) {
        await deleteNotifs({ id });
      } else {
        deleteGuestNotification(id);
      }
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
    loadingMore,
    hasMore: isAuthenticated && page < lastPage,
    refreshNotifications,
    loadMore,
    markAsRead,
    deleteNotification,
  };
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
