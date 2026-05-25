import { getStoredToken } from '@/app/helpers/auth';
import { isCableJwtUsable } from '@/app/helpers/jwt-cable';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export type RestaurantCableEvent = {
  event: string;
  business_id: string;
  payload: Record<string, unknown>;
};

function parseRestaurantCableFrame(raw: unknown): RestaurantCableEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const frame = raw as Record<string, unknown>;
  if (
    frame.type === 'ping' ||
    frame.type === 'welcome' ||
    frame.type === 'confirm_subscription' ||
    frame.type === 'disconnect'
  ) {
    return null;
  }
  const message = frame.message;
  if (!message || typeof message !== 'object' || Array.isArray(message)) return null;
  const msg = message as Record<string, unknown>;
  if (typeof msg.event !== 'string') return null;
  return message as RestaurantCableEvent;
}

export function subscribeRestaurantReservation(
  businessId: string,
  reservationId: number,
  onEvent: (msg: RestaurantCableEvent) => void
) {
  const token = getStoredToken();
  if (!isCableJwtUsable(token)) return () => {};

  let ws: WebSocket | null = null;
  let closed = false;
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let rejected = false;

  const identifier = JSON.stringify({
    channel: 'RestaurantChannel',
    business_id: businessId,
    reservation_id: reservationId,
  });

  function connect() {
    if (closed || rejected) return;
    const wsBase = API_URL.replace(/^http/, 'ws');
    const socket = new WebSocket(`${wsBase}/cable?token=${encodeURIComponent(token!)}`);
    ws = socket;
    let confirmed = false;
    const openedAt = Date.now();

    socket.onopen = () => {
      retryCount = 0;
      socket.send(JSON.stringify({ command: 'subscribe', identifier }));
    };

    socket.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string);
        if (data?.type === 'confirm_subscription') confirmed = true;
        const event = parseRestaurantCableFrame(data);
        if (event) onEvent(event);
      } catch {
        /* ignore */
      }
    };

    socket.onclose = () => {
      if (closed || ws !== socket) return;
      ws = null;
      if (!confirmed && Date.now() - openedAt < 4000) {
        rejected = true;
        return;
      }
      if (!closed && retryCount < MAX_RETRIES && isCableJwtUsable(token)) {
        retryCount += 1;
        retryTimer = setTimeout(connect, RETRY_DELAY_MS);
      }
    };
  }

  connect();

  return () => {
    closed = true;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    const socket = ws;
    ws = null;
    if (!socket) return;
    try {
      socket.send(JSON.stringify({ command: 'unsubscribe', identifier }));
    } catch {
      /* */
    }
    try {
      socket.close();
    } catch {
      /* */
    }
  };
}

export function orderStatusVariant(status: string) {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'preparing':
      return 'info';
    case 'ready':
      return 'primary';
    case 'served':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
}
