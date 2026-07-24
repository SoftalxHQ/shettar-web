import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Modal,
  Form,
  InputGroup,
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Image,
} from 'react-bootstrap';
import { BsCreditCard, BsWalletFill } from 'react-icons/bs';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type {
  Control,
  UseFormHandleSubmit,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { useLayoutContext } from '@/app/states';
import { useApi } from '@/app/hooks/useApi';
import { toast } from 'react-hot-toast';
import { getStoredToken } from '@/app/helpers/auth';
import { getAttributionToken } from '@/app/hooks/useSponsoredListingTracking';
import { createConsumer } from '@rails/actioncable';
import { useTransactionPin } from '@/app/hooks/useTransactionPin';
import type { AppliedPromo } from '@/app/helpers/promo';

const currency = '₦';

export type BookingFormValues = {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  emer_first_name: string;
  emer_last_name: string;
  emer_phone_number: string;
  payment_method: 'wallet' | 'card';
  option: 'self' | 'guest' | string;
};

type BookingRoom = {
  id: number | string;
  price?: number | string;
};

type BookingHotel = {
  id: number | string;
};

type ReservationPayload = {
  start_date: string | null;
  end_date: string | null;
  guests: number;
  children: number;
  number_of_room: string;
  payment_method: BookingFormValues['payment_method'];
  option: string;
  paystack_reference?: string;
  booking_source: string;
  promo_code?: string;
  ad_attribution_token?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  emer_first_name?: string;
  emer_last_name?: string;
  emer_phone_number?: string;
  other_first_name?: string;
  other_last_name?: string;
  other_phone_number?: string;
  other_email_address?: string;
};

type ReservationCreateResult = {
  reservations: Array<{ booking_id: string }>;
};

type WalletChannelMessage = {
  event?: string;
  amount?: number | string;
  reference?: string;
};

type PaystackPopupTransaction = {
  reference: string;
};

type PaystackSetupHandler = {
  openIframe: () => void;
};

type PaystackPopInstance = {
  newTransaction: (options: {
    key?: string;
    email: string;
    amount: number;
    ref: string;
    onSuccess: (transaction: PaystackPopupTransaction) => void;
    onCancel: () => void;
  }) => void;
};

type PaystackPopConstructor = {
  new (): PaystackPopInstance;
  setup: (options: {
    key?: string;
    email?: string;
    amount: number;
    ref: string;
    metadata?: Record<string, unknown>;
    onClose: () => void;
    callback: (response: PaystackPopupTransaction) => void | Promise<void>;
  }) => PaystackSetupHandler;
};

declare global {
  interface Window {
    PaystackPop: PaystackPopConstructor;
  }
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

type PaymentOptionsProps = {
  room: BookingRoom;
  hotel: BookingHotel;
  control: Control<BookingFormValues>;
  handleSubmit: UseFormHandleSubmit<BookingFormValues>;
  watch: UseFormWatch<BookingFormValues>;
  setValue: UseFormSetValue<BookingFormValues>;
  startDate: string | null;
  endDate: string | null;
  roomsCount: string | null;
  appliedPromo?: AppliedPromo | null;
};

const PaymentOptions = ({
  room,
  hotel,
  handleSubmit,
  watch,
  setValue,
  startDate,
  endDate,
  roomsCount,
  appliedPromo
}: PaymentOptionsProps) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;
  const { isAuthenticated, account, refreshAccount } = useLayoutContext();
  const router = useRouter();
  const { apiFetch } = useApi();
  const { requestTransactionPin, PinModal } = useTransactionPin();

  const isEmergencyMissing = isAuthenticated && (!account?.emer_first_name || !account?.emer_phone_number);
  const isEmailUnverified = isAuthenticated && account && !account.email_verified;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Top-up state
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);

  // Handle Real-time updates via ActionCable (WebSocket)
  useEffect(() => {
    if (!isAuthenticated || !account) return;

    const token = getStoredToken();
    if (!token) return;

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
    const wsUrl = API_URL.replace(/^http/, 'ws') + '/cable';

    const consumer = createConsumer(`${wsUrl}?token=${token}`);

    const subscription = consumer.subscriptions.create(
      { channel: 'WalletChannel' },
      {
        received: (data: WalletChannelMessage) => {
          if (data.event === 'balance_updated') {
            toast.success(`Success! Wallet credited with ${currency}${data.amount}`, { id: data.reference });
            refreshAccount?.();
          }
        },
      }
    );

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [isAuthenticated, account, refreshAccount]);

  // Calculate adults/children from search params, but use props for stay details
  const adults = Math.max(1, parseInt(searchParams.get('adults') || '2'));
  const children = parseInt(searchParams.get('children') || '0');
  const actualRoomsCount = roomsCount || '1';

  const paymentMethod = watch('payment_method');

  const calculateNights = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const price = Number(room?.price || 0);
  const nights = calculateNights();
  const subtotal = price * nights * parseInt(actualRoomsCount); // Base price before discount
  
  // Use appliedPromo passed from parent
  const discountAmount = appliedPromo?.discount_amount || 0;
  const customerPayTotal = subtotal - discountAmount;

  const createReservation = async (
    data: BookingFormValues,
    paystackReference?: string,
    transactionPin?: string
  ): Promise<ReservationCreateResult> => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
    const token = localStorage.getItem('token');

    // Map form fields to correct database schema
    const reservationData: ReservationPayload = {
      start_date: startDate,
      end_date: endDate,
      guests: adults,  // Use adults count from URL
      children: children,  // Use children count from URL
      number_of_room: actualRoomsCount,
      payment_method: data.payment_method,
      option: isAuthenticated ? data.option : 'guest', // Force 'guest' if not authenticated
      paystack_reference: paystackReference,
      booking_source: 'web',
    };

    if (isAuthenticated && data.option === 'self') {
      // For authenticated users booking for themselves
      reservationData.first_name = data.first_name;
      reservationData.last_name = data.last_name;
      reservationData.phone_number = data.phone_number;
      reservationData.emer_first_name = data.emer_first_name;
      reservationData.emer_last_name = data.emer_last_name;
      reservationData.emer_phone_number = data.emer_phone_number;
    } else {
      // For guests (unauthenticated) OR authenticated users booking for others
      reservationData.other_first_name = data.first_name;
      reservationData.other_last_name = data.last_name;
      reservationData.other_phone_number = data.phone_number;
      reservationData.other_email_address = data.email_address;
      reservationData.emer_first_name = data.emer_first_name;
      reservationData.emer_last_name = data.emer_last_name;
      reservationData.emer_phone_number = data.emer_phone_number;
    }

    if (appliedPromo) {
      reservationData.promo_code = appliedPromo.code;
    }

    const adToken = getAttributionToken();
    if (adToken) {
      reservationData.ad_attribution_token = adToken;
    }

    const payload: Record<string, unknown> = {
      reservation: reservationData,
    };
    if (transactionPin) payload.transaction_pin = transactionPin;

    const response = await apiFetch(`${API_URL}/api/v1/businesses/${hotel.id}/room_types/${room.id}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json() as ReservationCreateResult & {
      error?: Array<{ message?: string }>;
      errors?: string;
    };

    if (!response.ok) {
      console.error('Backend error response:', result);
      throw new Error(result.error?.[0]?.message || result.errors || 'Failed to create booking');
    }

    return result;
  };

  const showBookingSuccessToast = (bookingId: string) => {
    toast.success('Your booking has been confirmed!', {
      id: `booking-confirmed-${bookingId}`,
      duration: 5000,
      icon: '🎉',
    });
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || Number(topUpAmount) < 100) {
      toast.error('Minimum top-up is ₦100');
      return;
    }

    setIsTopUpProcessing(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

      const response = await apiFetch(`${API_URL}/api/v1/wallet/initialize_topup`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: Number(topUpAmount), payment_method: 'card' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to initialize payment');
      }

      const chargeAmount = data.charge_amount || Number(topUpAmount);
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: account?.email,
        amount: Math.round(chargeAmount * 100),
        ref: data.reference,
        metadata: data.metadata,
        onClose: () => { setIsTopUpProcessing(false); },
        callback: async (response: PaystackPopupTransaction) => {
          await verifyTopUpPayment(response.reference);
        }
      });
      handler.openIframe();

    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to initialize payment'));
      setIsTopUpProcessing(false);
    }
  };

  const verifyTopUpPayment = async (reference: string) => {
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

      const response = await apiFetch(`${API_URL}/api/v1/wallet/verify_topup`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reference })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.message !== "Transaction already processed") {
          toast.success(data.message, { id: reference });
        }
        setShowTopUp(false);
        setTopUpAmount('');
        refreshAccount?.();
      } else {
        throw new Error(data.errors?.[0]?.message || 'Verification failed');
      }
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Verification failed'));
    } finally {
      setIsTopUpProcessing(false);
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const token = localStorage.getItem('token');

      if (data.payment_method === 'card') {
        // Get user email
        const userJson = localStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        const email = user?.email || data.email_address || 'guest@shettar.com';

        const generateReference = () => `STR${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const customReference = generateReference();

        // Calculate gross amount so platform receives exactly `total` after Paystack fee
        const calculateGross = (target: number) => {
          let gross: number;
          if (target < 2500) {
            gross = target / (1 - 0.015);
          } else {
            gross = (target + 100) / (1 - 0.015);
            if (gross - target > 2000) gross = target + 2000;
          }
          return Math.round(gross * 100) / 100;
        };
        const grossAmount = calculateGross(customerPayTotal);
        const paystackFee = Math.round((grossAmount - customerPayTotal) * 100) / 100;

        // Initialize payment through backend
        const initResponse = await apiFetch(`${API_URL}/api/v1/payment_initializations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            initialization: {
              email: email,
              amount: grossAmount,
              reference: customReference,
              metadata: {
                target_amount: customerPayTotal,
                paystack_fee: paystackFee,
                booking_data: {
                  start_date: startDate,
                  end_date: endDate,
                  guests: adults,
                  children: children,
                  number_of_room: actualRoomsCount,
                  hotel_id: hotel.id,
                  room_type_id: room.id,
                  promo_code: appliedPromo?.code
                }
              }
            }
          })
        });

        const initResult = await initResponse.json();

        if (!initResponse.ok || !initResult.success) {
          throw new Error(initResult.message || 'Failed to initialize payment');
        }

        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: email,
          amount: Math.round(grossAmount * 100), // gross amount in kobo
          ref: initResult.reference,
          onSuccess: (transaction: PaystackPopupTransaction) => {
            createReservation(data, transaction.reference)
              .then((result: ReservationCreateResult) => {
                const confirmedBookingId = result.reservations[0].booking_id;
                showBookingSuccessToast(confirmedBookingId);
                router.push(`/hotel/${hotelSlug}/roomtype/${roomSlug}/booking-confirmed?booking_id=${confirmedBookingId}&rooms=${actualRoomsCount}`);
              })
              .catch((err: unknown) => {
                setError(errorMessage(err, 'Payment successful but booking failed. Please contact support.'));
                setIsSubmitting(false);
              });
          },
          onCancel: () => {
            setError('Payment cancelled.');
            setIsSubmitting(false);
          }
        });
      } else {
        const transactionPin = await requestTransactionPin();
        if (!transactionPin) {
          setIsSubmitting(false);
          return;
        }
        const result = await createReservation(data, undefined, transactionPin);
        const confirmedBookingId = result.reservations[0].booking_id;
        showBookingSuccessToast(confirmedBookingId);
        router.push(`/hotel/${hotelSlug}/roomtype/${roomSlug}/booking-confirmed?booking_id=${confirmedBookingId}&rooms=${actualRoomsCount}`);
      }
    } catch (err: unknown) {
      console.error('Booking error:', err);
      setError(errorMessage(err, 'An error occurred while processing your booking.'));
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow">
      <CardHeader className="border-bottom p-4 bg-transparent">
        <h4 className="card-title mb-0 items-center">
          <BsWalletFill className=" me-2" />
          Payment Options
        </h4>
      </CardHeader>
      <CardBody className="p-4">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Accordion
          activeKey={paymentMethod === 'wallet' ? '1' : '2'}
          onSelect={(key) => {
            // Ignore null/undefined (collapse events) so one tap switches methods instead of needing two.
            if (key === '1') setValue('payment_method', 'wallet');
            else if (key === '2') setValue('payment_method', 'card');
          }}
          className="accordion-icon accordion-bg-light"
          id="paymentAccordion"
          defaultActiveKey={isAuthenticated ? '1' : '2'}
        >
          {isAuthenticated && (
            <AccordionItem eventKey="1" className="mb-3">
              <AccordionHeader as="h6" id="heading-1">
                <BsWalletFill className=" text-primary me-2" /> <span className="me-5 text-inherit">Pay with Wallet</span>
              </AccordionHeader>
              <AccordionBody className="p-4">
                <div className="bg-primary-soft p-4 rounded-3 mb-4 border border-primary border-opacity-10">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 fw-normal text-primary opacity-75">Available Balance</h6>
                      <h3 className="mb-0 text-primary fw-bold">{currency}{account?.wallet_balance?.toLocaleString() ?? '0.00'}</h3>
                    </div>
                    {Number(account?.wallet_balance || 0) < customerPayTotal && (
                      <Button variant="primary" size="sm" className="px-3" onClick={() => setShowTopUp(true)}>
                        Add Funds
                      </Button>
                    )}
                  </div>
                </div>
                <p className="small text-secondary mb-4">Your wallet balance will be debited for this booking.</p>
                <Button
                  variant="primary"
                  className="w-100 mb-0"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting || isEmergencyMissing || isEmailUnverified || Number(account?.wallet_balance || 0) < customerPayTotal}
                >
                  {isSubmitting ? 'Processing...' : isEmailUnverified ? 'Verify Email to Book' : isEmergencyMissing ? 'Update Profile to Book' : Number(account?.wallet_balance || 0) < customerPayTotal ? 'Insufficient Balance' : `Pay ${currency}${customerPayTotal.toLocaleString()} Now`}
                </Button>
              </AccordionBody>
            </AccordionItem>
          )}

          <AccordionItem eventKey="2" className="mb-3">
            <AccordionHeader as="h6" id="heading-2">
              <BsCreditCard className=" text-primary me-2" /> <span className="me-5 text-inherit">Pay with Card (Paystack)</span>
            </AccordionHeader>
            <AccordionBody>
              <div className="text-center py-4">
                <Image src="/images/element/visa.svg" className="h-30px me-2" alt="visa" />
                <Image src="/images/element/mastercard.svg" className="h-30px me-2" alt="mastercard" />
                <Image src="/images/element/expresscard.svg" className="h-30px" alt="express" />
                <p className="mt-3 mb-3 opacity-75">You will be redirected to Paystack to complete your payment securely.</p>
                {/* Fee breakdown */}
                {customerPayTotal > 0 && (() => {
                  let gross: number;
                  if (customerPayTotal < 2500) { gross = customerPayTotal / (1 - 0.015); }
                  else { gross = (customerPayTotal + 100) / (1 - 0.015); if (gross - customerPayTotal > 2000) gross = customerPayTotal + 2000; }
                  gross = Math.round(gross * 100) / 100;
                  const fee = Math.round((gross - customerPayTotal) * 100) / 100;
                  return (
                    <div className="bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded p-3 mb-3 text-start">
                      <p className="small fw-bold mb-2">Payment Breakdown</p>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">Booking amount</span>
                        <span>
                          {appliedPromo ? (
                            <>
                              <span className="text-decoration-line-through opacity-50 me-2">{currency}{subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                              <span>{currency}{customerPayTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                            </>
                          ) : (
                            <span>{currency}{customerPayTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                          )}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">Paystack processing fee</span>
                        <span className="text-danger">+{currency}{fee.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="d-flex justify-content-between small fw-bold border-top pt-2 mt-1">
                        <span>Total charged</span>
                        <span className="text-primary">{currency}{gross.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })()}
                <Button
                  variant="primary"
                  className="w-100 mb-0"
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isAuthenticated || isSubmitting || isEmergencyMissing || isEmailUnverified}
                >
                  {!isAuthenticated ? 'Account Required to Book' : isSubmitting ? 'Processing...' : isEmailUnverified ? 'Verify Email to Book' : isEmergencyMissing ? 'Update Profile to Book' : 'Proceed to Payment'}
                </Button>
              </div>
            </AccordionBody>
          </AccordionItem>
        </Accordion>
      </CardBody>
      <div className="card-footer p-4 pt-0 bg-transparent text-center">
        {!isAuthenticated && (
          <p className="bg-warning bg-opacity-10 text-dark p-2 rounded small mb-3 fw-bold border border-warning border-opacity-25">
            You must be signed in to create a booking on Shettar.
          </p>
        )}
        <p className="mb-0 opacity-50 small">
          By processing, You accept Shettar <Link href="#" className="text-primary text-decoration-none border-bottom">Terms of Services</Link> and <Link href="#" className="text-primary text-decoration-none border-bottom">Policy</Link>
        </p>
      </div>
      <Modal show={showTopUp} onHide={() => !isTopUpProcessing && setShowTopUp(false)} centered>
        <Modal.Header closeButton={!isTopUpProcessing}>
          <Modal.Title>Fund Your Wallet</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleTopUp}>
          <Modal.Body className="p-4">
            <p className="text-secondary small mb-4">Enter an amount to add to your wallet. You will be redirected to Paystack for secure payment.</p>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Amount to Fund</Form.Label>
              <InputGroup size="lg">
                <InputGroup.Text className="bg-light">{currency}</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  min="100"
                  required
                  disabled={isTopUpProcessing}
                />
              </InputGroup>
              <Form.Text className="text-muted">Minimum funding amount is {currency}100.00</Form.Text>
            </Form.Group>

            <div className="d-flex gap-2 mt-4">
              {[500, 1000, 2000, 5000].map(amt => (
                <Button
                  key={amt}
                  variant="outline-secondary"
                  size="sm"
                  className="flex-grow-1"
                  onClick={() => setTopUpAmount(amt.toString())}
                  disabled={isTopUpProcessing}
                >
                  +{amt}
                </Button>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 p-4 pt-0">
            <Button variant="white" onClick={() => setShowTopUp(false)} disabled={isTopUpProcessing}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isTopUpProcessing || !topUpAmount}>
              {isTopUpProcessing ? 'Processing...' : 'Proceed to Pay'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <PinModal />
    </Card>
  );
};

export default PaymentOptions;
