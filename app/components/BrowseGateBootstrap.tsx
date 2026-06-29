'use client';

import { useEffect } from 'react';
import { hydrateBrowseClearanceFromCookie } from '@/app/helpers/browse-gate';

/** Sync browse clearance from cookie → sessionStorage on every client load. */
export default function BrowseGateBootstrap() {
  useEffect(() => {
    hydrateBrowseClearanceFromCookie();
  }, []);

  return null;
}
