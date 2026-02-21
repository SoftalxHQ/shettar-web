'use client';

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
