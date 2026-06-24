'use client';

import { createElement, type ReactElement } from 'react';
import toast from 'react-hot-toast';
import type { IconType } from 'react-icons';
import {
  BsBellFill,
  BsCalendarCheckFill,
  BsChatDotsFill,
  BsEggFried,
  BsLightningChargeFill,
  BsShieldLockFill,
  BsTelephoneFill,
  BsTv,
  BsWalletFill,
  BsWifi,
} from 'react-icons/bs';

export type NotificationVisual = {
  icon: IconType;
  color: string;
  bg: string;
};

export function getNotificationVisual(input: {
  title?: string;
  message?: string;
  data?: Record<string, unknown> | null;
}): NotificationVisual {
  const source = typeof input.data?.source === 'string' ? input.data.source.toLowerCase() : '';
  const content = `${input.title ?? ''} ${input.message ?? ''}`.toLowerCase();

  if (source === 'wallet_funded' || content.includes('wallet funded') || content.includes('funded')) {
    return { icon: BsWalletFill, color: 'text-primary', bg: 'bg-primary' };
  }
  if (source === 'airtime' || content.includes('airtime')) {
    return { icon: BsTelephoneFill, color: 'text-primary', bg: 'bg-primary' };
  }
  if (source === 'data' || content.includes('data bundle') || content.includes('data purchase') || content.includes('data plan')) {
    return { icon: BsWifi, color: 'text-info', bg: 'bg-info' };
  }
  if (source === 'tv' || content.includes('tv subscription') || content.includes('dstv') || content.includes('gotv')) {
    return { icon: BsTv, color: 'text-info', bg: 'bg-info' };
  }
  if (source === 'electricity' || content.includes('electricity') || content.includes('meter token')) {
    return { icon: BsLightningChargeFill, color: 'text-warning', bg: 'bg-warning' };
  }
  if (
    ['check_in', 'check_out', 'booking_cancelled', 'cancellation_fee'].includes(source) ||
    content.includes('booking') ||
    content.includes('checked in') ||
    content.includes('checked out') ||
    content.includes('stay at')
  ) {
    return { icon: BsCalendarCheckFill, color: 'text-success', bg: 'bg-success' };
  }
  if (
    source === 'restaurant_order' ||
    content.includes('room service') ||
    content.includes('kitchen') ||
    (content.includes('order') && !content.includes('border'))
  ) {
    return { icon: BsEggFried, color: 'text-primary', bg: 'bg-primary' };
  }
  if (source === 'review_comment_reply' || source === 'review_reply' || content.includes('replied to your review')) {
    return { icon: BsChatDotsFill, color: 'text-primary', bg: 'bg-primary' };
  }
  if (source === 'login_alert' || source === 'security' || source === 'account_deletion' || content.includes('new login') || content.includes('password was successfully changed') || content.includes('account deletion') || content.includes('deletion cancelled')) {
    return { icon: BsShieldLockFill, color: 'text-warning', bg: 'bg-warning' };
  }
  if (content.includes('wallet') || content.includes('payment') || content.includes('debited')) {
    return { icon: BsWalletFill, color: 'text-primary', bg: 'bg-primary' };
  }

  return { icon: BsBellFill, color: 'text-info', bg: 'bg-info' };
}

export function notificationToastEmoji(input: {
  title?: string;
  message?: string;
  data?: Record<string, unknown> | null;
}): string | null {
  const source = typeof input.data?.source === 'string' ? input.data.source.toLowerCase() : '';
  const content = `${input.title ?? ''} ${input.message ?? ''}`.toLowerCase();

  if (source === 'wallet_funded' || content.includes('funded')) return '💰';
  if (source === 'airtime' || content.includes('airtime')) return '📱';
  if (source === 'data' || content.includes('data')) return '📶';
  if (source === 'tv' || content.includes('tv')) return '📺';
  if (source === 'electricity' || content.includes('electricity')) return '⚡';
  if (content.includes('booking') || content.includes('checked in') || content.includes('checked out') || content.includes('stay at')) return '📅';
  if (source === 'restaurant_order' || content.includes('room service') || content.includes('kitchen')) return '🍽️';
  if (source === 'review_comment_reply' || source === 'review_reply') return '💬';
  if (source === 'login_alert' || source === 'security' || content.includes('account deletion')) return '🛡️';
  return null;
}

const SHETTAR_APP_ICON_PATH = '/images/icon.png';

function notificationToastIcon(input: {
  title?: string;
  message?: string;
  data?: Record<string, unknown> | null;
}): string | ReactElement {
  const emoji = notificationToastEmoji(input);
  if (emoji) return emoji;

  return createElement('img', {
    src: SHETTAR_APP_ICON_PATH,
    alt: '',
    width: 20,
    height: 20,
    style: { borderRadius: 4, objectFit: 'contain' },
  });
}

export function showNotificationToast(input: {
  title?: string;
  message?: string;
  data?: Record<string, unknown> | null;
  id?: string;
  /** When true, show body/message only (web push). */
  messageOnly?: boolean;
}) {
  const text = input.messageOnly
    ? input.message || 'New notification'
    : input.message || input.title || 'New notification';
  toast.success(text, {
    id: input.id,
    duration: 5000,
    icon: notificationToastIcon(input),
  });
}

export function showPushPermissionDeniedToast() {
  toast.error('Notifications blocked. Enable them in your browser site settings, then try again.', {
    duration: 6000,
  });
}

export function isLikelyBraveBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Brave/i.test(navigator.userAgent) || 'brave' in navigator;
}

/** Shown when FCM token / browser push setup fails (Brave, Firefox quirks, etc.). */
export function showWebPushUnavailableToast() {
  const message = isLikelyBraveBrowser()
    ? 'Browser notifications are not fully supported in Brave. Try Chrome or Safari, or use the Shettar mobile app for alerts.'
    : 'Browser notifications are not available in this browser. Try Chrome or Safari, or use the Shettar mobile app for alerts.';

  toast.error(message, { duration: 7000 });
}

export function showWebPushEnableFailedToast() {
  toast.error(
    "We couldn't turn on browser notifications. Allow notifications for this site in your browser settings, or use the Shettar mobile app.",
    { duration: 7000 }
  );
}

export function showPushNotConfiguredToast() {
  toast.error('Browser notifications are not available on this site yet.', { duration: 6000 });
}
