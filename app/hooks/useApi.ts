'use client';

/**
 * @deprecated Use RTK Query endpoints from `@/lib/store/services/apiService` instead.
 * This hook is retained only for components not yet migrated to Redux Toolkit.
 * 401 handling is now centralised in `lib/store/services/apiService.ts` via
 * `baseQueryWithReauth` — no need for this wrapper in new code.
 */

import { useCallback } from 'react';
import { useLayoutContext } from '@/app/states';

export const useApi = () => {
  const { logout } = useLayoutContext();

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, options);

    if (response.status === 401) {
      // Automatically logout if any authenticated request fails with 401
      await logout();
      throw new Error('Unauthorized');
    }

    return response;
  }, [logout]);

  return { apiFetch };
};
