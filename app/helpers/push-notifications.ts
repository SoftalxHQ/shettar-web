'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging';
import { getApiBaseUrl } from '@/app/helpers/businesses';
import { getStoredToken } from '@/app/helpers/auth';
import { getOrCreateGuestId } from '@/app/helpers/guest-id';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export type WebPushPermissionStatus = 'granted' | 'denied' | 'default';

export function getWebPushConfigIssues(): string[] {
  const issues: string[] = [];
  if (!firebaseConfig.apiKey) issues.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) issues.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) issues.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) issues.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.messagingSenderId) issues.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId) issues.push('NEXT_PUBLIC_FIREBASE_APP_ID');
  if (!process.env.NEXT_PUBLIC_FCM_VAPID_KEY) issues.push('NEXT_PUBLIC_FCM_VAPID_KEY');
  return issues;
}

function isConfigured() {
  return getWebPushConfigIssues().length === 0;
}

async function registerMessagingServiceWorker() {
  const existing = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  if (existing?.active) return existing;

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  await navigator.serviceWorker.ready;
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
  const { token: fcmToken } = await fetchFcmToken();
  if (!fcmToken) return null;
  const registration = await submitWebPushRegistration(fcmToken, options);
  return registration.ok ? fcmToken : null;
}

/** Request permission, then register guest or account device. */
export type WebPushRegisterResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'denied' | 'unsupported' | 'not_configured' | 'token_failed' | 'register_failed'; message?: string };

export async function requestWebPushPermissionAndRegister(
  options: RegisterWebPushOptions = {}
): Promise<WebPushRegisterResult> {
  try {
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

    const { token: fcmToken, error: tokenError } = await fetchFcmToken();
    if (!fcmToken) {
      return {
        ok: false,
        reason: 'token_failed',
        message:
          tokenError ||
          'Could not get a browser push token. Check Firebase/VAPID config and try again.',
      };
    }

    const registration = await submitWebPushRegistration(fcmToken, options);
    return registration.ok
      ? { ok: true, token: fcmToken }
      : { ok: false, reason: 'register_failed', message: registration.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error enabling web push.';
    return { ok: false, reason: 'token_failed', message };
  }
}

type FcmTokenResult = { token: string | null; error?: string };

function formatFcmTokenError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : undefined;
  const message = error instanceof Error ? error.message : 'Could not get a browser push token.';

  if (
    code === 'messaging/token-subscription-failed' ||
    message.toLowerCase().includes('push service error')
  ) {
    return (
      'Browser push registration failed. Add this site to Firebase Console → Project settings → ' +
      'Authorized domains, confirm NEXT_PUBLIC_FCM_VAPID_KEY matches your Web Push key pair, ' +
      'and try again in a normal browser window (not private/incognito).'
    );
  }

  if (code === 'messaging/permission-blocked') {
    return 'Notifications are blocked for this site. Allow them in your browser settings and try again.';
  }

  return message;
}

async function fetchFcmToken(): Promise<FcmTokenResult> {
  const messaging = await getMessagingInstance();
  if (!messaging) return { token: null };

  const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
  if (!vapidKey) return { token: null };

  try {
    const registration = await registerMessagingServiceWorker();
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    return { token };
  } catch (error) {
    console.warn('[web-push] getToken failed:', error);
    return { token: null, error: formatFcmTokenError(error) };
  }
}

const MAX_REGISTRATION_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [1500, 3000, 6000];

function registrationRetryDelayMs(attempt: number): number {
  return RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)] ?? 6000;
}

function resolveAuthToken(explicit?: string | null): string | null {
  return explicit ?? getStoredToken();
}

async function submitWebPushRegistration(
  fcmToken: string,
  options: RegisterWebPushOptions,
  attempt = 1
): Promise<{ ok: boolean; message?: string }> {
  const guestId = options.guestId ?? getOrCreateGuestId();
  const authToken = resolveAuthToken(options.authToken);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/push_devices`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token: fcmToken, platform: 'web', guest_id: guestId }),
    });

    if (response.ok) return { ok: true };

    let message = `Push registration failed (HTTP ${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body?.error === 'string') message = body.error;
    } catch {
      const body = await response.text().catch(() => '');
      if (body) message = body.slice(0, 200);
    }
    console.warn(`[web-push] Registration failed (${response.status}): ${message}`);

    if (attempt < MAX_REGISTRATION_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, registrationRetryDelayMs(attempt)));
      return submitWebPushRegistration(fcmToken, options, attempt + 1);
    }

    return { ok: false, message };
  } catch (error) {
    console.warn('[web-push] Registration error:', error);
    if (attempt < MAX_REGISTRATION_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, registrationRetryDelayMs(attempt)));
      return submitWebPushRegistration(fcmToken, options, attempt + 1);
    }
    return { ok: false, message: 'Network error registering push device with the server.' };
  }
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
  const token =
    options.fcmToken ??
    (getWebPushPermissionStatus() === 'granted'
      ? (await fetchFcmToken().catch(() => ({ token: null }))).token
      : null);
  if (!token) return;

  const guestId = options.guestId ?? getOrCreateGuestId();
  const authToken = resolveAuthToken(options.authToken);
  const headers: Record<string, string> = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const url = new URL(`${getApiBaseUrl()}/api/v1/push_devices/${encodeURIComponent(token)}`);
  if (!authToken && guestId) {
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
