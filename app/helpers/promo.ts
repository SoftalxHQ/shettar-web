import { getStoredToken } from "@/app/helpers/auth";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

export type AppliedPromo = {
  valid: true;
  code: string;
  discount_amount: number;
  funded_by: string;
  customer_pays: number;
  discount_type: string;
  discount_value: number;
};

export type PromoValidationResult =
  | AppliedPromo
  | { valid: false; error?: string };

/**
 * POST /api/v1/promo_codes/validate — public; optional Bearer for per-customer limits.
 */
export async function validatePromoCode(params: {
  code: string;
  business_id: number | string;
  subtotal: number;
}): Promise<PromoValidationResult> {
  const token = getStoredToken();
  const res = await fetch(`${API_URL}/api/v1/promo_codes/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      code: params.code.trim().toUpperCase(),
      business_id: params.business_id,
      subtotal: params.subtotal,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      valid: false,
      error:
        (data as { error?: string }).error ||
        (data as { message?: string }).message ||
        "Failed to apply promo code",
    };
  }

  if (!(data as { valid?: boolean }).valid) {
    return {
      valid: false,
      error: (data as { error?: string }).error || "Invalid promo code",
    };
  }

  return data as AppliedPromo;
}
