import type { Metadata } from 'next';
import { Suspense } from 'react';
import VerifyPageClient from './VerifyPageClient';

export const metadata: Metadata = {
  title: 'Security check — Shettar',
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-vh-100 bg-body-tertiary" />}>
      <VerifyPageClient />
    </Suspense>
  );
}
