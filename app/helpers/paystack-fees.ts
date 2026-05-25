/** Paystack card fee — gross charge so the business receives the target subtotal after fees. */

export type PaystackCardFeeBreakdown = {
  target_amount: number;
  charge_amount: number;
  paystack_fee: number;
};

export function calculatePaystackCardFee(targetAmount: number): PaystackCardFeeBreakdown {
  const target = Math.max(0, Number(targetAmount) || 0);
  let gross: number;
  if (target < 2500) {
    gross = target / (1 - 0.015);
  } else {
    gross = (target + 100) / (1 - 0.015);
    if (gross - target > 2000) gross = target + 2000;
  }
  gross = Math.round(gross * 100) / 100;
  const fee = Math.round((gross - target) * 100) / 100;
  return { target_amount: target, charge_amount: gross, paystack_fee: fee };
}
