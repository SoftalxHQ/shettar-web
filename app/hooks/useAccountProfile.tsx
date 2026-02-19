'use client';

/**
 * AccountProfileContext
 *
 * Provides profile data to all profile page components from a single fetch.
 * Wrap the profile page (or UserLayout) with <AccountProfileProvider>.
 * All components call useAccountProfile() which reads from this context
 * instead of firing their own independent fetch.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getStoredToken } from '@/app/helpers/auth';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

export interface AccountProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  other_name?: string | null;
  phone_number?: string | null;
  address?: string | null;
  zip_code?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  wallet_balance?: number | string | null;
  account_unique_id?: string | null;
  email_verified?: boolean;
  avatar_url?: string | null;
  emer_first_name?: string | null;
  emer_last_name?: string | null;
  emer_phone_number?: string | null;
}

interface AccountProfileContextValue {
  profile: AccountProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const AccountProfileContext = createContext<AccountProfileContextValue>({
  profile: null,
  isLoading: true,
  error: null,
  refetch: () => { },
});

export function AccountProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const token = getStoredToken();
    if (!token) {
      setError('Not authenticated.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/account_details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data?.status?.code === 200) {
        setProfile(data.data as AccountProfile);
      } else {
        setError(data?.message ?? 'Failed to load profile.');
      }
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return (
    <AccountProfileContext.Provider value= {{ profile, isLoading, error, refetch: fetchProfile }
}>
  { children }
  </AccountProfileContext.Provider>
  );
}

export function useAccountProfile() {
  return useContext(AccountProfileContext);
}

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
