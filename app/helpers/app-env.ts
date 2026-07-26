/**
 * Staging vs production for the guest web app.
 *
 * Next.js only auto-loads `.env.production` / `.env.development` — not `.env.staging`.
 * Staging deploys often set NEXT_PUBLIC_API_URL correctly but forget NEXT_PUBLIC_APP_ENV,
 * so we also treat a staging API host as staging.
 */

function apiLooksLikeStaging(apiUrl: string): boolean {
  return /(?:^|\.)stg\.|\/\/api\.stg\.|staging/i.test(apiUrl);
}

export function isStagingEnv(): boolean {
  if (process.env.NEXT_PUBLIC_APP_ENV === 'staging') return true;
  // Staging API host wins even if APP_ENV was left as production in the deploy.
  return apiLooksLikeStaging(process.env.NEXT_PUBLIC_API_URL || '');
}

export function desktopReleaseChannel(): 'staging' | 'production' {
  return isStagingEnv() ? 'staging' : 'production';
}
