const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export const ACCOUNT_DELETION_REASONS = [
  { value: 'not_using', label: "I'm not using the app anymore" },
  { value: 'privacy', label: 'Privacy concerns' },
  { value: 'too_many_notifications', label: 'Too many emails/notifications' },
  { value: 'found_alternative', label: 'I found a better alternative' },
  { value: 'other', label: 'Other' },
] as const;

export type AccountDeletionReason = (typeof ACCOUNT_DELETION_REASONS)[number]['value'];

export interface AccountDeletionResult {
  ok: boolean;
  message: string;
  deletion_pending?: boolean;
  deletion_scheduled_at?: string | null;
  deletion_execute_at?: string | null;
  deletion_reason?: string | null;
  code?: string;
}

export function formatDeletionCountdown(executeAt: string | null | undefined, now = Date.now()): string {
  if (!executeAt) return '00:00:00';

  const remainingMs = new Date(executeAt).getTime() - now;
  if (remainingMs <= 0) return '00:00:00';

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export async function scheduleAccountDeletion(
  token: string,
  params: { reason: AccountDeletionReason; reasonDetail?: string }
): Promise<AccountDeletionResult> {
  try {
    const res = await fetch(`${API_URL}/api/v1/accounts/deletion/schedule`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: params.reason,
        reason_detail: params.reason === 'other' ? params.reasonDetail : undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return {
        ok: true,
        message: data.message ?? 'Account deletion scheduled.',
        deletion_pending: data.deletion_pending,
        deletion_scheduled_at: data.deletion_scheduled_at,
        deletion_execute_at: data.deletion_execute_at,
        deletion_reason: data.deletion_reason,
      };
    }

    return {
      ok: false,
      message: data.error ?? data.message ?? 'Failed to schedule account deletion.',
      code: data.code,
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}

export async function cancelAccountDeletion(token: string): Promise<AccountDeletionResult> {
  try {
    const res = await fetch(`${API_URL}/api/v1/accounts/deletion/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return {
        ok: true,
        message: data.message ?? 'Account deletion cancelled.',
        deletion_pending: data.deletion_pending,
        deletion_scheduled_at: data.deletion_scheduled_at,
        deletion_execute_at: data.deletion_execute_at,
        deletion_reason: data.deletion_reason,
      };
    }

    return {
      ok: false,
      message: data.error ?? data.message ?? 'Failed to cancel account deletion.',
      code: data.code,
    };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}
