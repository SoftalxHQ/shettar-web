/**
 * store.ts — type exports only.
 *
 * The actual store instance is created inside ReduxProvider (a 'use client'
 * component) so that redux-persist's localStorage storage is only accessed
 * on the client, never during SSR.
 *
 * Import RootState / AppDispatch from here for typing selectors and dispatch.
 */

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import notificationsReducer from "./slices/notificationsSlice";
import hotelStatsReducer from "./slices/hotelStatsSlice";
import { apiService } from "./services/apiService";

// Minimal root reducer shape used only for type inference — no persist wrappers
// needed here since we only use this for RootState / AppDispatch types.
const _typeOnlyReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  notifications: notificationsReducer,
  hotelStats: hotelStatsReducer,
  [apiService.reducerPath]: apiService.reducer,
});

const _typeOnlyStore = configureStore({ reducer: _typeOnlyReducer });

export type RootState = ReturnType<typeof _typeOnlyReducer>;
export type AppDispatch = typeof _typeOnlyStore.dispatch;
