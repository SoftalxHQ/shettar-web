'use client';

import { useHomeSearch } from '@/app/contexts/HomeSearchContext';
import EnableLocationForAdsPrompt from '@/app/components/EnableLocationForAdsPrompt';

export default function HomeLocationPrompt() {
  const { hasSearched } = useHomeSearch();
  return <EnableLocationForAdsPrompt triggerVisible={!hasSearched} />;
}
