'use client';

import { changeHTMLAttribute } from '@/app/utils/layout';
import { signOut } from '@/app/helpers/auth';
import { useRouter } from 'next/navigation';
import { type ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react';

export type LayoutState = {
  theme: 'light' | 'dark' | 'auto';
  dir: 'ltr' | 'rtl';
  hotelCount: number | null;
  hotelLocation: string | null;
  isAuthenticated: boolean;
  account: any | null;
  isAccountLoading: boolean;
};

type LayoutType = LayoutState & {
  updateTheme: (theme: LayoutState['theme']) => void;
  updateDir: (dir: LayoutState['dir']) => void;
  updateHotelStats: (count: number, location: string | null) => void;
  refreshAuth: () => void;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
};

const LayoutContext = createContext<LayoutType | undefined>(undefined);

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
}

const themeKey = 'data-bs-theme';

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<LayoutState>({
    theme: 'light', // Default initial state
    dir: 'ltr',
    hotelCount: null,
    hotelLocation: null,
    isAuthenticated: false,
    account: null,
    isAccountLoading: true,
  });

  const updateSettings = useCallback((newSettings: Partial<LayoutState>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const updateHotelStats = useCallback((count: number, location: string | null) => {
    updateSettings({ hotelCount: count, hotelLocation: location });
  }, [updateSettings]);

  const refreshAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    updateSettings({ isAuthenticated: !!(token && user) });
  }, [updateSettings]);

  const router = useRouter();

  const logout = useCallback(async () => {
    await signOut(); // revokes JWT on server, then clears localStorage
    updateSettings({ isAuthenticated: false, account: null });
    router.push('/auth/sign-in');
  }, [updateSettings, router]);

  const refreshAccount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      updateSettings({ isAccountLoading: false });
      return;
    }

    updateSettings({ isAccountLoading: true });
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const res = await fetch(`${API_URL}/account_details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.status?.code === 200) {
        updateSettings({ account: data.data, isAccountLoading: false });
      } else if (res.status === 401) {
        // Token expired or invalid - force logout to avoid loop
        await logout();
      } else {
        updateSettings({ account: null, isAccountLoading: false });
      }
    } catch (err) {
      console.error('refreshAccount error:', err);
      updateSettings({ account: null, isAccountLoading: false });
    }
  }, [updateSettings]);

  // Effect to automatically fetch account when authenticated
  useEffect(() => {
    if (settings.isAuthenticated && !settings.account && !settings.isAccountLoading) {
      const token = localStorage.getItem('token');
      if (token) refreshAccount();
    } else if (!settings.isAuthenticated && settings.account) {
      updateSettings({ account: null });
    }
  }, [settings.isAuthenticated, settings.account, settings.isAccountLoading, refreshAccount, updateSettings]);

  useEffect(() => {
    const foundTheme = localStorage.getItem(themeKey) as LayoutState['theme'] | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    let initialTheme: LayoutState['theme'] = 'light';
    if (foundTheme) {
      if (foundTheme === 'auto') {
        changeHTMLAttribute(themeKey, preferredTheme);
        initialTheme = 'auto';
      } else {
        changeHTMLAttribute(themeKey, foundTheme);
        initialTheme = foundTheme;
      }
    } else {
      localStorage.setItem(themeKey, 'auto');
      changeHTMLAttribute(themeKey, preferredTheme);
      initialTheme = 'auto';
    }

    setSettings(prev => ({ ...prev, theme: initialTheme }));
    refreshAuth();
    refreshAccount();
  }, [refreshAuth, refreshAccount]);

  const updateTheme = (newTheme: LayoutState['theme']) => {
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (newTheme === 'auto') {
      changeHTMLAttribute(themeKey, preferredTheme);
    } else {
      changeHTMLAttribute(themeKey, newTheme);
    }
    localStorage.setItem(themeKey, newTheme);
    updateSettings({ theme: newTheme });
  };

  const updateDir = (newDir: LayoutState['dir']) => {
    updateSettings({ dir: newDir });
  };

  return (
    <LayoutContext.Provider
      value={{
        ...settings,
        updateTheme,
        updateDir,
        updateHotelStats,
        refreshAuth,
        logout,
        refreshAccount,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
