'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging';
import { getApiBaseUrl } from '@/app/helpers/businesses';
import { getOrCreateGuestId } from '@/app/helpers/guest-id';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export type WebPushPermissionStatus = 'granted' | 'denied' | 'default';

function isConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      process.env.NEXT_PUBLIC_FCM_VAPID_KEY
  );
}

async function registerMessagingServiceWorker() {
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  const sendConfig = (worker: ServiceWorker | null | undefined) => {
    worker?.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig });
  };

  if (registration.installing) {
    registration.installing.addEventListener('statechange', () => {
      if (registration.active) sendConfig(registration.active);
    });
  }

  await navigator.serviceWorker.ready;
  sendConfig(registration.active ?? navigator.serviceWorker.controller);

  return registration;
}

let messagingInstance: Messaging | null = null;

async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined' || !isConfigured()) return null;
  const supported = await isSupported();
  if (!supported) return null;
  if (!messagingInstance) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
}

export function getWebPushPermissionStatus(): WebPushPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  const permission = Notification.permission;
  if (permission === 'granted') return 'granted';
  if (permission === 'denied') return 'denied';
  return 'default';
}

export type RegisterWebPushOptions = {
  authToken?: string | null;
  guestId?: string | null;
};

/** Register only when permission is already granted (no browser prompt). */
export async function registerWebPushDevice(options: RegisterWebPushOptions = {}): Promise<string | null> {
  if (getWebPushPermissionStatus() !== 'granted') return null;
  const fcmToken = await fetchFcmToken();
  if (!fcmToken) return null;
  await submitWebPushRegistration(fcmToken, options);
  return fcmToken;
}

/** Request permission, then register guest or account device. */
export async function requestWebPushPermissionAndRegister(options: RegisterWebPushOptions = {}): Promise<string | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    if (result !== 'granted') return null;
  } else if (Notification.permission !== 'granted') {
    return null;
  }

  const fcmToken = await fetchFcmToken();
  if (!fcmToken) return null;

  await submitWebPushRegistration(fcmToken, options);
  return fcmToken;
}

async function fetchFcmToken(): Promise<string | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
  if (!vapidKey) return null;

  const registration = await registerMessagingServiceWorker();
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
}

async function submitWebPushRegistration(fcmToken: string, options: RegisterWebPushOptions): Promise<void> {
  const guestId = options.guestId ?? getOrCreateGuestId();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.authToken) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }

  await fetch(`${getApiBaseUrl()}/api/v1/push_devices`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ token: fcmToken, platform: 'web', guest_id: guestId }),
  });
}

export async function unregisterWebPushDevice(options: {
  authToken?: string | null;
  guestId?: string | null;
  fcmToken: string;
}): Promise<void> {
  const { fcmToken } = options;
  if (!fcmToken) return;

  const guestId = options.guestId ?? getOrCreateGuestId();
  const headers: Record<string, string> = {};
  if (options.authToken) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }

  const url = new URL(`${getApiBaseUrl()}/api/v1/push_devices/${encodeURIComponent(fcmToken)}`);
  if (!options.authToken && guestId) {
    url.searchParams.set('guest_id', guestId);
  }

  await fetch(url.toString(), {
    method: 'DELETE',
    headers,
  }).catch(() => {});
}

export async function listenForForegroundPush(onPayload: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    onPayload({
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: payload.data as Record<string, string> | undefined,
    });
  });
}

export function isWebPushConfigured() {
  return isConfigured();
}
