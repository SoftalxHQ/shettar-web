'use client';

import { useHomeSearch } from '@/app/contexts/HomeSearchContext';
import EnableNotificationsPrompt from '@/app/components/EnableNotificationsPrompt';

export default function HomeNotificationPrompt() {
  const { hasSearched } = useHomeSearch();
  return <EnableNotificationsPrompt triggerVisible={hasSearched} />;
}
