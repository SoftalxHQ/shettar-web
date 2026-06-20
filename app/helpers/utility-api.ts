import { getStoredToken } from '@/app/helpers/auth';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

export type UtilityNetwork = {
  name: string;
  label: string;
  color: string;
};

export type UtilityProvider = {
  name: string;
  label: string;
  color?: string;
  service_id?: string;
};

export type DataVariation = {
  variation_code: string;
  name: string;
  amount: number;
};

export type VerifyResult = {
  customer_name?: string;
  customer_number?: string;
  customer_address?: string;
  current_bouquet?: string;
  due_date?: string;
  renewal_amount?: number;
  meter_type?: string;
  minimum_amount?: number;
  outstanding_balance?: number;
};

export type PurchaseResult = {
  message: string;
  status: 'delivered' | 'pending';
  request_id?: string;
  token?: string;
  units?: string;
};

export function parseUtilityApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;

  const payload = data as { errors?: unknown[]; message?: string; error?: string };
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;

  const errors = payload.errors;
  if (!Array.isArray(errors) || errors.length === 0) return fallback;

  const first = errors[0];
  if (typeof first === 'string' && first.trim()) return first;
  if (first && typeof first === 'object') {
    const message = (first as { message?: string }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchUtilityNetworks(): Promise<UtilityNetwork[]> {
  const response = await fetch(`${API_URL}/api/v1/utility/networks`, {
    headers: await authHeaders(),
  });
  if (!response.ok) return defaultNetworks();
  const data = await response.json();
  return data.networks?.length ? data.networks : defaultNetworks();
}

export async function fetchTvProviders(): Promise<UtilityProvider[]> {
  const response = await fetch(`${API_URL}/api/v1/utility/tv_providers`, {
    headers: await authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(parseUtilityApiError(data, `Could not load TV providers (${response.status})`));
  }
  const data = await response.json();
  return data.providers ?? [];
}

export async function fetchElectricityProviders(): Promise<UtilityProvider[]> {
  const response = await fetch(`${API_URL}/api/v1/utility/electricity_providers`, {
    headers: await authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(parseUtilityApiError(data, `Could not load electricity providers (${response.status})`));
  }
  const data = await response.json();
  return data.providers ?? [];
}

export function dedupeVariations(variations: DataVariation[]): DataVariation[] {
  const seen = new Set<string>();
  return variations.filter((plan) => {
    if (!plan.variation_code || seen.has(plan.variation_code)) return false;
    seen.add(plan.variation_code);
    return true;
  });
}

export async function fetchDataVariations(network: string): Promise<DataVariation[]> {
  const response = await fetch(
    `${API_URL}/api/v1/utility/variations?network=${encodeURIComponent(network)}&type=data`,
    { headers: await authHeaders() }
  );
  if (!response.ok) return [];
  const data = await response.json();
  return dedupeVariations(data.variations ?? []);
}

export async function fetchTvVariations(provider: string): Promise<DataVariation[]> {
  const response = await fetch(
    `${API_URL}/api/v1/utility/variations?provider=${encodeURIComponent(provider)}&type=tv`,
    { headers: await authHeaders() }
  );
  if (!response.ok) return [];
  const data = await response.json();
  return dedupeVariations(data.variations ?? []);
}

export async function verifyUtilityBill(payload: {
  category: 'tv' | 'electricity';
  provider: string;
  billers_code: string;
  meter_type?: 'prepaid' | 'postpaid';
}): Promise<{ verification: VerifyResult; billers_code: string; provider: string; meter_type?: string }> {
  const response = await fetch(`${API_URL}/api/v1/utility/verify`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(parseUtilityApiError(data, 'Verification failed. Please check your details.'));
  }
  return data as { verification: VerifyResult; billers_code: string; provider: string; meter_type?: string };
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function buyAirtime(payload: {
  network: string;
  phone_number: string;
  amount: number;
}): Promise<PurchaseResult> {
  const response = await fetch(`${API_URL}/api/v1/wallet/buy_airtime`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ ...payload, option: 'other' }),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(parseUtilityApiError(data, 'Airtime purchase failed. Your wallet has been refunded.'));
  }
  return data as PurchaseResult;
}

export async function buyData(payload: {
  network: string;
  phone_number: string;
  variation_code: string;
  amount: number;
}): Promise<PurchaseResult> {
  const response = await fetch(`${API_URL}/api/v1/wallet/buy_data`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(parseUtilityApiError(data, 'Data purchase failed. Your wallet has been refunded.'));
  }
  return data as PurchaseResult;
}

export async function buyTv(payload: {
  provider: string;
  billers_code: string;
  subscription_type: 'renew' | 'change';
  variation_code?: string;
  amount: number;
  customer_name?: string;
  phone_number?: string;
}): Promise<PurchaseResult> {
  const response = await fetch(`${API_URL}/api/v1/wallet/buy_tv`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(parseUtilityApiError(data, 'TV subscription failed. Your wallet has been refunded.'));
  }
  return data as PurchaseResult;
}

export async function buyElectricity(payload: {
  provider: string;
  billers_code: string;
  meter_type: 'prepaid' | 'postpaid';
  phone_number?: string;
  amount: number;
  customer_name?: string;
}): Promise<PurchaseResult> {
  const response = await fetch(`${API_URL}/api/v1/wallet/buy_electricity`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(parseUtilityApiError(data, 'Electricity payment failed. Your wallet has been refunded.'));
  }
  return data as PurchaseResult;
}

function defaultNetworks(): UtilityNetwork[] {
  return [
    { name: 'MTN', label: 'MTN', color: '#FFCC00' },
    { name: 'Glo', label: 'Glo', color: '#00FF00' },
    { name: 'Airtel', label: 'Airtel', color: '#FF0000' },
    { name: '9mobile', label: '9mobile', color: '#006633' },
  ];
}

