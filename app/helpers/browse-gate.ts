/**
 * Site-wide browse gate — staging first, enabled when Turnstile site key is set.
 */

export const BROWSE_CLEARANCE_COOKIE = 'shettar_browse_clearance';
const STORED_CLEARANCE_KEY = 'shettar_browse_clearance';
const BROWSE_CLEARANCE_MAX_AGE_SECONDS = 60 * 60;

let browseVerifyRedirectPending = false;

export function isBrowseGateEnabled(): boolean {
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return false;
  return (
    process.env.NEXT_PUBLIC_APP_ENV === 'staging' ||
    process.env.NEXT_PUBLIC_BROWSE_GATE_ENABLED === 'true'
  );
}

function readAuthTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

function setBrowseClearanceCookie(token: string): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${BROWSE_CLEARANCE_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${BROWSE_CLEARANCE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function storeBrowseClearanceToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORED_CLEARANCE_KEY, token);
  } catch {
    /* private mode */
  }
  setBrowseClearanceCookie(token);
}

export function getStoredBrowseClearanceToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORED_CLEARANCE_KEY);
  } catch {
    return null;
  }
}

/** Restore sessionStorage from the web-origin cookie (e.g. after a full reload). */
export function hydrateBrowseClearanceFromCookie(): void {
  if (typeof window === 'undefined') return;
  if (getStoredBrowseClearanceToken()) return;

  const escaped = BROWSE_CLEARANCE_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  if (!match?.[1]) return;

  try {
    sessionStorage.setItem(STORED_CLEARANCE_KEY, decodeURIComponent(match[1]));
  } catch {
    /* ignore */
  }
}

export function clearStoredBrowseClearanceToken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORED_CLEARANCE_KEY);
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') {
    document.cookie = `${BROWSE_CLEARANCE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

export function getBrowseApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const clearance = getStoredBrowseClearanceToken();
  if (clearance) {
    headers['X-Browse-Clearance'] = clearance;
  }
  const authToken = readAuthTokenFromStorage();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
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
  const path = window.location.pathname;
  if (path === '/verify' || path.startsWith('/verify/')) return;
  if (browseVerifyRedirectPending) return;

  browseVerifyRedirectPending = true;
  const next = encodeURIComponent(returnTo || `${path}${window.location.search}`);
  window.location.href = `/verify?returnTo=${next}`;
}

export function isBrowseClearanceRequiredResponse(status: number, body: unknown): boolean {
  if (status !== 403) return false;
  if (!body || typeof body !== 'object') return false;
  return (body as { code?: string }).code === 'browse_clearance_required';
}

export async function handleBrowseClearanceResponse(response: Response): Promise<Response> {
  if (typeof window === 'undefined' || !isBrowseGateEnabled()) {
    return response;
  }
  if (response.status !== 403) return response;

  const body = await response.clone().json().catch(() => null);
  if (isBrowseClearanceRequiredResponse(response.status, body)) {
    redirectToBrowseVerify();
  }
  return response;
}
