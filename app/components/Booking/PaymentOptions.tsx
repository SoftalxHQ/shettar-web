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
  Col,
  FormLabel,
  Image,
  Row,
} from 'react-bootstrap';
import { BsCreditCard, BsGlobe2, BsPaypal, BsWalletFill, BsPlusCircle } from 'react-icons/bs';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { FaPlus } from 'react-icons/fa6';
import { useState, useEffect } from 'react';
import { useLayoutContext } from '@/app/states';
import { useApi } from '@/app/hooks/useApi';
import { toast } from 'react-hot-toast';
import { getStoredToken } from '@/app/helpers/auth';
import { createConsumer } from '@rails/actioncable';

const currency = '₦';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaymentOptions = ({
  room,
  hotel,
  control,
  handleSubmit,
  watch,
  setValue,
  startDate,
  endDate,
  roomsCount
}: {
  room: any,
  hotel: any,
  control: any,
  handleSubmit: any,
  watch: any,
  setValue: any,
  startDate: string | null,
  endDate: string | null,
  roomsCount: string | null
}) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;
  const { isAuthenticated, account, refreshAccount } = useLayoutContext();
  const router = useRouter();
  const { apiFetch } = useApi();

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
        received: (data: any) => {
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

  const price = room?.price || 0;
  const nights = calculateNights();
  const total = price * nights * parseInt(actualRoomsCount); // No tax applied

  const createReservation = async (data: any, paystackReference?: string) => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
    const token = localStorage.getItem('token');

    // Map form fields to correct database schema
    const reservationData: any = {
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

    const payload = {
      reservation: reservationData
    };

    const response = await apiFetch(`${API_URL}/api/v1/businesses/${hotel.id}/room_types/${room.id}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Backend error response:', result);
      throw new Error(result.error?.[0]?.message || result.errors || 'Failed to create booking');
    }

    return result;
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || Number(topUpAmount) < 100) {
      toast.error('Minimum top-up is 100');
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
        body: JSON.stringify({ amount: Number(topUpAmount) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to initialize payment');
      }

      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: account?.email,
        amount: Number(topUpAmount) * 100,
        ref: data.reference,
        onClose: () => {
          setIsTopUpProcessing(false);
        },
        callback: async (response: any) => {
          await verifyTopUpPayment(response.reference);
        }
      });
      handler.openIframe();

    } catch (error: any) {
      toast.error(error.message);
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsTopUpProcessing(false);
    }
  };

  const onSubmit = async (data: any) => {
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

        // Generate custom Paystack reference: STR{TIMESTAMP}{RANDOM}
        const generateReference = () => {
          const timestamp = Date.now().toString(36).toUpperCase(); // Base36 encoded timestamp
          const random = Math.random().toString(36).substring(2, 10).toUpperCase(); // Random string
          return `STR${random}`;
        };
        const customReference = generateReference();

        // Initialize payment through backend to get access_code
        const initResponse = await apiFetch(`${API_URL}/api/v1/payment_initializations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            initialization: {
              email: email,
              amount: total,
              reference: customReference, // Use our custom reference
              metadata: {
                booking_data: {
                  start_date: startDate,
                  end_date: endDate,
                  guests: adults,
                  children: children,
                  number_of_room: actualRoomsCount,
                  hotel_id: hotel.id,
                  room_type_id: room.id
                }
              }
            }
          })
        });

        const initResult = await initResponse.json();

        if (!initResponse.ok || !initResult.success) {
          throw new Error(initResult.message || 'Failed to initialize payment');
        }

        // Open inline Paystack popup with access_code from backend
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: email,
          amount: Math.round(total * 100),
          ref: initResult.reference, // Use reference from backend
          onSuccess: (transaction: any) => {
            // Payment successful, create booking
            createReservation(data, transaction.reference)
              .then((result: any) => {
                router.push(`/hotel/${hotelSlug}/roomtype/${roomSlug}/booking-confirmed?booking_id=${result.reservations[0].booking_id}`);
              })
              .catch((err: any) => {
                setError(err.message || 'Payment successful but booking failed. Please contact support.');
                setIsSubmitting(false);
              });
          },
          onCancel: () => {
            setError('Payment cancelled.');
            setIsSubmitting(false);
          }
        });
      } else {
        // Wallet payment - direct backend call
        const result = await createReservation(data);
        router.push(`/hotel/${hotelSlug}/roomtype/${roomSlug}/booking-confirmed?booking_id=${result.reservations[0].booking_id}`);
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'An error occurred while processing your booking.');
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
          onSelect={(key: any) => setValue('payment_method', key === '1' ? 'wallet' : 'card')}
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
                    {Number(account?.wallet_balance || 0) < total && (
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
                  disabled={isSubmitting || isEmergencyMissing || isEmailUnverified || Number(account?.wallet_balance || 0) < total}
                >
                  {isSubmitting ? 'Processing...' : isEmailUnverified ? 'Verify Email to Book' : isEmergencyMissing ? 'Update Profile to Book' : Number(account?.wallet_balance || 0) < total ? 'Insufficient Balance' : `Pay ${currency}${total.toLocaleString()} Now`}
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
                <p className="mt-3 mb-4 opacity-75">You will be redirected to Paystack to complete your payment securely.</p>
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
    </Card>
  );
};

export default PaymentOptions;
