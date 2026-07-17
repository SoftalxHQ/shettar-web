'use client';

import { forwardRef, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { BsBag, BsDownload, BsHouse, BsLightningChargeFill, BsPhone, BsPrinter, BsTv, BsWallet2, BsWifi } from 'react-icons/bs';
import { useReactToPrint } from 'react-to-print';
import { downloadReceiptPdf } from '@/app/helpers/receipt-export';
import { resolveReceiptReference } from '@/app/helpers/utility-receipt';
import { currency } from '@/app/states';

export type UtilityReceipt = {
  type: string;
  amount: string;
  recipient: string;
  network: string;
  plan?: string;
  status: 'delivered' | 'pending' | 'failed' | 'refunded';
  requestId?: string;
  purchasedAt: string;
  billersCode?: string;
  customerName?: string;
  customerAddress?: string;
  token?: string;
  units?: string;
  meterType?: string;
  receiptKind?: 'utility' | 'topup' | 'booking' | 'order' | 'refund';
  failureReason?: string;
  paymentMethod?: string;
  grossAmount?: string;
  fee?: string;
  businessName?: string;
  bookingId?: string;
  orderNumber?: string;
  roomNumber?: string;
  promoCode?: string;
  promoDiscount?: string;
  subtotalBeforeDiscount?: string;
};

type UtilityReceiptCardProps = {
  receipt: UtilityReceipt;
  hideInlineActions?: boolean;
};

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <span className={`summary-value${accent ? ' summary-value-accent' : ''}`}>{value}</span>
    </div>
  );
}

