'use client';

import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addNotification } from '@/lib/store/slices/notificationsSlice';
import { isCableJwtUsable } from '@/app/helpers/jwt-cable';
import { getOrCreateGuestId } from '@/app/helpers/guest-id';
import {
  isWebPushConfigured,
  listenForForegroundPush,
  registerWebPushDevice,
} from '@/app/helpers/push-notifications';

const toastedKeys = new Set<string>();

export default function PushNotificationRegistrar() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const syncPushRegistration = useCallback(async () => {
    if (!isWebPushConfigured()) return;

    const guestId = getOrCreateGuestId();
    // Use API auth whenever logged in; do not gate on ActionCable JWT shape.
    if (isAuthenticated && token) {
      await registerWebPushDevice({ authToken: token, guestId });
    } else {
      await registerWebPushDevice({ guestId });
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    syncPushRegistration();

    listenForForegroundPush((payload) => {
      if (isAuthenticated && isCableJwtUsable(token)) {
        const rawId = payload.data?.notification_id;
        const notificationId =
          rawId != null && rawId !== '' ? Number(rawId) : -Date.now();
        const toastKey = `notification-${notificationId}`;

        dispatch(
          addNotification({
            id: Number.isFinite(notificationId) ? notificationId : -Date.now(),
            title: payload.title ?? 'Notification',
            message: payload.body ?? '',
            data: payload.data,
            read_at: undefined,
            created_at: new Date().toISOString(),
          })
        );

        const text = payload.body || payload.title;
        if (text && !toastedKeys.has(toastKey)) {
          toastedKeys.add(toastKey);
          if (toastedKeys.size > 200) {
            const oldest = toastedKeys.values().next().value;
            if (oldest) toastedKeys.delete(oldest);
          }
          toast.success(text, { icon: '🔔', duration: 5000, id: toastKey });
        }
      }
    }).then((unsub) => {
      if (!cancelled) unsubscribe = unsub;
    });

    const onFocus = () => {
      syncPushRegistration();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      cancelled = true;
      unsubscribe?.();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [syncPushRegistration, dispatch, isAuthenticated, token]);

  return null;
}
