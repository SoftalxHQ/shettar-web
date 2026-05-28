'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { isCableJwtUsable } from '@/app/helpers/jwt-cable';
import {
  isWebPushConfigured,
  listenForForegroundPush,
  registerWebPushDevice,
  unregisterWebPushDevice,
} from '@/app/helpers/push-notifications';

export default function PushNotificationRegistrar() {
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const fcmTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isWebPushConfigured() || !isCableJwtUsable(token)) return;

    registerWebPushDevice(token).then((fcmToken) => {
      fcmTokenRef.current = fcmToken;
    });

    let unsubscribe: (() => void) | undefined;
    listenForForegroundPush((payload) => {
      const route = payload.data?.route;
      if (route) router.push(route);
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      unsubscribe?.();
      if (fcmTokenRef.current && token) {
        unregisterWebPushDevice(token, fcmTokenRef.current);
      }
    };
  }, [token, router]);

  return null;
}
