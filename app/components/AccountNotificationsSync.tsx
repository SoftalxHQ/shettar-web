'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addNotification } from '@/lib/store/slices/notificationsSlice';
import { getStoredToken, hasAuthSession, isUsableJwt } from '@/app/helpers/auth';
import { subscribeAccountNotifications } from '@/app/helpers/account-notifications-cable';
import { consumeNotificationToastKey, showNotificationToast } from '@/app/helpers/notification-display';

export default function AccountNotificationsSync() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    const sessionToken = isUsableJwt(token) ? token : getStoredToken();
    if (!hasAuthSession() && !isUsableJwt(sessionToken) && !isAuthenticated) return;

    return subscribeAccountNotifications((data) => {
      const notificationId = data.notification_id ?? -Date.now();
      const toastKey = `notification-${notificationId}`;

      dispatch(
        addNotification({
          id: notificationId,
          title: data.title ?? 'Notification',
          message: data.message ?? '',
          data: data.data,
          read_at: undefined,
          created_at: data.created_at || new Date().toISOString(),
        })
      );

      if (!data.suppress_toast && consumeNotificationToastKey(toastKey)) {
        showNotificationToast({
          title: data.title,
          message: data.message,
          data: data.data,
          id: toastKey,
        });
      }
    }, sessionToken);
  }, [token, isAuthenticated, dispatch]);

  return null;
}
