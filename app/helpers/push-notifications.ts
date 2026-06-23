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
  const ok = await submitWebPushRegistration(fcmToken, options);
  return ok ? fcmToken : null;
}

/** Request permission, then register guest or account device. */
export type WebPushRegisterResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'denied' | 'unsupported' | 'not_configured' | 'token_failed' | 'register_failed' };

export async function requestWebPushPermissionAndRegister(
  options: RegisterWebPushOptions = {}
): Promise<WebPushRegisterResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { ok: false, reason: 'unsupported' };
  }

  // Always prompt in the user-gesture handler before Firebase / service worker work.
  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    if (result !== 'granted') return { ok: false, reason: 'denied' };
  } else if (Notification.permission !== 'granted') {
    return { ok: false, reason: 'denied' };
  }

  if (!isConfigured()) {
    return { ok: false, reason: 'not_configured' };
  }

  const messaging = await getMessagingInstance();
  if (!messaging) return { ok: false, reason: 'unsupported' };

  const fcmToken = await fetchFcmToken();
  if (!fcmToken) return { ok: false, reason: 'token_failed' };

  const ok = await submitWebPushRegistration(fcmToken, options);
  return ok ? { ok: true, token: fcmToken } : { ok: false, reason: 'register_failed' };
}

async function fetchFcmToken(): Promise<string | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
  if (!vapidKey) return null;

  const registration = await registerMessagingServiceWorker();
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
}

const MAX_REGISTRATION_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [1500, 3000, 6000];

function registrationRetryDelayMs(attempt: number): number {
  return RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)] ?? 6000;
}

async function submitWebPushRegistration(
  fcmToken: string,
  options: RegisterWebPushOptions,
  attempt = 1
): Promise<boolean> {
  const guestId = options.guestId ?? getOrCreateGuestId();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.authToken) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/push_devices`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token: fcmToken, platform: 'web', guest_id: guestId }),
    });

    if (response.ok) return true;

    const body = await response.text().catch(() => '');
    console.warn(`[web-push] Registration failed (${response.status}): ${body}`);

    if (attempt < MAX_REGISTRATION_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, registrationRetryDelayMs(attempt)));
      return submitWebPushRegistration(fcmToken, options, attempt + 1);
    }
  } catch (error) {
    console.warn('[web-push] Registration error:', error);
    if (attempt < MAX_REGISTRATION_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, registrationRetryDelayMs(attempt)));
      return submitWebPushRegistration(fcmToken, options, attempt + 1);
    }
  }

  return false;
}

/** Re-register push device with account auth immediately after login/sign-up. */
export async function syncPushRegistrationAfterAuth(authToken: string): Promise<boolean> {
  if (!isConfigured() || getWebPushPermissionStatus() !== 'granted') return false;
  const guestId = getOrCreateGuestId();
  const fcmToken = await registerWebPushDevice({ authToken, guestId });
  return fcmToken != null;
}

export async function unregisterWebPushDevice(options: {
  authToken?: string | null;
  guestId?: string | null;
  fcmToken?: string | null;
}): Promise<void> {
  const token = options.fcmToken ?? (getWebPushPermissionStatus() === 'granted' ? await fetchFcmToken().catch(() => null) : null);
  if (!token) return;

  const guestId = options.guestId ?? getOrCreateGuestId();
  const headers: Record<string, string> = {};
  if (options.authToken) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }

  const url = new URL(`${getApiBaseUrl()}/api/v1/push_devices/${encodeURIComponent(token)}`);
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
