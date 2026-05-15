"use client";

import { useState } from "react";
import { Card, CardHeader } from "react-bootstrap";
import { toast } from "react-hot-toast";
import {
  validatePromoCode,
  type AppliedPromo,
} from "@/app/helpers/promo";

const currency = "₦";

interface OfferAndDiscountsProps {
  businessId: number | string;
  subtotal: number;
  appliedPromo: AppliedPromo | null;
  onApply: (promo: AppliedPromo) => void;
  onRemove: () => void;
}

const OfferAndDiscounts = ({
  businessId,
  subtotal,
  appliedPromo,
  onApply,
  onRemove,
}: OfferAndDiscountsProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    if (!businessId) {
      toast.error("Business information is missing. Refresh the page and try again.");
      return;
    }

    if (subtotal <= 0) {
      toast.error("Booking total must be greater than zero to apply a promo.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await validatePromoCode({
        code: trimmed,
        business_id: businessId,
        subtotal,
      });

      if (result.valid) {
        onApply(result);
        setCode("");
        toast.success(`Coupon "${result.code}" applied!`);
      } else {
        toast.error(result.error || "Invalid promo code");
      }
    } catch {
      toast.error("Failed to apply promo code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow">
      <CardHeader className="border-bottom bg-transparent">
        <div className="card-title">
          <h5 className="mb-0">Offer &amp; Discount</h5>
        </div>
      </CardHeader>
      <CardHeader className="bg-transparent border-0">
        {appliedPromo ? (
          <div className="bg-light rounded-2 p-3 text-dark mb-3 border border-success border-dashed position-relative">
            <button
              type="button"
              onClick={onRemove}
              className="btn btn-link text-danger p-0 position-absolute end-0 top-0 mt-2 me-3"
              style={{ textDecoration: "none" }}
              title="Remove"
              aria-label="Remove coupon"
            >
              <i className="bi bi-x-circle-fill" />
            </button>
            <div className="form-check form-check-inline mb-0">
              <input
                className="form-check-input"
                type="radio"
                name="discountOptions"
                id="appliedDiscount"
                defaultChecked
                readOnly
              />
              <label className="form-check-label h5 mb-0" htmlFor="appliedDiscount">
                {appliedPromo.code}
              </label>
              <p className="mb-1 small">
                Congratulations! You have saved {currency}
                {appliedPromo.discount_amount.toLocaleString()} with {appliedPromo.code}.
              </p>
              <h6 className="mb-0 text-success">
                -{currency}
                {appliedPromo.discount_amount.toLocaleString()}
              </h6>
            </div>
          </div>
        ) : (
          <div className="bg-light rounded-2 p-3 text-dark mb-3 opacity-50">
            <p className="mb-0 small fst-italic">
              Apply a coupon code to get exclusive discounts on your booking.
            </p>
          </div>
        )}

        <form onSubmit={handleApply}>
          <div className="input-group mt-3">
            <input
              className="form-control"
              placeholder="Coupon code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading || !!appliedPromo}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !code.trim() || !!appliedPromo}
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Apply"
              )}
            </button>
          </div>
          {appliedPromo ? (
            <p className="text-muted small mt-2 mb-0">One coupon per booking</p>
          ) : null}
        </form>
      </CardHeader>
    </Card>
  );
};

export default OfferAndDiscounts;
