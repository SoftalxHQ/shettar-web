'use client';

import { type ReactNode, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setTheme, setDir } from '@/lib/store/slices/themeSlice';
import { updateHotelStats as updateHotelStatsAction } from '@/lib/store/slices/hotelStatsSlice';
import { clearCredentials, setCredentials } from '@/lib/store/slices/authSlice';
import {
  apiService,
  useSignOutMutation,
  useGetAccountDetailsQuery,
} from '@/lib/store/services/apiService';
import { useRouter } from 'next/navigation';
import { getStoredUser, getStoredToken, clearAuthSession, signOut } from '@/app/helpers/auth';

export type LayoutState = {
  theme: 'light' | 'dark' | 'auto';
  dir: 'ltr' | 'rtl';
  hotelCount: number | null;
  hotelLocation: string | null;
  isAuthenticated: boolean;
  account: any | null;
  isAccountLoading: boolean;
};

type LayoutType = LayoutState & {
  updateTheme: (theme: LayoutState['theme']) => void;
  updateDir: (dir: LayoutState['dir']) => void;
  updateHotelStats: (count: number, location: string | null) => void;
  refreshAuth: () => void;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
};

export function useLayoutContext(): LayoutType {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [signOutMutation] = useSignOutMutation();

  const theme = useAppSelector((s) => s.theme.theme);
  const dir = useAppSelector((s) => s.theme.dir);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const authUser = useAppSelector((s) => s.auth.user);
  const isAccountLoading = useAppSelector((s) => s.auth.isAccountLoading);
  const hotelCount = useAppSelector((s) => s.hotelStats.hotelCount);
  const hotelLocation = useAppSelector((s) => s.hotelStats.hotelLocation);

  // Use the full profile from RTK Query cache — it has all fields (email_verified,
  // avatar_url, emer_*, etc.) that the slim StoredUser in auth slice lacks.
  const { data: fullProfile, isLoading: profileLoading } = useGetAccountDetailsQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Merge: prefer full profile when available, fall back to auth slice user
  const account = fullProfile ?? authUser;

  // Sync legacy session on mount if Redux is empty but localStorage has data
  useEffect(() => {
    if (!isAuthenticated) {
      const user = getStoredUser();
      const token = getStoredToken();
      if (user && token) {
        dispatch(setCredentials({ user, token }));
      }
    }
  }, [isAuthenticated, dispatch]);

  // Stable callbacks — dispatch is stable, so these never change reference
  const updateTheme = useCallback(
    (t: LayoutState['theme']) => dispatch(setTheme(t)),
    [dispatch]
  );

  const updateDir = useCallback(
    (d: LayoutState['dir']) => dispatch(setDir(d)),
    [dispatch]
  );

  const updateHotelStats = useCallback(
    (count: number, location: string | null) =>
      dispatch(updateHotelStatsAction({ count, location })),
    [dispatch]
  );

  const refreshAuth = useCallback(() => {
    const user = getStoredUser();
    const token = getStoredToken();
    if (user && token) {
      dispatch(setCredentials({ user, token }));
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await signOut();
    await signOutMutation();
    dispatch(clearCredentials());
    clearAuthSession();
    router.push('/auth/sign-in');
  }, [dispatch, signOutMutation, router]);

  const refreshAccount = useCallback(async () => {
    await dispatch(apiService.endpoints.getAccountDetails.initiate(undefined, { forceRefetch: true }));
  }, [dispatch]);

  return {
    theme,
    dir,
    isAuthenticated,
    account,
    // Show loading while auth slice is loading OR while the full profile is being fetched
    isAccountLoading: isAccountLoading || (isAuthenticated && profileLoading && !fullProfile),
    hotelCount,
    hotelLocation,
    updateTheme,
    updateDir,
    updateHotelStats,
    refreshAuth,
    logout,
    refreshAccount,
  };
}

// LayoutProvider becomes a no-op passthrough
export const LayoutProvider = ({ children }: { children: ReactNode }) => (
  <>{children}</>
);

export default useLayoutContext;
