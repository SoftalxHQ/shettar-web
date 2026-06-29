'use client';

import { useEffect, useRef, useState } from 'react';
import TurnstileField, { isTurnstileEnabled, type TurnstileFieldHandle } from '@/app/components/TurnstileField';
import { useTurnstileBrowse } from '@/app/contexts/TurnstileBrowseContext';

/**
 * Shared Turnstile state for auth forms — reuses the homepage browse token when still valid.
 */
export function useTurnstileAuth() {
  const { turnstileToken: browseToken, clearTurnstileToken } = useTurnstileBrowse();
  const turnstileRequired = isTurnstileEnabled();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);

  useEffect(() => {
    if (browseToken) {
      setTurnstileToken(browseToken);
    }
  }, [browseToken]);

  const showTurnstileWidget = turnstileRequired && !turnstileToken;

  const resetTurnstile = () => {
    clearTurnstileToken();
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const consumeTurnstileOnSuccess = () => {
    clearTurnstileToken();
    setTurnstileToken(null);
  };

  return {
    turnstileRequired,
    turnstileToken,
    setTurnstileToken,
    turnstileRef,
    showTurnstileWidget,
    resetTurnstile,
    consumeTurnstileOnSuccess,
    TurnstileField,
  };
}
