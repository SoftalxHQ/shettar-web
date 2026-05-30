'use client';

import { useCallback, useEffect, useState } from 'react';
import { BsBell } from 'react-icons/bs';
import { useAppSelector } from '@/lib/store/hooks';
import { isCableJwtUsable } from '@/app/helpers/jwt-cable';
import { getOrCreateGuestId } from '@/app/helpers/guest-id';
import {
  markPushNotificationPromptDismissed,
  shouldShowPushNotificationPrompt,
} from '@/app/helpers/push-notification-prompt';
import { isWebPushConfigured, requestWebPushPermissionAndRegister } from '@/app/helpers/push-notifications';

type Props = {
  triggerVisible: boolean;
};

export default function EnableNotificationsPrompt({ triggerVisible }: Props) {
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [visible, setVisible] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (!triggerVisible || !isWebPushConfigured()) {
      setVisible(false);
      return;
    }
    setVisible(shouldShowPushNotificationPrompt());
  }, [triggerVisible]);

  const handleEnable = useCallback(async () => {
    setEnabling(true);
    try {
      const guestId = getOrCreateGuestId();
      const authToken = isAuthenticated && isCableJwtUsable(token) ? token : null;
      const fcmToken = await requestWebPushPermissionAndRegister({ authToken, guestId });
      setVisible(false);
      if (!fcmToken) {
        markPushNotificationPromptDismissed();
      }
    } finally {
      setEnabling(false);
    }
  }, [isAuthenticated, token]);

  const handleDismiss = useCallback(() => {
    markPushNotificationPromptDismissed();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="container pb-2">
      <div
        className="d-flex align-items-start gap-3 rounded-3 p-3 p-md-4 border"
        style={{ backgroundColor: 'rgba(81, 67, 217, 0.08)', borderColor: 'rgba(81, 67, 217, 0.25)' }}
      >
        <BsBell className="text-primary flex-shrink-0 mt-1" size={22} />
        <div className="flex-grow-1">
          <h6 className="mb-1 fw-bold">Stay in the loop</h6>
          <p className="text-muted small mb-3 mb-md-2">
            Get deals and booking updates. You can turn this off anytime in your browser settings.
          </p>
          <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3">
            <button
              type="button"
              className="btn btn-primary btn-sm fw-semibold"
              onClick={handleEnable}
              disabled={enabling}
            >
              {enabling ? 'Enabling…' : 'Enable notifications'}
            </button>
            <button
              type="button"
              className="btn btn-link btn-sm text-muted text-decoration-none p-0"
              onClick={handleDismiss}
              disabled={enabling}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
