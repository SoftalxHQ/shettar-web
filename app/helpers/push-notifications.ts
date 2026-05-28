'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging';
import { getApiBaseUrl } from '@/app/helpers/businesses';
import { getStoredToken } from '@/app/helpers/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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

export async function registerWebPushDevice(authToken?: string | null): Promise<string | null> {
  const token = authToken ?? getStoredToken();
  if (!token) return null;

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    if (result !== 'granted') return null;
  } else if (Notification.permission !== 'granted') {
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
  if (!vapidKey) return null;

  const registration = await registerMessagingServiceWorker();
  const fcmToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });

  if (!fcmToken) return null;

  await fetch(`${getApiBaseUrl()}/api/v1/push_devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token: fcmToken, platform: 'web' }),
  });

  return fcmToken;
}

export async function unregisterWebPushDevice(authToken: string | null, fcmToken: string): Promise<void> {
  if (!authToken || !fcmToken) return;
  await fetch(`${getApiBaseUrl()}/api/v1/push_devices/${encodeURIComponent(fcmToken)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
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
