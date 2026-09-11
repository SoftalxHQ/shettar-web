const FALLBACK_API_URL = 'http://127.0.0.1:3000';
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function getConfiguredApiBaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = rawUrl && rawUrl !== 'undefined' ? rawUrl : FALLBACK_API_URL;
  return baseUrl.replace(/\/$/, '');
}

/**
 * API origin for browser fetches. On loopback, align 127.0.0.1 with the page
 * hostname (or vice versa) so SameSite=Lax cookies attach.
 */
export function getApiBaseUrl(): string {
  const configured = getConfiguredApiBaseUrl();
  if (typeof window === 'undefined') return configured;
  try {
    const url = new URL(configured);
    const pageHost = window.location.hostname;
    if (LOOPBACK_HOSTS.has(pageHost) && LOOPBACK_HOSTS.has(url.hostname) && pageHost !== url.hostname) {
      url.hostname = pageHost;
    }
    return url.origin;
  } catch {
    return configured;
  }
}

export function getCableUrl(): string {
  return `${getApiBaseUrl().replace(/^http/, 'ws')}/cable`;
}

/** Rewrite relative and loopback API URLs onto the cookie-aligned origin. */
export function resolveApiUrl(pathOrUrl: string): string {
  const base = getApiBaseUrl();
  if (!pathOrUrl) return base;
  if (pathOrUrl.startsWith('/')) return `${base}${pathOrUrl}`;
  try {
    const parsed = new URL(pathOrUrl);
    const aligned = new URL(base);
    const configured = new URL(getConfiguredApiBaseUrl());
    const sameApiHost =
      LOOPBACK_HOSTS.has(parsed.hostname) && parsed.port === aligned.port;
    const matchesConfiguredOrigin = parsed.origin === configured.origin;
    if (sameApiHost || matchesConfiguredOrigin) {
      parsed.protocol = aligned.protocol;
      parsed.hostname = aligned.hostname;
      parsed.port = aligned.port;
      return parsed.toString();
    }
  } catch {
    return `${base}/${pathOrUrl.replace(/^\//, '')}`;
  }
  return pathOrUrl;
}
