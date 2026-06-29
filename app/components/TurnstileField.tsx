'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

export type TurnstileFieldHandle = {
  reset: () => void;
};

type Props = {
  onToken: (token: string | null) => void;
  className?: string;
};

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

const TurnstileField = forwardRef<TurnstileFieldHandle, Props>(function TurnstileField(
  { onToken, className },
  ref
) {
  const widgetRef = useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useImperativeHandle(ref, () => ({
    reset: () => {
      onToken(null);
      widgetRef.current?.reset();
    },
  }));

  if (!siteKey) return null;

  return (
    <div className={className}>
      <Turnstile
        ref={widgetRef}
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={() => onToken(null)}
        onError={() => onToken(null)}
        options={{ theme: 'light', size: 'flexible' }}
      />
    </div>
  );
});

export default TurnstileField;
