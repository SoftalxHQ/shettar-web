'use client';

import { hasActiveBusinessSearch } from '@/app/helpers/businesses';
import { useSearchParams } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type HomeSearchContextValue = {
  hasSearched: boolean;
  markSearched: () => void;
};

const HomeSearchContext = createContext<HomeSearchContextValue | null>(null);

export function HomeSearchProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (hasActiveBusinessSearch(searchParams)) {
      setHasSearched(true);
    }
  }, [searchParams]);

  const markSearched = useCallback(() => {
    setHasSearched(true);
  }, []);

  const value = useMemo(
    () => ({
      hasSearched,
      markSearched,
    }),
    [hasSearched, markSearched]
  );

  return <HomeSearchContext.Provider value={value}>{children}</HomeSearchContext.Provider>;
}

export function useHomeSearch() {
  const ctx = useContext(HomeSearchContext);
  if (!ctx) {
    throw new Error('useHomeSearch must be used within HomeSearchProvider');
  }
  return ctx;
}

export function useHomeSearchOptional() {
  return useContext(HomeSearchContext);
}
