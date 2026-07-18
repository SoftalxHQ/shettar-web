import { getStoredToken } from '@/app/helpers/auth';
import { calculatePaystackCardFee } from '@/app/helpers/paystack-fees';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

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
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api/v1/payment_initializations`, {
    method: 'POST',
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
