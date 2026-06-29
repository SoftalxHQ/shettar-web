'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isTurnstileEnabled } from '@/app/components/TurnstileField';
import {
  clearStoredTurnstileToken,
  getStoredTurnstileToken,
  storeTurnstileToken,
} from '@/app/helpers/turnstile-browse';

type TurnstileBrowseContextValue = {
  turnstileRequired: boolean;
  browseVerified: boolean;
  turnstileToken: string | null;
  confirmBrowse: (token: string) => void;
  clearTurnstileToken: () => void;
};

const TurnstileBrowseContext = createContext<TurnstileBrowseContextValue | null>(null);

export function TurnstileBrowseProvider({ children }: { children: ReactNode }) {
  const turnstileRequired = isTurnstileEnabled();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTurnstileToken(getStoredTurnstileToken());
    setHydrated(true);
  }, []);

  const confirmBrowse = useCallback((token: string) => {
    storeTurnstileToken(token);
    setTurnstileToken(token);
  }, []);

  const clearTurnstileToken = useCallback(() => {
    clearStoredTurnstileToken();
    setTurnstileToken(null);
  }, []);

  const browseVerified = !turnstileRequired || Boolean(turnstileToken);

  const value = useMemo(
    () => ({
      turnstileRequired,
      browseVerified: hydrated ? browseVerified : !turnstileRequired,
      turnstileToken,
      confirmBrowse,
      clearTurnstileToken,
    }),
    [turnstileRequired, browseVerified, hydrated, turnstileToken, confirmBrowse, clearTurnstileToken]
  );

  return (
    <TurnstileBrowseContext.Provider value={value}>
      {children}
    </TurnstileBrowseContext.Provider>
  );
}

export function useTurnstileBrowse(): TurnstileBrowseContextValue {
  const ctx = useContext(TurnstileBrowseContext);
  if (!ctx) {
    return {
      turnstileRequired: false,
      browseVerified: true,
      turnstileToken: null,
      confirmBrowse: () => {},
      clearTurnstileToken: () => {},
    };
  }
  return ctx;
}
