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

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<NotificationItem[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read_at).length;
    },
    addNotification(state, action: PayloadAction<NotificationItem>) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
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
