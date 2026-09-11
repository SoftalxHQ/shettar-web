import { authorizationHeaders, getStoredToken } from '@/app/helpers/auth';
import { getApiBaseUrl } from '@/app/helpers/api-base-url';
import type { WalletTransactionForReceipt } from '@/app/helpers/utility-receipt';

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
  transaction_id?: number | string;
  token?: string;
  units?: string;
};

export const PROCESSING_PURCHASE_MESSAGE =
  'Purchase may still be processing. Check Transactions.';

export type UtilityProductType = 'airtime' | 'data' | 'tv' | 'electricity';

export type WalletTransactionLookup = WalletTransactionForReceipt & {
  id: number;
};

export class UtilityPurchaseError extends Error {
  httpStatus: number | null;
  transactionId?: number | string;
  requestId?: string;
  confirmedFailure: boolean;

  constructor(
    message: string,
    options: {
      httpStatus?: number | null;
      transactionId?: number | string;
      requestId?: string;
      confirmedFailure?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'UtilityPurchaseError';
    this.httpStatus = options.httpStatus ?? null;
    this.transactionId = options.transactionId;
    this.requestId = options.requestId;
    this.confirmedFailure = options.confirmedFailure === true;
  }
}

export type TvBillersLimits = { min: number; max: number; kind: 'smartcard' | 'phone' };
export type MeterDigitLimits = { min: number; max: number };

export const TV_BILLERS_DIGIT_LIMITS: Record<string, TvBillersLimits> = {
  dstv: { min: 10, max: 10, kind: 'smartcard' },
  gotv: { min: 10, max: 10, kind: 'smartcard' },
  startimes: { min: 10, max: 11, kind: 'smartcard' },
  showmax: { min: 11, max: 13, kind: 'phone' },
};

const DEFAULT_TV_BILLERS_LIMITS: TvBillersLimits = { min: 10, max: 12, kind: 'smartcard' };

export const ELECTRICITY_METER_DIGIT_LIMITS: Record<string, MeterDigitLimits> = {
  'ikeja-electric': { min: 11, max: 13 },
  'eko-electric': { min: 11, max: 13 },
  'abuja-electric': { min: 11, max: 13 },
  'ibadan-electric': { min: 11, max: 13 },
  'kaduna-electric': { min: 11, max: 13 },
  'jos-electric': { min: 11, max: 13 },
  'kano-electric': { min: 11, max: 13 },
  'portharcourt-electric': { min: 11, max: 13 },
  'enugu-electric': { min: 11, max: 13 },
  'benin-electric': { min: 11, max: 13 },
  'aba-electric': { min: 11, max: 13 },
  'yola-electric': { min: 11, max: 13 },
};

const DEFAULT_METER_LIMITS: MeterDigitLimits = { min: 11, max: 13 };

export function digitsOnly(value: string, max?: number): string {
  const digits = value.replace(/\D/g, '');
  return max == null ? digits : digits.slice(0, max);
}

/** Allow typing/paste of 0… or 234…; cap at 13 so 234+10 fits. */
export function sanitizeUtilityPhoneInput(value: string): string {
  const digits = digitsOnly(value);
  if (digits.startsWith('234')) return digits.slice(0, 13);
  return digits.slice(0, 11);
}

export function normalizeUtilityPhone(value: string): string {
  const digits = digitsOnly(value);
  if (digits.startsWith('234') && digits.length >= 13) return `0${digits.slice(3, 13)}`;
  if (digits.startsWith('0')) return digits.slice(0, 11);
  return digits;
}

export function isValidUtilityPhone(value: string): boolean {
  return /^(0\d{10}|234\d{10})$/.test(digitsOnly(value));
}

export function tvBillersLimits(provider: string): TvBillersLimits {
  const key = provider.toLowerCase().trim();
  return TV_BILLERS_DIGIT_LIMITS[key] ?? DEFAULT_TV_BILLERS_LIMITS;
}

export function electricityMeterLimits(provider: string): MeterDigitLimits {
  const key = provider.toLowerCase().trim();
  return ELECTRICITY_METER_DIGIT_LIMITS[key] ?? DEFAULT_METER_LIMITS;
}

export function sanitizeTvBillersInput(value: string, provider: string): string {
  const limits = tvBillersLimits(provider);
  if (limits.kind === 'phone') return sanitizeUtilityPhoneInput(value);
  return digitsOnly(value, limits.max);
}

export function isValidTvBillers(value: string, provider: string): boolean {
  const limits = tvBillersLimits(provider);
  if (limits.kind === 'phone') return isValidUtilityPhone(value);
  const len = digitsOnly(value).length;
  return len >= limits.min && len <= limits.max;
}

export function sanitizeMeterInput(value: string, provider: string): string {
  const { max } = electricityMeterLimits(provider);
  return digitsOnly(value, max);
}

export function isValidMeterNumber(value: string, provider: string): boolean {
  const { min, max } = electricityMeterLimits(provider);
  const len = digitsOnly(value).length;
  return len >= min && len <= max;
}

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

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...authorizationHeaders(getStoredToken()),
  };
}

