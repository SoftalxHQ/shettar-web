'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/lib/store/hooks';
import { getOrCreateGuestId } from '@/app/helpers/guest-id';
import { getStoredToken } from '@/app/helpers/auth';
import {
  showPushNotConfiguredToast,
  showPushPermissionDeniedToast,
} from '@/app/helpers/notification-display';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '@/app/helpers/notification-preferences';
import {
  getWebPushConfigIssues,
  isWebPushConfigured,
  requestWebPushPermissionAndRegister,
  unregisterWebPushDevice,
} from '@/app/helpers/push-notifications';

const NotificationSettings = () => {
  const reduxToken = useAppSelector((s) => s.auth.token);
  const token = reduxToken ?? (typeof window !== 'undefined' ? getStoredToken() : null);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<keyof NotificationPreferences | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetchNotificationPreferences(token).then((data) => {
      if (!cancelled) {
        setPrefs(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleToggle = useCallback(
    async (key: keyof NotificationPreferences, nextValue: boolean) => {
      if (!token || !prefs) return;

      const previous = prefs;
      setPrefs({ ...prefs, [key]: nextValue });
      setSavingKey(key);

      try {
        if (key === 'push_enabled' && nextValue) {
          const guestId = getOrCreateGuestId();
          const result = await requestWebPushPermissionAndRegister({ authToken: token, guestId });
          if (!result.ok) {
            setPrefs(previous);
            if (result.reason === 'denied') {
              showPushPermissionDeniedToast();
            } else if (result.reason === 'not_configured') {
              showPushNotConfiguredToast(getWebPushConfigIssues());
            } else {
              toast.error(result.message || 'Could not enable web push. Please try again.');
            }
            return;
          }
        }

        if (key === 'push_enabled' && !nextValue) {
          await unregisterWebPushDevice({ authToken: token, guestId: getOrCreateGuestId() });
        }

        const result = await updateNotificationPreferences(token, { [key]: nextValue });
        if (!result.ok) {
          setPrefs(previous);
          toast.error(result.message || 'Failed to update settings');
          return;
        }

        if (result.preferences) setPrefs(result.preferences);

        if (key === 'push_enabled' && nextValue) {
          toast.success('Web push notifications enabled', { icon: '🔔' });
        } else if (key !== 'push_enabled' || !nextValue) {
          toast.success('Notification settings saved');
        }
      } catch (error) {
        setPrefs(previous);
        const detail = error instanceof Error ? error.message : undefined;
        toast.error(detail || 'Failed to update settings');
      } finally {
        setSavingKey(null);
      }
    },
    [prefs, token]
  );

  const renderSwitch = (
    id: string,
    label: string,
    description: string,
    key: keyof NotificationPreferences
  ) => {
    const checked = prefs?.[key] ?? false;
    const pushUnavailable = key === 'push_enabled' && !isWebPushConfigured();
    const disabled = !token || loading || savingKey === key || pushUnavailable;

    return (
      <div className="form-check form-switch form-check-md d-flex justify-content-between mb-4">
        <label className="form-check-label ps-0 pe-4" htmlFor={id}>
          <span className="d-block fw-semibold">{label}</span>
          <span className="d-block small text-muted">{description}</span>
        </label>
        {savingKey === key ? (
          <Spinner animation="border" size="sm" className="flex-shrink-0 mt-1" />
        ) : (
          <input
            className="form-check-input flex-shrink-0"
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={(e) => handleToggle(key, e.target.checked)}
          />
        )}
      </div>
    );
  };

  return (
    <Card className="border">
      <CardHeader className="border-bottom">
        <h4 className="card-header-title">Notification Settings</h4>
      </CardHeader>

      <CardBody>
        {!token ? (
          <p className="text-muted mb-0">Sign in to manage notification preferences.</p>
        ) : loading ? (
          <div className="py-3 text-center">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <>
            {renderSwitch(
              'inAppNotifications',
              'In-app notifications',
              'Show alerts in your notification inbox',
              'in_app_enabled'
            )}
            {renderSwitch(
              'emailNotifications',
              'Email notifications',
              'Receive transaction and booking emails',
              'email_enabled'
            )}
            {renderSwitch(
              'webPushNotifications',
              'Web push notifications',
              isWebPushConfigured()
                ? 'Your browser will ask to allow notifications on this device'
                : 'Not available — Firebase web push is not configured for this environment',
              'push_enabled'
            )}
            {!isWebPushConfigured() && (
              <p className="small text-warning mb-0">
                Add your Firebase web config and{' '}
                <code className="text-warning">NEXT_PUBLIC_FCM_VAPID_KEY</code> to enable push on this
                site, then rebuild or restart the dev server.
              </p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default NotificationSettings;
