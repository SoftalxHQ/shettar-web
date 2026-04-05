import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { StoredUser } from "@/app/helpers/auth";

// Minimal selector state type to avoid circular dependency with store.ts
interface SelectorState {
  auth: AuthState;
}

export interface AuthState {
  token: string | null;
  user: StoredUser | null;
  isAuthenticated: boolean;
  isAccountLoading: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isAccountLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: StoredUser }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isAccountLoading = false;
    },
    setAccountLoading(state, action: PayloadAction<boolean>) {
      state.isAccountLoading = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setAccountLoading } =
  authSlice.actions;

export const selectToken = (state: SelectorState) => state.auth.token;
export const selectUser = (state: SelectorState) => state.auth.user;
export const selectIsAuthenticated = (state: SelectorState) =>
  state.auth.isAuthenticated;
export const selectIsAccountLoading = (state: SelectorState) =>
  state.auth.isAccountLoading;

export default authSlice.reducer;
