'use client';

import { changeHTMLAttribute } from '@/app/utils/layout';
import { type ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react';

export type LayoutState = {
  theme: 'light' | 'dark' | 'auto';
  dir: 'ltr' | 'rtl';
};

type LayoutType = LayoutState & {
  updateTheme: (theme: LayoutState['theme']) => void;
  updateDir: (dir: LayoutState['dir']) => void;
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
  });

  const updateSettings = useCallback((newSettings: Partial<LayoutState>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

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
  }, []);

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
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
