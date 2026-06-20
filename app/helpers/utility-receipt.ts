import type { UtilityReceipt } from '@/app/components/Profile/Utility/UtilityReceiptCard';

export type UtilityProductType = 'airtime' | 'data' | 'tv' | 'electricity';

export type WalletTransactionMetadata = {
  product_type?: string;
  provider?: string;
  network?: string;
  phone_number?: string;
  vtpass_request_id?: string;
  provider_status?: string;
  plan?: string;
  billers_code?: string;
  customer_name?: string;
  meter_type?: string;
  electricity_token?: string;
  units?: string;
  paystack_reference?: string;
  gross_amount?: number | string;
  paystack_fee?: number | string;
  gateway_response?: string;
  channel?: string;
  method?: string;
  source?: string;
  business_name?: string;
  booking_id?: string;
  order_number?: string;
  restaurant_order_id?: number;
  room_number?: string;
  refund?: boolean;
  promo_code?: string;
  promo_discount_amount?: number;
  subtotal_before_discount?: number;
  amount_charged?: number;
};

export type WalletTransactionForReceipt = {
  amount: string | number;
  status: string;
  created_at: string;
  transaction_type?: string;
  description?: string;
  payment_method?: string;
  metadata?: WalletTransactionMetadata | null;
};

const UTILITY_PRODUCT_TYPES = new Set<UtilityProductType>(['airtime', 'data', 'tv', 'electricity']);

const TYPE_LABELS: Record<UtilityProductType, string> = {
  airtime: 'Airtime',
  data: 'Data Bundle',
  tv: 'TV Subscription',
  electricity: 'Electricity',
};

function formatPaymentMethodLabel(value?: string): string {
  switch (value?.toLowerCase()) {
    case 'card':
      return 'Debit/Credit Card';
    case 'transfer':
      return 'Bank Transfer';
    case 'wallet':
      return 'Shettar Wallet';
    default:
      return value ? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Paystack';
  }
}

function formatMoney(value?: number | string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const amount = Number(value);
  if (Number.isNaN(amount)) return undefined;
  return String(amount);
}

function transactionAmount(txn: WalletTransactionForReceipt): string {
  return formatMoney(txn.metadata?.amount_charged) || String(txn.amount);
}

export function isUtilityTransaction(txn: WalletTransactionForReceipt): boolean {
  const productType = txn.metadata?.product_type;
  return Boolean(productType && UTILITY_PRODUCT_TYPES.has(productType as UtilityProductType));
}

export function isTopupTransaction(txn: WalletTransactionForReceipt): boolean {
  if (txn.transaction_type?.toLowerCase() !== 'income') return false;

  const meta = txn.metadata;
  const desc = (txn.description || '').toLowerCase();

  if (meta?.product_type || meta?.booking_id || meta?.source === 'restaurant_order') return false;
  if (desc.includes('refund')) return false;

  if (meta?.paystack_reference) return true;

  return (
    desc.includes('wallet top-up') ||
    desc.includes('wallet funding') ||
    desc.includes('top-up') ||
    desc.includes('top up')
  );
}

export function isOrderTransaction(txn: WalletTransactionForReceipt): boolean {
  if (txn.metadata?.refund || txn.transaction_type?.toLowerCase() === 'refund') return false;

  const meta = txn.metadata;
  const desc = (txn.description || '').toLowerCase();

  return meta?.source === 'restaurant_order' || desc.includes('room service');
}

export function isBookingTransaction(txn: WalletTransactionForReceipt): boolean {
  if (isOrderTransaction(txn)) return false;
  if (txn.metadata?.refund || txn.transaction_type?.toLowerCase() === 'refund') return false;

  const meta = txn.metadata;
  const desc = (txn.description || '').toLowerCase();

  return Boolean(meta?.booking_id) || desc.includes('room booking');
}

export function isReceiptTransaction(txn: WalletTransactionForReceipt): boolean {
  return (
    isUtilityTransaction(txn) ||
    isTopupTransaction(txn) ||
    isBookingTransaction(txn) ||
    isOrderTransaction(txn)
  );
}

