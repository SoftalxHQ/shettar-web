/**
 * Site-wide browse gate — staging first, enabled when Turnstile site key is set.
 */

export const BROWSE_CLEARANCE_COOKIE = 'shettar_browse_clearance';
const STORED_CLEARANCE_KEY = 'shettar_browse_clearance';

export function isBrowseGateEnabled(): boolean {
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return false;
  return (
    process.env.NEXT_PUBLIC_APP_ENV === 'staging' ||
    process.env.NEXT_PUBLIC_BROWSE_GATE_ENABLED === 'true'
  );
}

export function storeBrowseClearanceToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORED_CLEARANCE_KEY, token);
  } catch {
    /* private mode */
  }
}

export function getStoredBrowseClearanceToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORED_CLEARANCE_KEY);
  } catch {
    return null;
  }
}

export function clearStoredBrowseClearanceToken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORED_CLEARANCE_KEY);
  } catch {
    /* ignore */
  }
}

export function getBrowseApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getStoredBrowseClearanceToken();
  if (token) {
    headers['X-Browse-Clearance'] = token;
  }
  return headers;
}

export function withBrowseCredentials(init: RequestInit = {}): RequestInit {
  const mergedHeaders = {
    ...getBrowseApiHeaders(),
    ...(init.headers as Record<string, string> | undefined),
  };

  return {
    ...init,
    credentials: 'include',
    headers: mergedHeaders,
  };
}

export function redirectToBrowseVerify(returnTo?: string): void {
  if (typeof window === 'undefined') return;
  const path = returnTo || `${window.location.pathname}${window.location.search}`;
  const next = encodeURIComponent(path);
  window.location.href = `/verify?returnTo=${next}`;
}

export function isBrowseClearanceRequiredResponse(status: number, body: unknown): boolean {
  if (status !== 403) return false;
  if (!body || typeof body !== 'object') return false;
  return (body as { code?: string }).code === 'browse_clearance_required';
}
