import { isUsableJwt } from '@/app/helpers/auth';
import { getCableUrl } from '@/app/helpers/api-base-url';

const ACTION_CABLE_PROTOCOLS = ['actioncable-v1-json', 'actioncable-unsupported'];

/** Prefix so ActionCable can still select actioncable-v1-json during the handshake. */
export const CABLE_JWT_PROTOCOL_PREFIX = 'jwt.';

export function cableUrl(): string {
  return getCableUrl();
}

export function cableProtocols(token?: string | null): string[] {
  if (!isUsableJwt(token)) return ACTION_CABLE_PROTOCOLS;
  return [...ACTION_CABLE_PROTOCOLS, `${CABLE_JWT_PROTOCOL_PREFIX}${token}`];
}

/** Browser WebSocket cannot set Authorization; send the JWT as an extra subprotocol. */
export function openCableWebSocket(token?: string | null): WebSocket {
  return new WebSocket(cableUrl(), cableProtocols(token));
}

export type CableChannelSpec = string | { channel: string; [key: string]: unknown };

export type CableChannelHandlers<T = unknown> = {
  received?: (data: T) => void;
  connected?: () => void;
  disconnected?: () => void;
  rejected?: () => void;
};

/**
 * Subscribe without @rails/actioncable's createConsumer. Next/Turbopack freezes
 * the ESM namespace, so assigning ActionCable.WebSocket throws.
 */
export function subscribeCableChannel<T = unknown>(
  channel: CableChannelSpec,
  handlers: CableChannelHandlers<T>,
  token?: string | null,
): () => void {
  const identifier = JSON.stringify(typeof channel === 'string' ? { channel } : channel);
  const ws = openCableWebSocket(isUsableJwt(token) ? token : null);
  let closed = false;

  ws.onopen = () => {
    if (closed) return;
    try {
      ws.send(JSON.stringify({ command: 'subscribe', identifier }));
    } catch {
      /* */
    }
  };

  ws.onmessage = (ev) => {
    if (closed) return;
    let data: { type?: string; message?: T } | null = null;
    try {
      data = JSON.parse(ev.data as string) as { type?: string; message?: T };
    } catch {
      return;
    }
    if (!data || typeof data !== 'object') return;

    if (data.type === 'confirm_subscription') {
      handlers.connected?.();
      return;
    }
    if (data.type === 'reject_subscription') {
      handlers.rejected?.();
      return;
    }
    if (
      data.type === 'ping' ||
      data.type === 'welcome' ||
      data.type === 'disconnect'
    ) {
      return;
    }
    if (data.message != null) handlers.received?.(data.message);
  };

  ws.onclose = () => {
    if (!closed) handlers.disconnected?.();
  };

  return () => {
    closed = true;
    try {
      ws.send(JSON.stringify({ command: 'unsubscribe', identifier }));
    } catch {
      /* */
    }
    try {
      ws.close();
    } catch {
      /* */
    }
  };
}
