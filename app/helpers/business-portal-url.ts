import { isStagingEnv } from './app-env';

/**
 * Shettar Business portal URL for “List Property” and partner CTAs.
 * Staging → stg-busn; production → busn. Optional override via env.
 */
export function businessPortalUrl(): string {
  const override = process.env.NEXT_PUBLIC_BUSINESS_PORTAL_URL?.trim();
  if (override) return override.replace(/\/$/, '');

  return isStagingEnv()
    ? 'https://stg-busn.shettar.com/signup'
    : 'https://busn.shettar.com/signup';
}
