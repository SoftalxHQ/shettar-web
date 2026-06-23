import { getApiBaseUrl } from '@/app/helpers/businesses';
import { getStoredToken } from '@/app/helpers/auth';

export type TransactionPinErrorCode =
  | 'pin_required'
  | 'pin_not_set'
  | 'invalid_pin'
  | 'pin_mismatch'
  | 'invalid_pin_format'
  | 'invalid_password'
  | 'pin_already_set';

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

export async function isTransactionPinSet(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;

  const response = await fetch(`${getApiBaseUrl()}/account_details`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!response.ok) return false;

  const data = await response.json();
  return Boolean(data?.data?.transaction_pin_set);
}

export async function setTransactionPin(payload: {
  password: string;
  pin: string;
  pin_confirmation: string;
}): Promise<{ ok: boolean; message: string; code?: TransactionPinErrorCode }> {
  const token = getStoredToken();
  if (!token) return { ok: false, message: 'Not signed in' };

  const response = await fetch(`${getApiBaseUrl()}/api/v1/accounts/transaction_pin`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, message: data.error || 'Failed to set transaction PIN', code: data.code };
  }

  return { ok: true, message: data.message || 'Transaction PIN set successfully' };
}

export async function changeTransactionPin(payload: {
  current_pin: string;
  pin: string;
  pin_confirmation: string;
}): Promise<{ ok: boolean; message: string; code?: TransactionPinErrorCode }> {
  const token = getStoredToken();
  if (!token) return { ok: false, message: 'Not signed in' };

  const response = await fetch(`${getApiBaseUrl()}/api/v1/accounts/transaction_pin`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, message: data.error || 'Failed to change transaction PIN', code: data.code };
  }

  return { ok: true, message: data.message || 'Transaction PIN updated successfully' };
}
