'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TurnstileField from '@/app/components/TurnstileField';
import { submitBrowseVerification } from '@/app/helpers/browse-clearance';

function safeReturnPath(raw: string | null): string {
  if (!raw) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
  if (raw.startsWith('/verify')) return '/';
  return raw;
}

export default function VerifyPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get('returnTo'));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleToken = useCallback(
    async (token: string | null) => {
      if (!token || submitting) return;

      setSubmitting(true);
      setError(null);

      const result = await submitBrowseVerification(token);
      if (!result.ok) {
        setError(result.message);
        setSubmitting(false);
        return;
      }

      router.replace(returnTo);
    },
    [returnTo, router, submitting]
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary px-3">
      <div className="w-100" style={{ maxWidth: 420 }}>
        <div className="text-center mb-4">
          <h1 className="h4 mb-2">Security check</h1>
          <p className="text-secondary small mb-0">
            Verify you&apos;re human to continue to Shettar. This helps block bots from
            scraping our hotel catalog.
          </p>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 p-sm-5">
            <TurnstileField
              className="d-flex justify-content-center"
              onToken={handleToken}
            />
            {submitting && (
              <p className="text-center text-secondary small mt-3 mb-0">Verifying…</p>
            )}
            {error && (
              <p className="text-center text-danger small mt-3 mb-0" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
