import {
  createConsumer,
  type Consumer,
  type Subscription,
} from "@rails/actioncable";
import type { Middleware } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { addNotification } from "../slices/notificationsSlice";
import { setCredentials, clearCredentials } from "../slices/authSlice";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000"
).replace(/\/$/, "");
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
/** Tracks notification toasts already shown (independent of Redux list / API refetch). */
const toastedNotificationKeys = new Set<string>();

export const actionCableMiddleware: Middleware = (store) => {
  let consumer: Consumer | null = null;
  let subscription: Subscription | null = null;
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let activeToken: string | null = null;

  function connect(token: string) {
    const wsUrl = `${API_URL.replace(/^http/, "ws")}/cable?token=${token}`;
    consumer = createConsumer(wsUrl);
    subscription = consumer.subscriptions.create(
      { channel: "AccountNotificationsChannel" },
      {
        received(data: {
          notification_id?: number;
          title?: string;
          message?: string;
          data?: unknown;
          created_at?: string;
          suppress_toast?: boolean;
        }) {
          const notificationId = data.notification_id ?? -Date.now();
          const toastKey = `notification-${notificationId}`;

          store.dispatch(
            addNotification({
              id: notificationId,
              title: data.title ?? "Notification",
              message: data.message ?? "",
              data: data.data,
              read_at: undefined,
              created_at: data.created_at || new Date().toISOString(),
            }),
          );

          if (!data.suppress_toast && !toastedNotificationKeys.has(toastKey)) {
            toastedNotificationKeys.add(toastKey);
            if (toastedNotificationKeys.size > 200) {
              const oldest = toastedNotificationKeys.values().next().value;
              if (oldest) toastedNotificationKeys.delete(oldest);
            }
            toast.success(data.message || data.title || "New notification", {
              id: toastKey,
              icon: "🔔",
              duration: 5000,
            });
          }
        },
        connected() {
          retryCount = 0;
        },
        disconnected() {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            retryTimer = setTimeout(() => {
              const token = (store.getState() as { auth: { token: string | null } }).auth.token;
              if (token) connect(token);
            }, RETRY_DELAY_MS);
          }
        },
      },
    );
  }

  function disconnect() {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    subscription?.unsubscribe();
    consumer?.disconnect();
    consumer = null;
    subscription = null;
    retryCount = 0;
    activeToken = null;
  }

  return (next) => (action) => {
    const result = next(action);
    if (setCredentials.match(action)) {
      const token = action.payload.token;
      if (token && token !== activeToken) {
        disconnect();
        activeToken = token;
        connect(token);
      }
    }
    if (clearCredentials.match(action)) {
      disconnect();
    }
    return result;
  };
};
