'use client';

/**
 * @deprecated Use RTK Query endpoints from `@/lib/store/services/apiService` instead.
 * This hook is retained only for components not yet migrated to Redux Toolkit.
 * 401 handling is now centralised in `lib/store/services/apiService.ts` via
 * `baseQueryWithReauth` — no need for this wrapper in new code.
 */

import { useCallback } from 'react';
import { useLayoutContext } from '@/app/states';
import { useAppSelector } from '@/lib/store/hooks';
import { authorizationHeaders, getStoredToken, isUsableJwt } from '@/app/helpers/auth';
import { resolveApiUrl } from '@/app/helpers/api-base-url';

export const useApi = () => {
  const { logout } = useLayoutContext();
  const reduxToken = useAppSelector((s) => s.auth.token);

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    const token = isUsableJwt(reduxToken) ? reduxToken : getStoredToken();
    if (isUsableJwt(token) && !headers.has('Authorization')) {
      Object.entries(authorizationHeaders(token)).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    const response = await fetch(resolveApiUrl(url), {
      ...options,
      credentials: options.credentials ?? 'include',
      headers,
    });

    if (response.status === 401) {
      const sentAuth = headers.get('Authorization');
      // A request that never sent a Bearer (cookie not attached) must not revoke
      // a still-valid tab JWT via sign_out.
      if (sentAuth) await logout();
      throw new Error('Unauthorized');
    }

    return response;
  }, [logout, reduxToken]);

  return { apiFetch };
};
