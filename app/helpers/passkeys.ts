/**
 * passkeys.ts — WebAuthn passkey sign-in and account passkey management.
 *
 * API endpoints:
 *   POST /accounts/passkey_auth/challenge  → authentication options
 *   POST /accounts/passkey_auth/verify     → verify credential, issue JWT
 *   POST /accounts/passkeys/options        → registration options (auth required)
 *   POST /accounts/passkeys              → register credential (auth required)
 *   GET  /accounts/passkeys              → list passkeys (auth required)
 *   DELETE /accounts/passkeys/:id          → revoke passkey (auth required)
 */

import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import { parseApiError } from '@/app/helpers/review-thread';
import { saveAuthSession, type AuthResult, type StoredUser } from '@/app/helpers/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export { browserSupportsWebAuthn };

function isPasskeyUserCancellation(err: unknown): boolean {
  if (!err) return false;

  if (err instanceof DOMException) {
    return err.name === 'NotAllowedError' || err.name === 'AbortError';
  }

  if (err instanceof Error) {
    if (err.name === 'NotAllowedError' || err.name === 'AbortError') return true;
    if (/not allowed|timed out|cancelled|canceled|abort/i.test(err.message)) return true;
  }

  return false;
}

export type PasskeySummary = {
  id: number;
  nickname: string;
  last_used_at: string | null;
  created_at: string;
};

type PasskeyResult = {
  ok: boolean;
  message: string;
  cancelled?: boolean;
};

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function storedUserFromPayload(raw: Record<string, unknown>): StoredUser {
  return {
    id: raw.id as number,
    email: raw.email as string,
    first_name: raw.first_name as string,
    last_name: raw.last_name as string,
    phone_number: (raw.phone_number as string | null | undefined) ?? null,
    phone_verified: Boolean(raw.phone_verified),
    email_verified: Boolean(raw.email_verified),
    address: (raw.address as string | null | undefined) ?? null,
    zip_code: (raw.zip_code as string | null | undefined) ?? null,
    avatar_url: (raw.avatar_url as string | null | undefined) ?? null,
  };
}

/**
 * Sign in with a discoverable passkey (no email required).
 */
export async function startPasskeySignIn(email?: string): Promise<AuthResult> {
  try {
    const challengeRes = await fetch(`${API_URL}/accounts/passkey_auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email ? { email } : {}),
    });
    const challengeData = await challengeRes.json();

    if (!challengeRes.ok) {
      return {
        ok: false,
        message: parseApiError(challengeData, 'Unable to start passkey sign-in.'),
      };
    }

    const { challenge_token, options } = challengeData.data ?? {};
    if (!challenge_token || !options) {
      return { ok: false, message: 'Invalid passkey challenge response.' };
    }

    const credential = await startAuthentication({ optionsJSON: options });

    const verifyRes = await fetch(`${API_URL}/accounts/passkey_auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_token, credential }),
    });
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      return {
        ok: false,
        message: parseApiError(verifyData, 'Passkey verification failed.'),
      };
    }

    const authHeader = verifyRes.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim() ?? '';
    if (!token) {
      return { ok: false, message: 'Sign-in succeeded but no session token was returned.' };
    }

    const user = storedUserFromPayload(verifyData.data ?? {});
    saveAuthSession(user, token);
    return { ok: true, message: 'Signed in with passkey.', user, token };
  } catch (err) {
    if (isPasskeyUserCancellation(err)) {
      return { ok: false, cancelled: true, message: '' };
    }
    const message = err instanceof Error ? err.message : 'Passkey sign-in failed.';
    return { ok: false, message };
  }
}

export async function registerPasskey(token: string, nickname?: string): Promise<PasskeyResult> {
  try {
    const optionsRes = await fetch(`${API_URL}/accounts/passkeys/options`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(nickname ? { nickname } : {}),
    });
    const optionsData = await optionsRes.json();

    if (!optionsRes.ok) {
      return {
        ok: false,
        message: parseApiError(optionsData, 'Unable to start passkey registration.'),
      };
    }

    const { challenge_token, options } = optionsData.data ?? {};
    if (!challenge_token || !options) {
      return { ok: false, message: 'Invalid passkey registration response.' };
    }

    const credential = await startRegistration({ optionsJSON: options });

    const createRes = await fetch(`${API_URL}/accounts/passkeys`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ challenge_token, credential, nickname }),
    });
    const createData = await createRes.json();

    if (!createRes.ok) {
      return {
        ok: false,
        message: parseApiError(createData, 'Failed to register passkey.'),
      };
    }

    return {
      ok: true,
      message: createData.status?.message ?? 'Passkey registered successfully.',
    };
  } catch (err) {
    if (isPasskeyUserCancellation(err)) {
      return { ok: false, cancelled: true, message: '' };
    }
    const message = err instanceof Error ? err.message : 'Passkey registration failed.';
    return { ok: false, message };
  }
}

export async function listPasskeys(token: string): Promise<PasskeySummary[]> {
  const res = await fetch(`${API_URL}/accounts/passkeys`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) return [];
  return Array.isArray(data.data) ? data.data : [];
}

export async function revokePasskey(token: string, passkeyId: number): Promise<PasskeyResult> {
  try {
    const res = await fetch(`${API_URL}/accounts/passkeys/${passkeyId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        message: parseApiError(data, 'Failed to remove passkey.'),
      };
    }

    return {
      ok: true,
      message: data.status?.message ?? 'Passkey removed successfully.',
    };
  } catch {
    return { ok: false, message: 'Failed to remove passkey.' };
  }
}
