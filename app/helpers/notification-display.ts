import toast from 'react-hot-toast';
import type { IconType } from 'react-icons';
import {
  BsBellFill,
  BsCalendarCheckFill,
  BsLightningChargeFill,
  BsPhoneFill,
  BsTv,
  BsWalletFill,
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
    return { icon: BsPhoneFill, color: 'text-warning', bg: 'bg-warning' };
  }
  if (source === 'data' || content.includes('data bundle') || content.includes('data purchase')) {
    return { icon: BsPhoneFill, color: 'text-info', bg: 'bg-info' };
  }
  if (source === 'tv' || content.includes('tv subscription') || content.includes('dstv') || content.includes('gotv')) {
    return { icon: BsTv, color: 'text-info', bg: 'bg-info' };
  }
  if (source === 'electricity' || content.includes('electricity') || content.includes('meter token')) {
    return { icon: BsLightningChargeFill, color: 'text-warning', bg: 'bg-warning' };
  }
  if (
    ['check_in', 'check_out', 'booking_cancelled'].includes(source) ||
    content.includes('booking') ||
    content.includes('stay at')
  ) {
    return { icon: BsCalendarCheckFill, color: 'text-success', bg: 'bg-success' };
  }
  if (source === 'restaurant_order' || content.includes('room service') || content.includes('order')) {
    return { icon: BsBellFill, color: 'text-primary', bg: 'bg-primary' };
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
}): string {
  const source = typeof input.data?.source === 'string' ? input.data.source.toLowerCase() : '';
  const content = `${input.title ?? ''} ${input.message ?? ''}`.toLowerCase();

  if (source === 'wallet_funded' || content.includes('funded')) return '💰';
  if (source === 'airtime' || content.includes('airtime')) return '📱';
  if (source === 'data' || content.includes('data')) return '📶';
  if (source === 'tv' || content.includes('tv')) return '📺';
  if (source === 'electricity' || content.includes('electricity')) return '⚡';
  if (content.includes('booking') || content.includes('stay at')) return '🏨';
  if (source === 'restaurant_order' || content.includes('room service')) return '🍽️';
  return '🔔';
}

export function showNotificationToast(input: {
  title?: string;
  message?: string;
  data?: Record<string, unknown> | null;
  id?: string;
}) {
  const text = input.message || input.title || 'New notification';
  toast.success(text, {
    id: input.id,
    duration: 5000,
    icon: notificationToastEmoji(input),
  });
}

export function showPushPermissionDeniedToast() {
  toast.error('Notifications blocked. Enable them in your browser site settings, then try again.', {
    duration: 6000,
  });
}

export function showPushNotConfiguredToast() {
  toast.error('Web push is not available on this site yet. Please try again later.', {
    duration: 5000,
  });
}
