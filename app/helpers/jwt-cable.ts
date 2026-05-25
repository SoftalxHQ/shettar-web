/** Lightweight JWT checks for ActionCable (no signature verify — server validates). */

export function isCableJwtUsable(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts.some((p) => !p)) return false;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (payload.exp != null && payload.exp * 1000 <= Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
