'use client';

import { useHomeSearch } from '@/app/contexts/HomeSearchContext';
import { useAppSelector } from '@/lib/store/hooks';
import { hasAuthSession, isUsableJwt } from '@/app/helpers/auth';
import EnableNotificationsPrompt from '@/app/components/EnableNotificationsPrompt';

export default function HomeNotificationPrompt() {
  const { hasSearched } = useHomeSearch();
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const showPrompt =
    hasSearched || isAuthenticated || hasAuthSession() || isUsableJwt(token);

  return <EnableNotificationsPrompt triggerVisible={showPrompt} />;
}
