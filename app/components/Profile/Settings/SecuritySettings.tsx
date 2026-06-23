'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/lib/store/hooks';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '@/app/helpers/notification-preferences';

const SecuritySettings = () => {
  const token = useAppSelector((s) => s.auth.token);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetchNotificationPreferences(token).then((prefs: NotificationPreferences) => {
      if (!cancelled) {
        setLoginAlertsEnabled(prefs.login_alerts_enabled);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleToggleLoginAlerts = useCallback(
    async (nextValue: boolean) => {
      if (!token) return;

      const previous = loginAlertsEnabled;
      setLoginAlertsEnabled(nextValue);
      setSaving(true);

      try {
        const result = await updateNotificationPreferences(token, { login_alerts_enabled: nextValue });
        if (!result.ok) {
          setLoginAlertsEnabled(previous);
          toast.error(result.message || 'Failed to update login alerts');
          return;
        }

        if (result.preferences) {
          setLoginAlertsEnabled(result.preferences.login_alerts_enabled);
        }
      } catch {
        setLoginAlertsEnabled(previous);
        toast.error('Failed to update login alerts');
      } finally {
        setSaving(false);
      }
    },
    [loginAlertsEnabled, token]
  );

  return (
    <Card className="border">
      <CardHeader className="border-bottom d-flex justify-content-between align-items-center">
        <h4 className="card-header-title mb-0">Security settings</h4>
      </CardHeader>

      <CardBody>
        {!token ? (
          <p className="text-muted mb-4">Sign in to manage security settings.</p>
        ) : loading ? (
          <div className="py-3 text-center mb-4">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <div className="form-check form-switch form-check-md d-flex justify-content-between mb-4">
            <label className="form-check-label ps-0 pe-4" htmlFor="loginAlerts">
              <span className="d-block fw-semibold">Login alerts</span>
              <span className="d-block small text-muted">
                App, push, and email alerts when someone signs in (email uses notification settings)
              </span>
            </label>
            {saving ? (
              <Spinner animation="border" size="sm" className="flex-shrink-0 mt-1" />
            ) : (
              <input
                className="form-check-input flex-shrink-0"
                type="checkbox"
                id="loginAlerts"
                checked={loginAlertsEnabled}
                disabled={!token || loading || saving}
                onChange={(e) => handleToggleLoginAlerts(e.target.checked)}
              />
            )}
          </div>
        )}

        <div className="border-top pt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Two-factor authentication</h6>
            <span className="badge bg-warning text-dark">Coming Soon</span>
          </div>
          <p className="mb-0 small text-muted">
            Add a phone number to set up two-factor authentication.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default SecuritySettings;
