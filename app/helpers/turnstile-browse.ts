const TOKEN_KEY = 'shettar_turnstile_token';
const TOKEN_AT_KEY = 'shettar_turnstile_at';
/** Turnstile tokens expire quickly; keep a short reuse window for auth after browse. */
const TOKEN_TTL_MS = 4 * 60 * 1000;

export function getStoredTurnstileToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const at = Number(sessionStorage.getItem(TOKEN_AT_KEY) || 0);
    if (!token || !at) return null;
    if (Date.now() - at > TOKEN_TTL_MS) {
      clearStoredTurnstileToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function storeTurnstileToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TOKEN_AT_KEY, String(Date.now()));
  } catch {
    /* private mode */
  }
}

export function clearStoredTurnstileToken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_AT_KEY);
  } catch {
    /* ignore */
  }
}
