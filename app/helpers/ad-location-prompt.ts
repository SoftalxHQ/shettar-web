'use client';

import { getDeviceGeoOptIn } from '@/app/helpers/ad-viewer-context';

const DISMISSED_KEY = 'shettar_ad_location_prompt_dismissed_at';
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

async function geolocationPermissionState(): Promise<PermissionState | 'unsupported'> {
  if (typeof window === 'undefined' || !navigator.geolocation) return 'unsupported';

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'prompt';
  }
}

export async function shouldShowAdLocationPrompt(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.geolocation) return false;
  if (getDeviceGeoOptIn()) return false;

  const permission = await geolocationPermissionState();
  if (permission === 'granted' || permission === 'denied') return false;

  const dismissedAt = localStorage.getItem(DISMISSED_KEY);
  if (dismissedAt) {
    const at = Number.parseInt(dismissedAt, 10);
    if (!Number.isNaN(at) && Date.now() - at < COOLDOWN_MS) return false;
  }

  return true;
}

export function markAdLocationPromptDismissed(): void {
  localStorage.setItem(DISMISSED_KEY, String(Date.now()));
}

export const AD_VIEWER_CONTEXT_UPDATED_EVENT = 'shettar-ad-viewer-context-updated';

export function notifyAdViewerContextUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AD_VIEWER_CONTEXT_UPDATED_EVENT));
}
