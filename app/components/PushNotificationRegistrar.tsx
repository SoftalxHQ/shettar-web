'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { isCableJwtUsable } from '@/app/helpers/jwt-cable';
import { getOrCreateGuestId } from '@/app/helpers/guest-id';
import {
  isWebPushConfigured,
  listenForForegroundPush,
  registerWebPushDevice,
} from '@/app/helpers/push-notifications';

export default function PushNotificationRegistrar() {
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isWebPushConfigured()) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const guestId = getOrCreateGuestId();

    if (isAuthenticated && isCableJwtUsable(token)) {
      registerWebPushDevice({ authToken: token, guestId });
    } else {
      registerWebPushDevice({ guestId });
    }

    listenForForegroundPush((payload) => {
      const route = payload.data?.route;
      if (route) router.push(route);
    }).then((unsub) => {
      if (!cancelled) unsubscribe = unsub;
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [token, isAuthenticated, router]);

  return null;
}
