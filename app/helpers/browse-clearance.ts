import { getApiBaseUrl } from '@/app/helpers/businesses';
import {
  isBrowseClearanceRequiredResponse,
  isBrowseGateEnabled,
  redirectToBrowseVerify,
  storeBrowseClearanceToken,
  withBrowseCredentials,
} from '@/app/helpers/browse-gate';

export async function submitBrowseVerification(
  turnstileToken: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/browse/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turnstile_token: turnstileToken }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        message:
          (data as { error?: string }).error ||
          'Security check failed. Please try again.',
      };
    }

    const clearance = (data as { data?: { clearance_token?: string } }).data?.clearance_token;
    if (clearance) {
      storeBrowseClearanceToken(clearance);
    }

    return { ok: true, message: '' };
  } catch {
    return { ok: false, message: 'Unable to complete security check. Please try again.' };
  }
}

export async function browseAwareFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, withBrowseCredentials(init));

  if (typeof window !== 'undefined' && isBrowseGateEnabled()) {
    const body = await response
      .clone()
      .json()
      .catch(() => null);
    if (isBrowseClearanceRequiredResponse(response.status, body)) {
      redirectToBrowseVerify();
    }
  }

  return response;
}