export async function fetchUtilityNetworks(): Promise<UtilityNetwork[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/utility/networks`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!response.ok) return defaultNetworks();
  const data = await response.json();
  return data.networks?.length ? data.networks : defaultNetworks();
}

export async function fetchTvProviders(): Promise<UtilityProvider[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/utility/tv_providers`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(parseUtilityApiError(data, `Could not load TV providers (${response.status})`));
  }
  const data = await response.json();
  return data.providers ?? [];
}

export async function fetchElectricityProviders(): Promise<UtilityProvider[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/utility/electricity_providers`, {
    credentials: 'include',
    headers: authHeaders(),
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
    `${getApiBaseUrl()}/api/v1/utility/variations?network=${encodeURIComponent(network)}&type=data`,
    { credentials: 'include', headers: authHeaders() }
  );
  if (!response.ok) return [];
  const data = await response.json();
  return dedupeVariations(data.variations ?? []);
}

export async function fetchTvVariations(provider: string): Promise<DataVariation[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/utility/variations?provider=${encodeURIComponent(provider)}&type=tv`,
    { credentials: 'include', headers: authHeaders() }
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
  const response = await fetch(`${getApiBaseUrl()}/api/v1/utility/verify`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
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

function purchaseIdsFromPayload(data: unknown): {
  transactionId?: number | string;
  requestId?: string;
} {
  if (!data || typeof data !== 'object') return {};
  const payload = data as { transaction_id?: number | string; request_id?: string };
  return {
    transactionId: payload.transaction_id,
    requestId: typeof payload.request_id === 'string' && payload.request_id.trim() ? payload.request_id : undefined,
  };
}

async function postPurchase(url: string, body: unknown, unprocessableFallback: string): Promise<PurchaseResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    throw new UtilityPurchaseError(PROCESSING_PURCHASE_MESSAGE, { confirmedFailure: false });
  }

  const data = await parseJsonResponse(response);
  if (response.ok) return data as PurchaseResult;

  const ids = purchaseIdsFromPayload(data);
  if (response.status === 422) {
    throw new UtilityPurchaseError(parseUtilityApiError(data, unprocessableFallback), {
      httpStatus: 422,
      confirmedFailure: true,
      ...ids,
    });
  }

  throw new UtilityPurchaseError(PROCESSING_PURCHASE_MESSAGE, {
    httpStatus: response.status,
    confirmedFailure: false,
    ...ids,
  });
}

function isRecentUtilityDebit(
  transaction: WalletTransactionLookup,
  productType?: UtilityProductType
): boolean {
  const createdAt = Date.parse(transaction.created_at);
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > 5 * 60 * 1000) return false;
  const type = transaction.metadata?.product_type;
  if (productType) return type === productType;
  return type === 'airtime' || type === 'data' || type === 'tv' || type === 'electricity';
}

