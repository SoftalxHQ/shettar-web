/**
 * auth.ts
 *
 * All auth calls in abri-web use the ACCOUNT model (consumer/guest), not the
 * User (hotel-staff) model. Protected endpoints like reviews, reservations,
 * and the wallet all use `authenticate_account!`.
 *
 * API endpoints:
 *   POST   /accounts/sign_in          → dispatch JWT
 *   POST   /accounts/sign_up          → create account (sends verification code)
 *   DELETE /accounts/sign_out         → revoke JWT
 *   POST   /accounts/verify_email     → verify 6-digit code after sign-up
 *   POST   /accounts/resend_verification → resend verification code
 *   POST   /accounts/reset_password   → send 6-digit password reset code
 *   PUT    /accounts/update_password  → apply reset code + new password
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  phone_verified?: boolean;
  address?: string | null;
  zip_code?: string | null;
  avatar_url?: string | null;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResult {
  ok: boolean;
  message: string;
  errors?: string[];
  user?: StoredUser;
  token?: string;
  errorCode?: string; // e.g. 'email_not_verified'
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export const saveAuthSession = (user: StoredUser, token: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * DELETE /accounts/sign_out
 * Revokes the JWT on the server (via Devise-JWT JTI matcher) so the token
 * cannot be reused even before it expires. Always clears local storage,
 * even if the network request fails.
 */
