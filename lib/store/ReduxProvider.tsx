'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // safe here — only runs on client
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import notificationsReducer from './slices/notificationsSlice';
import hotelStatsReducer from './slices/hotelStatsSlice';
import { apiService } from './services/apiService';
import { actionCableMiddleware } from './middleware/actionCableMiddleware';
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

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  // useRef ensures the store is created once per client session, not on every render
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  const { store, persistor } = storeRef.current;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

export type { RootState, AppDispatch };
