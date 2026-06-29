'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/lib/store/hooks';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '@/app/helpers/notification-preferences';
import {
  browserSupportsWebAuthn,
  listPasskeys,
  registerPasskey,
  revokePasskey,
  type PasskeySummary,
} from '@/app/helpers/passkeys';

const SecuritySettings = () => {
  const token = useAppSelector((s) => s.auth.token);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeys, setPasskeys] = useState<PasskeySummary[]>([]);
  const [passkeysLoading, setPasskeysLoading] = useState(false);
  const [registeringPasskey, setRegisteringPasskey] = useState(false);
  const [revokingPasskeyId, setRevokingPasskeyId] = useState<number | null>(null);

  useEffect(() => {
    setPasskeySupported(browserSupportsWebAuthn());
  }, []);

  const loadPasskeys = useCallback(async () => {
    if (!token) {
      setPasskeys([]);
      return;
    }

    setPasskeysLoading(true);
    try {
      const items = await listPasskeys(token);
      setPasskeys(items);
    } finally {
      setPasskeysLoading(false);
    }
  }, [token]);

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

  useEffect(() => {
    void loadPasskeys();
  }, [loadPasskeys]);

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

  const handleRegisterPasskey = async () => {
    if (!token) return;

    setRegisteringPasskey(true);
    const toastId = toast.loading('Registering passkey…');

    try {
      const result = await registerPasskey(token);
      if (result.cancelled) {
        toast.dismiss(toastId);
        return;
      }
      if (!result.ok) {
        toast.error(result.message, { id: toastId });
        return;
      }

      toast.success(result.message, { id: toastId });
      await loadPasskeys();
    } finally {
      setRegisteringPasskey(false);
    }
  };

  const handleRevokePasskey = async (passkeyId: number) => {
    if (!token) return;

    setRevokingPasskeyId(passkeyId);
    const toastId = toast.loading('Removing passkey…');

    try {
      const result = await revokePasskey(token, passkeyId);
      if (!result.ok) {
        toast.error(result.message, { id: toastId });
        return;
      }

      toast.success(result.message, { id: toastId });
      setPasskeys((prev) => prev.filter((p) => p.id !== passkeyId));
    } finally {
      setRevokingPasskeyId(null);
    }
  };

  const formatPasskeyDate = (iso: string | null) => {
    if (!iso) return 'Never';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleString();
  };

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

        <div className="border-top pt-4 mb-4">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h6 className="mb-1">Passkeys</h6>
              <p className="mb-0 small text-muted">
                Sign in without a password using your device&apos;s biometrics or security key.
              </p>
            </div>
            {token && passkeySupported && (
              <Button
                variant="outline-primary"
                size="sm"
                className="flex-shrink-0"
                disabled={registeringPasskey || passkeysLoading}
                onClick={handleRegisterPasskey}
              >
                {registeringPasskey ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Registering…
                  </>
                ) : (
                  'Register passkey'
                )}
              </Button>
            )}
          </div>

          {!token ? null : !passkeySupported ? (
            <p className="mb-0 small text-muted">Passkeys are not supported in this browser.</p>
          ) : passkeysLoading ? (
            <div className="py-2 text-center">
              <Spinner animation="border" size="sm" />
            </div>
          ) : passkeys.length === 0 ? (
            <p className="mb-0 small text-muted">No passkeys registered yet.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {passkeys.map((passkey) => (
                <li
                  key={passkey.id}
                  className="list-group-item px-0 d-flex justify-content-between align-items-center gap-3"
                >
                  <div className="min-w-0">
                    <div className="fw-semibold text-truncate">{passkey.nickname || 'Passkey'}</div>
                    <div className="small text-muted">
                      Added {formatPasskeyDate(passkey.created_at)}
                      {passkey.last_used_at ? ` · Last used ${formatPasskeyDate(passkey.last_used_at)}` : ''}
                    </div>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="flex-shrink-0"
                    disabled={revokingPasskeyId === passkey.id}
                    onClick={() => handleRevokePasskey(passkey.id)}
                  >
                    {revokingPasskeyId === passkey.id ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      'Remove'
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

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
