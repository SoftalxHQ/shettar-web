import { getApiBaseUrl } from '@/app/helpers/businesses';

export type NotificationPreferences = {
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  in_app_enabled: true,
  email_enabled: true,
  push_enabled: false,
};

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

export async function fetchNotificationPreferences(token: string): Promise<NotificationPreferences> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/accounts/notification_preferences`, {
    headers: authHeaders(token),
  });

  if (!response.ok) return DEFAULT_PREFERENCES;

  const data = await response.json();
  return { ...DEFAULT_PREFERENCES, ...(data.preferences ?? {}) };
}

export async function updateNotificationPreferences(
  token: string,
  preferences: Partial<NotificationPreferences>
): Promise<{ ok: boolean; preferences?: NotificationPreferences; message?: string }> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/accounts/notification_preferences`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ preferences }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, message: data.error || 'Failed to update notification settings' };
  }

  return { ok: true, preferences: { ...DEFAULT_PREFERENCES, ...(data.preferences ?? {}) } };
}
