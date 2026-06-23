'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addNotification, setNotifications } from '@/lib/store/slices/notificationsSlice';
import { getOrCreateGuestId } from '@/app/helpers/guest-id';
import { appendGuestNotification, loadGuestNotifications } from '@/app/helpers/guest-notifications';
import { showNotificationToast } from '@/app/helpers/notification-display';
import {
  isWebPushConfigured,
  listenForForegroundPush,
  registerWebPushDevice,
} from '@/app/helpers/push-notifications';

const toastedKeys = new Set<string>();

function handleForegroundNotification(
  dispatch: ReturnType<typeof useAppDispatch>,
  payload: { title?: string; body?: string; data?: Record<string, string> },
  isAuthenticated: boolean
) {
  const rawId = payload.data?.notification_id;
  const notificationId =
    rawId != null && rawId !== '' ? Number(rawId) : -Date.now();
  const toastKey = `notification-${notificationId}`;

  const item = {
    id: Number.isFinite(notificationId) ? notificationId : -Date.now(),
    title: payload.title ?? 'Notification',
    message: payload.body ?? '',
    data: payload.data,
    read_at: undefined as string | undefined,
    created_at: new Date().toISOString(),
  };

  if (isAuthenticated) {
    dispatch(addNotification(item));
  } else {
    appendGuestNotification(item);
    dispatch(addNotification(item));
  }

  const text = payload.body || payload.title;
  if (text && !toastedKeys.has(toastKey)) {
    toastedKeys.add(toastKey);
    if (toastedKeys.size > 200) {
      const oldest = toastedKeys.values().next().value;
      if (oldest) toastedKeys.delete(oldest);
    }
    showNotificationToast({
      title: payload.title,
      message: payload.body,
      data: payload.data,
      id: toastKey,
    });
  }
}

export default function PushNotificationRegistrar() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const syncPushRegistration = useCallback(async () => {
    if (!isWebPushConfigured()) return;

    const guestId = getOrCreateGuestId();
    if (isAuthenticated && token) {
      await registerWebPushDevice({ authToken: token, guestId });
    } else {
      await registerWebPushDevice({ guestId });
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated) {
      const guestItems = loadGuestNotifications();
      if (guestItems.length > 0) {
        dispatch(setNotifications(guestItems));
      }
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    syncPushRegistration();

    listenForForegroundPush((payload) => {
      handleForegroundNotification(dispatch, payload, isAuthenticatedRef.current);
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
  }, [syncPushRegistration, dispatch]);

  return null;
}
