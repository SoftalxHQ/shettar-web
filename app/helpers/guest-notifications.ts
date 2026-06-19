'use client';

import { getOrCreateGuestId } from '@/app/helpers/guest-id';

export interface GuestNotificationItem {
  id: number;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

const MAX_ITEMS = 50;

function storageKey(guestId: string): string {
  return `guest_notifications:${guestId}`;
}

function readRaw(guestId: string): GuestNotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(guestId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestNotificationItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(guestId: string, items: GuestNotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(guestId), JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    /* ignore quota errors */
  }
}

export function loadGuestNotifications(guestId?: string): GuestNotificationItem[] {
  const id = guestId ?? getOrCreateGuestId();
  if (!id) return [];
  return readRaw(id);
}

export function appendGuestNotification(
  item: Omit<GuestNotificationItem, 'id' | 'created_at'> & { id?: number; created_at?: string },
  guestId?: string
): GuestNotificationItem {
  const id = guestId ?? getOrCreateGuestId();
  const notification: GuestNotificationItem = {
    id: item.id ?? -Date.now(),
    title: item.title,
    message: item.message,
    data: item.data,
    read_at: item.read_at,
    created_at: item.created_at ?? new Date().toISOString(),
  };

  const existing = readRaw(id);
  const deduped = existing.filter((n) => n.id !== notification.id);
  writeRaw(id, [notification, ...deduped].slice(0, MAX_ITEMS));
  return notification;
}

export function markGuestRead(targetId: number | 'all', guestId?: string): void {
  const id = guestId ?? getOrCreateGuestId();
  const now = new Date().toISOString();
  const items = readRaw(id).map((n) => {
    if (targetId === 'all' || n.id === targetId) {
      return { ...n, read_at: n.read_at ?? now };
    }
    return n;
  });
  writeRaw(id, items);
}

export function deleteGuestNotification(targetId: number | 'all', guestId?: string): void {
  const id = guestId ?? getOrCreateGuestId();
  if (targetId === 'all') {
    writeRaw(id, []);
    return;
  }
  writeRaw(
    id,
    readRaw(id).filter((n) => n.id !== targetId)
  );
}

export function clearGuestNotifications(guestId?: string): void {
  const id = guestId ?? getOrCreateGuestId();
  if (!id || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(storageKey(id));
  } catch {
    /* ignore */
  }
}