const UtilityReceiptCard = forwardRef<HTMLDivElement, UtilityReceiptCardProps>(
  function UtilityReceiptCard({ receipt, hideInlineActions = false }, ref) {
    const internalRef = useRef<HTMLDivElement>(null);
    const setRefs = (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };
    const handlePrint = useReactToPrint({ contentRef: internalRef });

    const isPending = receipt.status === 'pending';
    const isFailed = receipt.status === 'failed';
    const isRefunded = receipt.status === 'refunded';
    const isBooking = receipt.receiptKind === 'booking';
    const isOrder = receipt.receiptKind === 'order';
    const isRefund = receipt.receiptKind === 'refund' || isRefunded;
    const isTopup = receipt.receiptKind === 'topup' || receipt.type.toLowerCase().includes('top-up') || receipt.type.toLowerCase().includes('top up');
    const typeLower = receipt.type.toLowerCase();
    const isData = !isTopup && !isBooking && !isOrder && typeLower.includes('data');
    const isTv = !isTopup && !isBooking && !isOrder && typeLower.includes('tv');
    const isElectricity = !isTopup && !isBooking && !isOrder && typeLower.includes('electric');

    const ServiceIcon = isBooking ? BsHouse : isOrder ? BsBag : isTopup ? BsWallet2 : isElectricity ? BsLightningChargeFill : isTv ? BsTv : isData ? BsWifi : BsPhone;
    const recipientLabel = isBooking ? 'HOTEL' : isOrder ? 'ROOM' : isTopup ? 'WALLET' : isElectricity ? 'METER' : isTv ? 'SMARTCARD' : 'PHONE';
    const serviceTag = isBooking ? 'Hotel Stay' : isOrder ? 'Room Service' : isTopup ? 'Wallet Funding' : isElectricity ? 'Electricity Token' : isTv ? 'TV Subscription' : isData ? 'Data Bundle' : 'Airtime VTU';
    const brandLabel = isBooking || isOrder ? 'Shettar Travel & Dining' : isTopup ? 'Shettar Wallet Services' : 'Shettar Utility Services';
    const statusLabel = isPending
      ? 'Processing'
      : isFailed
        ? 'Failed'
        : isRefunded
          ? 'Refunded'
          : isTopup || isBooking || isOrder
            ? 'Completed'
            : 'Delivered';
    const statusClass = isFailed ? 'text-danger' : isRefunded ? 'text-success' : isPending ? 'text-warning' : 'summary-value-accent';
    const totalLabel = isRefund ? 'Amount Refunded' : isTopup ? 'Amount Credited' : 'Total Paid';
    const referenceLabel = isBooking ? 'RESERVATION NUMBER' : isOrder ? 'ORDER NUMBER' : 'TRANSACTION REFERENCE';
    const summaryTitle = isTopup || isBooking || isOrder ? 'PAYMENT SUMMARY' : 'PURCHASE SUMMARY';
    const detailsTitle = isTopup || isBooking || isOrder ? 'TRANSACTION DETAILS' : 'WHAT YOU PURCHASED';

    const formattedAmount = receipt.amount.startsWith(currency) || receipt.amount.startsWith('₦')
      ? receipt.amount
      : `${currency}${Number(receipt.amount).toLocaleString('en-NG')}`;

    const formatMoney = (value?: string) =>
      value ? `${currency}${Number(value).toLocaleString('en-NG')}` : null;

    const formattedGross = formatMoney(receipt.grossAmount);
    const formattedFee = formatMoney(receipt.fee);
    const formattedSubtotal = formatMoney(receipt.subtotalBeforeDiscount);
    const formattedPromoDiscount = formatMoney(receipt.promoDiscount);

    const displayReference = receipt.requestId || receipt.bookingId || receipt.orderNumber || `${isBooking ? 'BKN' : isOrder ? 'ORD' : isTopup ? 'TOP' : 'UTL'}-${receipt.purchasedAt.replace(/\D/g, '').slice(-8)}`;
    const purchaseDate = new Date(receipt.purchasedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const purchaseTime = new Date(receipt.purchasedAt).toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const tags = [
      isTopup ? 'Shettar Wallet' : isBooking || isOrder ? receipt.businessName || receipt.network || 'Shettar' : receipt.network || 'Provider',
      serviceTag,
      isTopup ? receipt.network : receipt.plan,
    ].filter(Boolean) as string[];

    const meterOrSmartcard = receipt.billersCode || receipt.recipient;
    const recipientDisplay = isElectricity || isTv
      ? meterOrSmartcard || '—'
      : receipt.customerName || receipt.recipient || '—';

    return (
      <div className="receipt-wrap">
        <div className="utility-receipt print-card" ref={setRefs}>
          <div className="receipt-card">
            <div className="ticket-header">
              <div className="ticket-header-main">
                <span className="ticket-label">{referenceLabel}</span>
                <span className="ticket-id">{displayReference}</span>
              </div>
              <div className="header-icon" aria-hidden="true">
                <ServiceIcon size={22} />
              </div>
            </div>

            <div className="perforated" aria-hidden="true">
              {Array.from({ length: 22 }).map((_, i) => (
                <span key={i} className="perforated-dot" />
              ))}
            </div>

            <div className="receipt-body">
              <div className="service-row">
                <div className="service-icon">
                  <ServiceIcon size={24} />
                </div>
                <div className="service-copy">
                  <div className="service-title">{receipt.type}</div>
                  <div className="service-sub">
                    {receipt.network ? `${receipt.network} · ` : ''}{brandLabel}
                  </div>
                </div>
              </div>

              <div className="details-strip">
                <div className="detail-col">
                  <span className="detail-label">{isTopup ? 'DESTINATION' : isBooking ? 'HOTEL' : isOrder ? 'LOCATION' : 'RECIPIENT'}</span>
                  <span className="detail-value">{recipientDisplay}</span>
                  <span className="detail-hint">{recipientLabel}</span>
                </div>
                <div className="detail-col">
                  <span className="detail-label">{isTopup ? 'PAYMENT' : isBooking || isOrder ? 'PROPERTY' : 'NETWORK'}</span>
                  <span className="detail-value">{receipt.network || '—'}</span>
                  <span className="detail-hint">{isTopup ? 'METHOD' : 'PROVIDER'}</span>
                </div>
                <div className="detail-col detail-col-end">
                  <span className="detail-label">DATE</span>
                  <span className="detail-value">{purchaseDate}</span>
                  <span className="detail-hint">{purchaseTime}</span>
                </div>
              </div>

              <div className="section-title">{summaryTitle}</div>
              <div className="summary-box">
                <SummaryRow label={isTopup || isBooking || isOrder ? 'Transaction Type' : 'Service Type'} value={receipt.type} />
                {receipt.bookingId ? <SummaryRow label="Booking Reference" value={receipt.bookingId} /> : null}
                {receipt.orderNumber ? <SummaryRow label="Order Number" value={receipt.orderNumber} /> : null}
                {receipt.roomNumber ? <SummaryRow label="Room" value={receipt.roomNumber} /> : null}
                {formattedSubtotal ? <SummaryRow label="Subtotal" value={formattedSubtotal} /> : null}
                {receipt.promoCode && formattedPromoDiscount ? (
                  <SummaryRow label={`Promo (${receipt.promoCode})`} value={`−${formattedPromoDiscount}`} accent />
                ) : null}
                {formattedGross ? <SummaryRow label="Amount Paid" value={formattedGross} /> : null}
                {formattedFee ? <SummaryRow label="Processing Fee" value={formattedFee} /> : null}
                {receipt.plan ? <SummaryRow label={isTv ? 'Bouquet' : 'Plan'} value={receipt.plan} /> : null}
                {isElectricity && meterOrSmartcard ? (
                  <SummaryRow label="Meter Number" value={meterOrSmartcard} />
                ) : null}
                {isTv && meterOrSmartcard ? (
                  <SummaryRow label="Smartcard Number" value={meterOrSmartcard} />
                ) : null}
                {receipt.customerName ? <SummaryRow label="Customer Name" value={receipt.customerName} /> : null}
                {receipt.customerAddress ? <SummaryRow label="Address" value={receipt.customerAddress} /> : null}
                {receipt.meterType ? <SummaryRow label="Meter Type" value={receipt.meterType} /> : null}
                {receipt.token ? <SummaryRow label="Token" value={receipt.token} accent /> : null}
                {receipt.units ? <SummaryRow label="Units" value={receipt.units} /> : null}
                {receipt.failureReason ? <SummaryRow label="Reason" value={receipt.failureReason} /> : null}
                <div className="summary-row">
                  <span className="summary-label">Status</span>
                  <span className={`summary-value fw-bold ${statusClass}`}>{statusLabel}</span>
                </div>
                <SummaryRow
                  label="Payment Method"
                  value={isTopup || isBooking || isOrder ? receipt.paymentMethod || 'Shettar Wallet' : 'Shettar Wallet'}
                />
                <div className="total-row">
                  <span className="total-label">{totalLabel}</span>
                  <span className="total-amount">{formattedAmount}</span>
                </div>
              </div>

              <div className="section-title section-title-spaced">{detailsTitle}</div>
              <div className="tag-row">
                {tags.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!hideInlineActions ? (
          <div className="receipt-actions no-print">
            <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={() => handlePrint()}>
              <BsPrinter className="me-2" />
              Print
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="rounded-pill px-3"
              onClick={() => {
                const el = internalRef.current;
                if (el) void downloadReceiptPdf(el, resolveReceiptReference(receipt));
              }}
            >
              <BsDownload className="me-2" />
              Download PDF
            </Button>
          </div>
        ) : null}

        <style jsx>{`
          .receipt-wrap {
            width: 100%;
          }

          .utility-receipt {
            width: 100%;
          }

          .receipt-card {
            --receipt-page-bg: #f0f2f8;
            --receipt-section-bg: #f4f6fb;
            border-radius: 22px;
            overflow: hidden;
            background: #fff;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
          }

          :global([data-bs-theme='dark']) .receipt-card {
            --receipt-page-bg: #0f0f1a;
            --receipt-section-bg: rgba(255, 255, 255, 0.05);
            background: #1a1a2e;
          }

          .ticket-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 18px 20px;
            background: var(--bs-primary);
            color: #fff;
          }

          .ticket-header-main {
            flex: 1;
            min-width: 0;
          }

          .ticket-label {
            display: block;
            color: rgba(255, 255, 255, 0.65);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .ticket-id {
            display: block;
            color: #fff;
            font-size: 18px;
            font-weight: 900;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            letter-spacing: 0.5px;
            word-break: break-all;
          }

          .header-icon {
            width: 40px;
            height: 40px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: rgba(255, 255, 255, 0.95);
          }

          .perforated {
            display: flex;
            gap: 6px;
            padding: 0 12px;
            margin-top: -10px;
            margin-bottom: -10px;
            position: relative;
            z-index: 2;
          }

          .perforated-dot {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--receipt-page-bg, var(--bs-body-bg));
            flex-shrink: 0;
          }

          .receipt-body {
            padding: 20px;
          }

          .service-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px;
            margin-bottom: 16px;
            border-radius: 14px;
            background: var(--receipt-section-bg);
          }

          .service-icon {
            width: 46px;
            height: 46px;
            border-radius: 13px;
            background: rgba(81, 67, 217, 0.12);
            color: var(--bs-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .service-copy {
            flex: 1;
            min-width: 0;
          }

          .service-title {
            font-size: 16px;
            font-weight: 800;
            color: var(--bs-body-color);
            margin-bottom: 3px;
          }

          .service-sub {
            font-size: 12px;
            font-weight: 500;
            color: var(--bs-secondary-color);
          }

          .details-strip {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 8px;
            padding: 16px;
            border-radius: 14px;
            margin-bottom: 20px;
            border-left: 4px solid var(--bs-primary);
            background: var(--receipt-section-bg);
          }

          .detail-col {
            flex: 1;
            min-width: 0;
          }

          .detail-col-end {
            text-align: right;
          }

          .detail-label {
            display: block;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: var(--bs-primary);
            margin-bottom: 4px;
          }

          .detail-value {
            display: block;
            font-size: 13px;
            font-weight: 700;
            color: var(--bs-body-color);
            margin-bottom: 2px;
            word-break: break-word;
          }

          .detail-hint {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--bs-primary);
          }

          .section-title {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: var(--bs-secondary-color);
            margin-bottom: 10px;
          }

          .section-title-spaced {
            margin-top: 18px;
          }

          .summary-box {
            border-radius: 14px;
            padding: 14px;
            background: var(--receipt-section-bg);
          }

          .summary-box :global(.summary-row) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          }

          .summary-box :global(.summary-label) {
            flex: 1;
            font-size: 13px;
            font-weight: 500;
            color: var(--bs-secondary-color);
          }

          .summary-box :global(.summary-value) {
            flex: 1;
            font-size: 14px;
            font-weight: 600;
            text-align: right;
            color: var(--bs-body-color);
            word-break: break-word;
          }

          .summary-box :global(.summary-value-accent) {
            color: var(--bs-primary);
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(0, 0, 0, 0.07);
            padding-top: 12px;
            margin-top: 6px;
          }

          :global([data-bs-theme='dark']) .total-row {
            border-top-color: rgba(255, 255, 255, 0.08);
          }

          .total-label {
            font-size: 15px;
            font-weight: 700;
            color: var(--bs-body-color);
          }

          .total-amount {
            font-size: 22px;
            font-weight: 900;
            color: var(--bs-primary);
          }

          .tag-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .tag {
            display: inline-flex;
            max-width: 100%;
            padding: 6px 12px;
            border-radius: 20px;
            border: 1px solid rgba(0, 0, 0, 0.07);
            background: var(--receipt-section-bg);
            font-size: 12px;
            font-weight: 600;
            color: var(--bs-body-color);
          }

          :global([data-bs-theme='dark']) .tag {
            border-color: rgba(255, 255, 255, 0.08);
          }

          .receipt-actions {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 16px;
          }

          @media (max-width: 575.98px) {
            .details-strip {
              flex-direction: column;
              gap: 14px;
            }

            .detail-col-end {
              text-align: left;
            }
          }

          @media print {
            @page {
              margin: 0.5cm;
              size: auto;
            }

            body * {
              visibility: hidden !important;
            }

            .print-card,
            .print-card * {
              visibility: visible !important;
            }

            .print-card {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .no-print,
            .no-print * {
              display: none !important;
              visibility: hidden !important;
            }

            .receipt-card {
              box-shadow: none !important;
              border: 1px solid #eee;
            }

            .ticket-header {
              background: #5143d9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    );
  }
);

export default UtilityReceiptCard;
