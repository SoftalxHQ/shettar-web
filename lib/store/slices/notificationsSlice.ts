import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearCredentials } from "./authSlice";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  data?: any;
  read_at?: string;
  created_at: string;
}

export interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
}

// Minimal selector state type to avoid circular dependency with store.ts
interface SelectorState {
  notifications: NotificationsState;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

function dedupeNotifications(list: NotificationItem[]): NotificationItem[] {
  const seen = new Set<number>();
  return list.filter((n) => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
}

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<NotificationItem[]>) {
      state.notifications = dedupeNotifications(action.payload);
      state.unreadCount = state.notifications.filter((n) => !n.read_at).length;
    },
    /** Merge API fetch into Redux without dropping cable-only rows. */
    mergeNotificationsFromApi(state, action: PayloadAction<NotificationItem[]>) {
      const byId = new Map<number, NotificationItem>();
      for (const n of state.notifications) byId.set(n.id, n);
      for (const n of action.payload) {
        const prev = byId.get(n.id);
        byId.set(n.id, prev ? { ...prev, ...n } : n);
      }
      const merged = Array.from(byId.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      state.notifications = dedupeNotifications(merged);
      state.unreadCount = state.notifications.filter((n) => !n.read_at).length;
    },
    addNotification(state, action: PayloadAction<NotificationItem>) {
      const existing = state.notifications.findIndex((n) => n.id === action.payload.id);
      if (existing >= 0) {
        const wasUnread = !state.notifications[existing].read_at;
        state.notifications[existing] = {
          ...state.notifications[existing],
          ...action.payload,
        };
        if (!wasUnread && !action.payload.read_at) {
          state.unreadCount += 1;
        }
        return;
      }
      state.notifications.unshift(action.payload);
      if (!action.payload.read_at) {
        state.unreadCount += 1;
      }
    },
    markNotificationRead(state, action: PayloadAction<number | "all">) {
      const id = action.payload;
      const now = new Date().toISOString();
      if (id === "all") {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at ?? now,
        }));
        state.unreadCount = 0;
      } else {
        state.notifications = state.notifications.map((n) => {
          if (n.id === id && !n.read_at) {
            return { ...n, read_at: now };
          }
          return n;
        });
        state.unreadCount = state.notifications.filter((n) => !n.read_at).length;
      }
    },
    removeNotification(state, action: PayloadAction<number | "all">) {
      const id = action.payload;
      if (id === "all") {
        state.notifications = [];
        state.unreadCount = 0;
      } else {
        const target = state.notifications.find((n) => n.id === id);
        state.notifications = state.notifications.filter((n) => n.id !== id);
        if (target && !target.read_at) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    setNotificationsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearCredentials, () => initialState);
  },
});

export const {
  setNotifications,
  mergeNotificationsFromApi,
  addNotification,
  markNotificationRead,
  removeNotification,
  setNotificationsLoading,
} = notificationsSlice.actions;

export const selectNotifications = (state: SelectorState) =>
  state.notifications.notifications;
export const selectUnreadCount = (state: SelectorState) =>
  state.notifications.unreadCount;
export const selectNotificationsLoading = (state: SelectorState) =>
  state.notifications.loading;

export default notificationsSlice.reducer;