export async function signOut(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${API_URL}/accounts/sign_out`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      // We intentionally ignore the response status — even if the server
      // returns an error we still want to clear the local session.
    } catch {
      // Network failure — local session will still be cleared below.
    }
  }
  clearAuthSession();
}

export const getStoredUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /accounts/sign_in
 * Authenticates an Account (consumer/guest) and stores the JWT + user in localStorage.
 */
export async function signIn(payload: SignInPayload): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/accounts/sign_in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: payload }),
    });

    const data = await res.json();

    if (res.ok && data?.status?.code === 200) {
      const authHeader = res.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '') ?? '';

      const raw = data.data;
      const user: StoredUser = {
        id: raw.id,
        email: raw.email,
        first_name: raw.first_name,
        last_name: raw.last_name,
        phone_number: raw.phone_number ?? null,
        phone_verified: raw.phone_verified ?? false,
        address: raw.address ?? null,
        zip_code: raw.zip_code ?? null,
        avatar_url: raw.avatar_url ?? null,
      };

      saveAuthSession(user, token);
      return { ok: true, message: 'Signed in successfully.', user, token };
    }

    // Handle unverified email — frontend should redirect to /auth/verify-email
    if (res.status === 403 && data?.error_code === 'email_not_verified') {
      return {
        ok: false,
        errorCode: 'email_not_verified',
        message: data?.status?.message ?? 'Please verify your email before signing in.',
      };
    }

    return {
      ok: false,
      message: data?.status?.message ?? data?.error ?? 'Invalid email or password.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}

/**
 * POST /accounts/google_auth
 * Authenticates an Account using a Google ID Token.
 */
export async function signInWithGoogle(googleToken: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/accounts/google_auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ google_token: googleToken }),
    });

    const data = await res.json();

    if (res.ok && data?.status?.code === 200) {
      const authHeader = res.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '') ?? '';

      const raw = data.data;
      const user: StoredUser = {
        id: raw.id,
        email: raw.email,
        first_name: raw.first_name,
        last_name: raw.last_name,
        phone_number: raw.phone_number ?? null,
        phone_verified: raw.phone_verified ?? false,
        address: raw.address ?? null,
        zip_code: raw.zip_code ?? null,
        avatar_url: raw.avatar_url ?? null,
      };

      saveAuthSession(user, token);
      return { ok: true, message: 'Signed in with Google successfully.', user, token };
    }

    return {
      ok: false,
      message: data?.error || data?.status?.message || 'Google sign in failed.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}

/**
 * POST /accounts/sign_up
 * Creates a new Account. Body key is `account` (not `user`).
 * Success response shape: { status: { code: 200, message, data } }
 * Error response shape:   { errors: ["Email has already been taken", ...] }
 */
export async function signUp(payload: SignUpPayload): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/accounts/sign_up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: payload }),
    });

    const data = await res.json();

    if (res.ok && data?.status?.code === 200) {
      const authHeader = res.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '') ?? '';

      const raw = data.status.data;
      const user: StoredUser = {
        id: raw.id,
        email: raw.email,
        first_name: raw.first_name,
        last_name: raw.last_name,
        phone_number: raw.phone_number ?? null,
        phone_verified: raw.phone_verified ?? false,
        address: raw.address ?? null,
        zip_code: raw.zip_code ?? null,
        avatar_url: raw.avatar_url ?? null,
      };

      if (token && user.id) {
        saveAuthSession(user, token);
      }
      return { ok: true, message: data.status.message ?? 'Account created successfully.', user, token };
    }

    // Error shape from Accounts::RegistrationsController: { errors: [...] }
    const errors: string[] = Array.isArray(data?.errors) ? data.errors : [];
    return {
      ok: false,
      message: errors.length ? errors[0] : (data?.status?.message ?? 'Could not create account.'),
      errors,
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}

/**
 * POST /accounts/reset_password
 * Sends a 6-digit reset code to the account's email address.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/accounts/reset_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: { email } }),
    });

    const data = await res.json();

    if (res.ok) {
      return { ok: true, message: data.message ?? 'Reset instructions sent.' };
    }

    return {
      ok: false,
      message: data?.error?.[0]?.message ?? data?.message ?? 'Failed to send reset instructions.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}

/**
 * PUT /accounts/update_password
 * Resets the password using the 6-digit code sent to the account's email.
 */
export async function resetPassword(
  resetToken: string,
  password: string,
  passwordConfirmation: string,
): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/accounts/update_password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account: {
          reset_password_token: resetToken,
          password,
          password_confirmation: passwordConfirmation,
        },
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return { ok: true, message: data.message ?? 'Password updated successfully.' };
    }

    return {
      ok: false,
      message: data?.error?.[0]?.message ?? data?.message ?? 'Invalid or expired reset code.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}

/**
 * POST /accounts/verify_email
 * Verifies the 6-digit code the user received after sign-up.
 */
export async function verifyEmail(email: string, code: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/accounts/verify_email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: { email, code } }),
    });

    const data = await res.json();

    if (res.ok) {
      return { ok: true, message: data.message ?? 'Email verified successfully.' };
    }

    return {
      ok: false,
      message: data?.error?.[0]?.message ?? data?.message ?? 'Invalid or expired code.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}

/**
 * POST /accounts/resend_verification
 * Resends a fresh 6-digit verification code to the account's email.
 */
export async function resendVerification(email: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/accounts/resend_verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: { email } }),
    });

    const data = await res.json();

    if (res.ok) {
      return { ok: true, message: data.message ?? 'Verification code resent.' };
    }

    return {
      ok: false,
      message: data?.error?.[0]?.message ?? data?.message ?? 'Failed to resend code.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}

/**
 * POST /accounts/verify_phone
 * Verifies the 6-digit code the user received via SMS.
 */
export async function verifyPhone(code: string): Promise<AuthResult> {
  const token = getStoredToken();
  try {
    const res = await fetch(`${API_URL}/accounts/verify_phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ account: { code } }),
    });

    const data = await res.json();

    if (res.ok) {
      return { ok: true, message: data.message ?? 'Phone number verified successfully.' };
    }

    return {
      ok: false,
      message: data?.error?.[0]?.message ?? data?.message ?? 'Invalid or expired code.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}

/**
 * POST /accounts/resend_phone_verification
 * Sends a 6-digit verification code to the account's phone number.
 */
export async function resendPhoneVerification(): Promise<AuthResult> {
  const token = getStoredToken();
  try {
    const res = await fetch(`${API_URL}/accounts/resend_phone_verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
    });

    const data = await res.json();

    if (res.ok) {
      return { ok: true, message: data.message ?? 'Verification code sent.' };
    }

    return {
      ok: false,
      message: data?.error?.[0]?.message ?? data?.message ?? 'Failed to send code.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}
