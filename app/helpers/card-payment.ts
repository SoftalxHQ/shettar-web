import { authorizationHeaders, getStoredToken } from '@/app/helpers/auth';
import { calculatePaystackCardFee } from '@/app/helpers/paystack-fees';
import { getApiBaseUrl } from '@/app/helpers/api-base-url';

export type CardPaymentInitResult = {
  reference: string;
  grossAmount: number;
  paystackFee: number;
  accessCode?: string;
};

export async function initializeCardPayment(params: {
  email: string;
  targetAmount: number;
  reference: string;
  metadata?: Record<string, unknown>;
}): Promise<CardPaymentInitResult> {
  const breakdown = calculatePaystackCardFee(params.targetAmount);
  const token = getStoredToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authorizationHeaders(token) };

  const response = await fetch(`${getApiBaseUrl()}/api/v1/payment_initializations`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({
      initialization: {
        email: params.email,
        amount: breakdown.charge_amount,
        reference: params.reference,
        metadata: params.metadata || {},
      },
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success || !data.reference) {
    throw new Error(data.message || 'Failed to initialize payment');
  }

  return {
    reference: data.reference,
    grossAmount: breakdown.charge_amount,
    paystackFee: breakdown.paystack_fee,
    accessCode: data.access_code,
  };
}
