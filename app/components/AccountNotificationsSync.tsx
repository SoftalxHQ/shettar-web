'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addNotification } from '@/lib/store/slices/notificationsSlice';
import { saveAuthSession, getStoredUser } from '@/app/helpers/auth';
import { isCableJwtUsable } from '@/app/helpers/jwt-cable';
import { subscribeAccountNotifications } from '@/app/helpers/account-notifications-cable';
import { showNotificationToast } from '@/app/helpers/notification-display';

const toastedKeys = new Set<string>();

export default function AccountNotificationsSync() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (!isCableJwtUsable(token)) return;

    const user = getStoredUser();
    if (user && token) saveAuthSession(user, token);

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

      if (!data.suppress_toast && !toastedKeys.has(toastKey)) {
        toastedKeys.add(toastKey);
        if (toastedKeys.size > 200) {
          const oldest = toastedKeys.values().next().value;
          if (oldest) toastedKeys.delete(oldest);
        }
        showNotificationToast({
          title: data.title,
          message: data.message,
          data: data.data,
          id: toastKey,
        });
      }
    }, token);
  }, [token, dispatch]);

  return null;
}
