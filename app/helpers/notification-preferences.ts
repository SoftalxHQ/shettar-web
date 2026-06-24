import { getApiBaseUrl } from '@/app/helpers/businesses';

export type NotificationPreferences = {
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  login_alerts_enabled: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  in_app_enabled: true,
  email_enabled: true,
  push_enabled: false,
  login_alerts_enabled: false,
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

function parseApiErrorMessage(data: unknown, status: number): string {
  if (!data || typeof data !== 'object') {
    if (status === 401) return 'Your session expired. Please sign in again.';
    if (status === 403) return 'You do not have permission to update these settings.';
    return `Could not save settings (HTTP ${status}).`;
  }

  const body = data as Record<string, unknown>;
  if (typeof body.error === 'string') return body.error;
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const first = body.errors[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && 'message' in first && typeof first.message === 'string') {
      return first.message;
    }
  }
  if (typeof body.message === 'string') return body.message;

  if (status === 401) return 'Your session expired. Please sign in again.';
  return 'Failed to update notification settings';
}

export async function updateNotificationPreferences(
  token: string,
  preferences: Partial<NotificationPreferences>
): Promise<{ ok: boolean; preferences?: NotificationPreferences; message?: string }> {
  try {
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
      return { ok: false, message: parseApiErrorMessage(data, response.status) };
    }

    return { ok: true, preferences: { ...DEFAULT_PREFERENCES, ...(data.preferences ?? {}) } };
  } catch {
    return { ok: false, message: 'Network error — could not reach the server. Check your connection and try again.' };
  }
}
