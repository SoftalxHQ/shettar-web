'use client';

/**
 * useAccountProfile — RTK Query shim
 *
 * Backward-compatible replacement for the original Context-based implementation.
 * - `useAccountProfile()` reads from RTK Query (useGetAccountDetailsQuery)
 * - `AccountProfileProvider` is a no-op passthrough
 * - `saveAccountProfile` and `changeAccountPassword` are kept as direct fetch
 *   wrappers (they are called as standalone async functions, not hooks)
 * - `AccountProfile` interface is re-exported from apiService for consumers
 *   that import it from this file
 */

import type { ReactNode } from 'react';
import { useGetAccountDetailsQuery } from '@/lib/store/services/apiService';
import { useAppSelector } from '@/lib/store/hooks';
import { getStoredToken, signOut } from '@/app/helpers/auth';

// Re-export AccountProfile so existing imports from this file continue to work
export type { AccountProfile } from '@/lib/store/services/apiService';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAccountProfile() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { data: profile, isLoading, error, refetch } = useGetAccountDetailsQuery(
    undefined,
    { skip: !isAuthenticated },
  );

  return {
    profile: profile ?? null,
    isLoading,
    error: error ? 'Failed to load profile.' : null,
    refetch,
  };
}

// ─── Provider (no-op passthrough) ────────────────────────────────────────────

export function AccountProfileProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// ─── Standalone async helpers (kept as direct fetch wrappers) ─────────────────

/**
 * Saves profile changes to PUT /accounts/update
 */
export async function saveAccountProfile(
  fields: Partial<{
    first_name: string;
    last_name: string;
    other_name: string;
    phone_number: string;
    address: string;
    zip_code: string;
    gender: string;
    date_of_birth: string;
    emer_first_name: string;
    emer_last_name: string;
    emer_phone_number: string;
  }>,
  avatarFile?: File | null,
): Promise<{ ok: boolean; message: string }> {
  const token = getStoredToken();
  if (!token) return { ok: false, message: 'Not authenticated.' };

  try {
    let res: Response;

    if (avatarFile) {
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(`account[${k}]`, v as string);
      });
      formData.append('account[avatar]', avatarFile);
      res = await fetch(`${API_URL}/accounts/update`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    } else {
      res = await fetch(`${API_URL}/accounts/update`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: fields }),
      });
    }

    if (res.status === 401) {
      await signOut();
      return { ok: false, message: 'Session expired. Please sign in again.' };
    }

    const data = await res.json();
    if (res.ok) {
      return { ok: true, message: data?.status?.message ?? 'Profile updated successfully.' };
    }

    const errors: string[] = Array.isArray(data?.errors) ? data.errors : [];
    return {
      ok: false,
      message: errors[0] ?? data?.error?.[0]?.message ?? 'Failed to save profile.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server.' };
  }
}

/**
 * Changes password via PUT /accounts/change_password
 */
export async function changeAccountPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ ok: boolean; message: string }> {
  const token = getStoredToken();
  if (!token) return { ok: false, message: 'Not authenticated.' };

  try {
    const res = await fetch(`${API_URL}/accounts/change_password`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: {
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        },
      }),
    });

    if (res.status === 401) {
      await signOut();
      return { ok: false, message: 'Session expired. Please sign in again.' };
    }

    const data = await res.json();

    if (res.ok) {
      return { ok: true, message: data?.status?.message ?? 'Password updated successfully.' };
    }

    const errors: string[] = Array.isArray(data?.errors) ? data.errors : [];
    return {
      ok: false,
      message: errors[0] ?? data?.error?.[0]?.message ?? 'Failed to update password. Please check your current password.',
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server.' };
  }
}
