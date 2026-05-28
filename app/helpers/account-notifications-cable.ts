import { getStoredToken } from '@/app/helpers/auth';
import { isCableJwtUsable } from '@/app/helpers/jwt-cable';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

export type AccountNotificationCablePayload = {
  notification_id?: number;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  created_at?: string;
  suppress_toast?: boolean;
};

/** ActionCable ping frames use `message` as a number — must not treat as notifications. */
export function parseAccountNotificationCableFrame(
  raw: unknown
): AccountNotificationCablePayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const frame = raw as Record<string, unknown>;
  const frameType = frame.type;
  if (
    frameType === 'ping' ||
    frameType === 'welcome' ||
    frameType === 'confirm_subscription' ||
    frameType === 'disconnect'
  ) {
    return null;
  }

  const message = frame.message;
  if (!message || typeof message !== 'object' || Array.isArray(message)) return null;

  const payload = message as Record<string, unknown>;
  const title = payload.title;
  if (typeof title !== 'string' || !title.trim()) return null;

  return payload as AccountNotificationCablePayload;
}

type Handler = (payload: AccountNotificationCablePayload) => void;

let sharedSocket: WebSocket | null = null;
let socketToken: string | null = null;
let rejectedToken: string | null = null;
const subscribers = new Set<Handler>();
const seenKeys = new Set<string>();
const SEEN_CAP = 200;

function rememberKey(key: string) {
  seenKeys.add(key);
  if (seenKeys.size > SEEN_CAP) {
    const first = seenKeys.values().next().value;
    if (first !== undefined) seenKeys.delete(first);
  }
}

function dedupeKey(payload: AccountNotificationCablePayload): string {
  if (payload.notification_id != null) return `id:${payload.notification_id}`;
  return `t:${payload.title}:${payload.message}:${payload.created_at ?? ''}`;
}

function shouldDeliver(payload: AccountNotificationCablePayload): boolean {
  const key = dedupeKey(payload);
  if (seenKeys.has(key)) return false;
  rememberKey(key);
  return true;
}

function notifySubscribers(payload: AccountNotificationCablePayload) {
  if (!shouldDeliver(payload)) return;
  subscribers.forEach((handler) => {
    try {
      handler(payload);
    } catch {
      /* ignore subscriber errors */
    }
  });
}

function teardownSocket() {
  if (!sharedSocket) return;
  const ws = sharedSocket;
  sharedSocket = null;
  socketToken = null;
  try {
    const identifier = JSON.stringify({ channel: 'AccountNotificationsChannel' });
    ws.send(JSON.stringify({ command: 'unsubscribe', identifier }));
  } catch {
    /* */
  }
  try {
    ws.close();
  } catch {
    /* */
  }
}

function ensureSocket(tokenOverride?: string | null) {
  const token = tokenOverride ?? getStoredToken();
  if (!token || !isCableJwtUsable(token)) return;
  if (rejectedToken === token) return;

  if (sharedSocket && socketToken === token) {
    const state = sharedSocket.readyState;
    if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return;
  }

  teardownSocket();
  socketToken = token;

  const wsBase = API_URL.replace(/^http/, 'ws');
  const ws = new WebSocket(`${wsBase}/cable?token=${encodeURIComponent(token)}`);
  sharedSocket = ws;
  const identifier = JSON.stringify({ channel: 'AccountNotificationsChannel' });
  let confirmed = false;
  const openedAt = Date.now();

  ws.onopen = () => {
    ws.send(JSON.stringify({ command: 'subscribe', identifier }));
  };

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data as string);
      if (data?.type === 'confirm_subscription') {
        confirmed = true;
        rejectedToken = null;
      }
    } catch {
      /* ignore */
    }
    try {
      const data = JSON.parse(ev.data as string);
      const payload = parseAccountNotificationCableFrame(data);
      if (payload) notifySubscribers(payload);
    } catch {
      /* ignore malformed frames */
    }
  };

  ws.onclose = () => {
    if (sharedSocket !== ws) return;
    sharedSocket = null;
    const quickFailure = !confirmed && Date.now() - openedAt < 4000;
    if (quickFailure && socketToken) {
      rejectedToken = socketToken;
      return;
    }
    if (subscribers.size > 0 && isCableJwtUsable(getStoredToken() ?? socketToken)) {
      window.setTimeout(() => {
        if (subscribers.size > 0) ensureSocket();
      }, 3000);
    }
  };
}

/** One shared guest account notification socket (same pattern as shettar-business). */
export function subscribeAccountNotifications(handler: Handler, token?: string | null) {
  subscribers.add(handler);
  if (token && rejectedToken !== token) rejectedToken = null;
  ensureSocket(token);
  return () => {
    subscribers.delete(handler);
    if (subscribers.size === 0) teardownSocket();
  };
}
