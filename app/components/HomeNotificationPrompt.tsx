'use client';

import { useHomeSearch } from '@/app/contexts/HomeSearchContext';
import { useAppSelector } from '@/lib/store/hooks';
import { isCableJwtUsable } from '@/app/helpers/jwt-cable';
import EnableNotificationsPrompt from '@/app/components/EnableNotificationsPrompt';

export default function HomeNotificationPrompt() {
  const { hasSearched } = useHomeSearch();
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const showPrompt =
    hasSearched || (isAuthenticated && isCableJwtUsable(token));

  return <EnableNotificationsPrompt triggerVisible={showPrompt} />;
}