function mapUtilityTransactionToReceipt(txn: WalletTransactionForReceipt): UtilityReceipt | null {
  const meta = txn.metadata;
  const productType = meta?.product_type as UtilityProductType | undefined;
  if (!productType || !UTILITY_PRODUCT_TYPES.has(productType)) return null;

  const isPending =
    meta?.provider_status === 'pending' || txn.status.toLowerCase() === 'pending';

  const recipient =
    productType === 'tv' || productType === 'electricity'
      ? meta?.billers_code || meta?.phone_number || ''
      : meta?.phone_number || '';

  return {
    receiptKind: 'utility',
    type: TYPE_LABELS[productType],
    amount: String(txn.amount),
    recipient,
    network: meta?.provider || meta?.network || '',
    plan: meta?.plan,
    status: isPending ? 'pending' : 'delivered',
    requestId: meta?.vtpass_request_id,
    purchasedAt: txn.created_at,
    billersCode: meta?.billers_code,
    customerName: meta?.customer_name,
    token: meta?.electricity_token,
    units: meta?.units,
    meterType: meta?.meter_type,
  };
}

function mapTopupTransactionToReceipt(txn: WalletTransactionForReceipt): UtilityReceipt | null {
  if (!isTopupTransaction(txn)) return null;

  const meta = txn.metadata;
  const paymentMethod = formatPaymentMethodLabel(txn.payment_method || meta?.channel || meta?.method);
  const isPending = txn.status.toLowerCase() === 'pending';

  return {
    receiptKind: 'topup',
    type: 'Wallet Top-up',
    amount: String(txn.amount),
    recipient: 'Shettar Wallet',
    network: paymentMethod,
    status: isPending ? 'pending' : 'delivered',
    requestId: meta?.paystack_reference,
    purchasedAt: txn.created_at,
    paymentMethod,
    grossAmount: formatMoney(meta?.gross_amount),
    fee: formatMoney(meta?.paystack_fee),
  };
}

function mapBookingTransactionToReceipt(txn: WalletTransactionForReceipt): UtilityReceipt | null {
  if (!isBookingTransaction(txn)) return null;

  const meta = txn.metadata;
  const isPending = txn.status.toLowerCase() === 'pending';
  const paymentMethod = formatPaymentMethodLabel(txn.payment_method);

  return {
    receiptKind: 'booking',
    type: 'Hotel Booking',
    amount: transactionAmount(txn),
    recipient: meta?.business_name || 'Hotel',
    network: meta?.business_name || '',
    businessName: meta?.business_name,
    bookingId: meta?.booking_id,
    status: isPending ? 'pending' : 'delivered',
    requestId: meta?.booking_id,
    purchasedAt: txn.created_at,
    paymentMethod,
    promoCode: meta?.promo_code,
    promoDiscount: formatMoney(meta?.promo_discount_amount),
    subtotalBeforeDiscount: formatMoney(meta?.subtotal_before_discount),
  };
}

function mapOrderTransactionToReceipt(txn: WalletTransactionForReceipt): UtilityReceipt | null {
  if (!isOrderTransaction(txn)) return null;

  const meta = txn.metadata;
  const isPending = txn.status.toLowerCase() === 'pending';
  const paymentMethod = formatPaymentMethodLabel(txn.payment_method || meta?.channel);

  return {
    receiptKind: 'order',
    type: 'Room Service Order',
    amount: transactionAmount(txn),
    recipient: meta?.room_number ? `Room ${meta.room_number}` : meta?.business_name || 'Room Service',
    network: meta?.business_name || '',
    businessName: meta?.business_name,
    bookingId: meta?.booking_id,
    orderNumber: meta?.order_number,
    roomNumber: meta?.room_number,
    status: isPending ? 'pending' : 'delivered',
    requestId: meta?.order_number || meta?.paystack_reference,
    purchasedAt: txn.created_at,
    paymentMethod,
  };
}

export function mapTransactionToReceipt(txn: WalletTransactionForReceipt): UtilityReceipt | null {
  return (
    mapUtilityTransactionToReceipt(txn) ||
    mapTopupTransactionToReceipt(txn) ||
    mapBookingTransactionToReceipt(txn) ||
    mapOrderTransactionToReceipt(txn)
  );
}

export function resolveReceiptReference(receipt: UtilityReceipt): string {
  if (receipt.requestId?.trim()) return receipt.requestId.trim();
  if (receipt.bookingId?.trim()) return receipt.bookingId.trim();
  if (receipt.orderNumber?.trim()) return receipt.orderNumber.trim();

  const suffix = receipt.purchasedAt.replace(/\D/g, '').slice(-8) || 'receipt';

  if (receipt.receiptKind === 'topup') return `TOP-${suffix}`;
  if (receipt.receiptKind === 'booking') return `BKN-${suffix}`;
  if (receipt.receiptKind === 'order') return `ORD-${suffix}`;

  return `UTL-${suffix}`;
}
