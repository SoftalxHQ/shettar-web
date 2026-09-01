'use client';

import { useRef, useState } from 'react';
import TurnstileField, { isTurnstileEnabled, type TurnstileFieldHandle } from '@/app/components/TurnstileField';
import { getStoredBrowseClearanceToken, isBrowseGateEnabled } from '@/app/helpers/browse-gate';

/**
 * Shared Turnstile state for auth forms.
 * Skip the widget only when the site-wide browse gate is on and a clearance token exists.
 * Production keeps the gate off, so leftover sessionStorage must not hide the check.
 */
export function useTurnstileAuth() {
  const turnstileRequired = isTurnstileEnabled();
  const skipViaBrowseClearance = isBrowseGateEnabled() && Boolean(getStoredBrowseClearanceToken());
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);

  const showTurnstileWidget = turnstileRequired && !turnstileToken && !skipViaBrowseClearance;
  const securityCheckRequired = turnstileRequired && !turnstileToken && !skipViaBrowseClearance;

  const resetTurnstile = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const consumeTurnstileOnSuccess = () => {
    setTurnstileToken(null);
  };

  return {
    turnstileRequired: securityCheckRequired,
    turnstileToken,
    setTurnstileToken,
    turnstileRef,
    showTurnstileWidget,
    resetTurnstile,
    consumeTurnstileOnSuccess,
    TurnstileField,
  };
}
