'use client';

import { getWebPushPermissionStatus, isWebPushConfigured } from '@/app/helpers/push-notifications';

const DISMISSED_KEY = 'shettar_push_prompt_dismissed_at';
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

export function shouldShowPushNotificationPrompt(): boolean {
  if (typeof window === 'undefined' || !isWebPushConfigured()) return false;

  const status = getWebPushPermissionStatus();
  if (status === 'granted' || status === 'denied') return false;

  const dismissedAt = localStorage.getItem(DISMISSED_KEY);
  if (dismissedAt) {
    const at = Number.parseInt(dismissedAt, 10);
    if (!Number.isNaN(at) && Date.now() - at < COOLDOWN_MS) return false;
  }

  return true;
}

export function markPushNotificationPromptDismissed(): void {
  localStorage.setItem(DISMISSED_KEY, String(Date.now()));
}
