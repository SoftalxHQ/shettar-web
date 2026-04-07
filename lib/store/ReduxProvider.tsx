'use client';

import { useRef, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import notificationsReducer from './slices/notificationsSlice';
import hotelStatsReducer from './slices/hotelStatsSlice';
import { apiService } from './services/apiService';
import { actionCableMiddleware } from './middleware/actionCableMiddleware';
import { changeHTMLAttribute } from '@/app/utils/html-layout';
import type { RootState, AppDispatch } from './store';

function makeStore() {
  const rootReducer = combineReducers({
    auth: persistReducer({ key: 'auth', storage }, authReducer),
    theme: persistReducer({ key: 'theme', storage }, themeReducer),
    notifications: notificationsReducer,
    hotelStats: hotelStatsReducer,
    [apiService.reducerPath]: apiService.reducer,
  });

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      })
        .concat(apiService.middleware)
        .concat(actionCableMiddleware),
  });

  const persistor = persistStore(store);
  return { store, persistor };
}

/**
 * Re-applies the persisted theme to the HTML element after rehydration.
 * redux-persist restores the theme value in state but doesn't re-run the
 * setTheme reducer side effect, so the data-bs-theme attribute needs to be
 * applied manually once on mount.
 */
function ThemeSync() {
  const theme = useSelector((s: any) => s.theme?.theme ?? 'auto');

  useEffect(() => {
    let resolved = theme;
    if (theme === 'auto') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    changeHTMLAttribute('data-bs-theme', resolved);
  }, [theme]);

  return null;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  const { store, persistor } = storeRef.current;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeSync />
        {children}
      </PersistGate>
    </Provider>
  );
}

export type { RootState, AppDispatch };
