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

export const actionCableMiddleware: Middleware = (store) => {
  let consumer: Consumer | null = null;
  let subscription: Subscription | null = null;
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  function connect(token: string) {
    const wsUrl = `${API_URL.replace(/^http/, "ws")}/cable?token=${token}`;
    consumer = createConsumer(wsUrl);
    subscription = consumer.subscriptions.create(
      { channel: "AccountNotificationsChannel" },
      {
        received(data: any) {
          store.dispatch(
            addNotification({
              id: data.notification_id,
              title: data.title,
              message: data.message,
              data: data.data,
              read_at: undefined,
              created_at: data.created_at || new Date().toISOString(),
            }),
          );

          // Show toast for real-time notifications unless suppressed
          // (suppress_toast is set by WalletChannel which shows its own toast)
          if (!data.suppress_toast) {
            toast.success(data.message || data.title || "New notification", {
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
              const token = store.getState().auth.token;
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
  }

  return (next) => (action) => {
    const result = next(action);
    if (setCredentials.match(action)) {
      disconnect();
      connect(action.payload.token);
    }
    if (clearCredentials.match(action)) {
      disconnect();
    }
    return result;
  };
};