export function isInFlightPurchaseStatus(status?: string): boolean {
  const normalized = (status || '').toLowerCase();
  return normalized === 'pending' || normalized === 'completed';
}

export async function lookupUtilityPurchase(options: {
  requestId?: string;
  transactionId?: number | string;
  productType?: UtilityProductType;
}): Promise<WalletTransactionLookup | null> {
  const headers = authHeaders();

  if (options.transactionId != null && String(options.transactionId).trim()) {
    const response = await fetch(
      `${getApiBaseUrl()}/api/v1/wallet_transactions/${encodeURIComponent(String(options.transactionId))}`,
      { credentials: 'include', headers }
    );
    if (response.ok) {
      const data = (await parseJsonResponse(response)) as { transaction?: WalletTransactionLookup } | null;
      if (data?.transaction) return data.transaction;
    }
  }

  if (options.requestId?.trim()) {
    const response = await fetch(
      `${getApiBaseUrl()}/api/v1/wallet_transactions?request_id=${encodeURIComponent(options.requestId.trim())}&limit=5`,
      { credentials: 'include', headers }
    );
    if (response.ok) {
      const data = (await parseJsonResponse(response)) as { transactions?: WalletTransactionLookup[] } | null;
      const match = data?.transactions?.[0];
      if (match) return match;
    }
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1/wallet_transactions?flow=debit&limit=10`, { credentials: 'include', headers });
  if (!response.ok) return null;
  const data = (await parseJsonResponse(response)) as { transactions?: WalletTransactionLookup[] } | null;
  return data?.transactions?.find((transaction) => isRecentUtilityDebit(transaction, options.productType)) ?? null;
}

export async function recoverUtilityPurchase(options: {
  requestId?: string;
  transactionId?: number | string;
  productType?: UtilityProductType;
}): Promise<WalletTransactionLookup | null> {
  try {
    const found = await lookupUtilityPurchase(options);
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return await lookupUtilityPurchase(options);
  } catch {
    return null;
  }
}

export async function buyAirtime(payload: {
  network: string;
  phone_number: string;
  amount: number;
  transaction_pin?: string;
}): Promise<PurchaseResult> {
  return postPurchase(
    `${getApiBaseUrl()}/api/v1/wallet/buy_airtime`,
    { ...payload, option: 'other' },
    'Airtime purchase failed.'
  );
}

export async function buyData(payload: {
  network: string;
  phone_number: string;
  variation_code: string;
  amount: number;
  transaction_pin?: string;
}): Promise<PurchaseResult> {
  return postPurchase(`${getApiBaseUrl()}/api/v1/wallet/buy_data`, payload, 'Data purchase failed.');
}

export async function buyTv(payload: {
  provider: string;
  billers_code: string;
  subscription_type: 'renew' | 'change';
  variation_code?: string;
  amount: number;
  customer_name?: string;
  phone_number?: string;
  transaction_pin?: string;
}): Promise<PurchaseResult> {
  return postPurchase(`${getApiBaseUrl()}/api/v1/wallet/buy_tv`, payload, 'TV subscription failed.');
}

export async function buyElectricity(payload: {
  provider: string;
  billers_code: string;
  meter_type: 'prepaid' | 'postpaid';
  phone_number?: string;
  amount: number;
  customer_name?: string;
  transaction_pin?: string;
}): Promise<PurchaseResult> {
  return postPurchase(`${getApiBaseUrl()}/api/v1/wallet/buy_electricity`, payload, 'Electricity payment failed.');
}

function defaultNetworks(): UtilityNetwork[] {
  return [
    { name: 'MTN', label: 'MTN', color: '#FFCC00' },
    { name: 'Glo', label: 'Glo', color: '#00FF00' },
    { name: 'Airtel', label: 'Airtel', color: '#FF0000' },
    { name: '9mobile', label: '9mobile', color: '#006633' },
  ];
}

