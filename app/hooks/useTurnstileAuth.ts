'use client';

import { useRef, useState } from 'react';
import TurnstileField, { isTurnstileEnabled, type TurnstileFieldHandle } from '@/app/components/TurnstileField';
import { getStoredBrowseClearanceToken } from '@/app/helpers/browse-gate';

/**
 * Shared Turnstile state for auth forms — skips the widget when browse clearance exists.
 */
export function useTurnstileAuth() {
  const turnstileRequired = isTurnstileEnabled();
  const hasBrowseClearance = Boolean(getStoredBrowseClearanceToken());
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileFieldHandle>(null);

  const showTurnstileWidget = turnstileRequired && !turnstileToken && !hasBrowseClearance;
  const securityCheckRequired = turnstileRequired && !turnstileToken && !hasBrowseClearance;

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
