import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
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
import { BsCreditCard, BsGlobe2, BsPaypal, BsWalletFill } from 'react-icons/bs';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { FaPlus } from 'react-icons/fa6';
import { useState } from 'react';
import { useLayoutContext } from '@/app/states';

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
  setValue
}: {
  room: any,
  hotel: any,
  control: any,
  handleSubmit: any,
  watch: any,
  setValue: any
}) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;
  const { isAuthenticated } = useLayoutContext();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use dates from URL or default to today and tomorrow
  const startDateParam = searchParams.get('start_date');
  const endDateParam = searchParams.get('end_date');

  const getDefaultStartDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const getDefaultEndDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const startDate = startDateParam || getDefaultStartDate();
  const endDate = endDateParam || getDefaultEndDate();
  const roomsCount = searchParams.get('rooms') || '1';

  // Get guest counts from URL or use defaults (at least 1 adult required)
  const adults = Math.max(1, parseInt(searchParams.get('adults') || '2'));
  const children = parseInt(searchParams.get('children') || '0');

  const paymentMethod = watch('payment_method');

  const calculateNights = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const price = room?.price || 0;
  const nights = calculateNights();
  const total = price * nights * parseInt(roomsCount); // No tax applied

  const createReservation = async (data: any, paystackReference?: string) => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
    const token = localStorage.getItem('token');

    // Map form fields to correct database schema
    const reservationData: any = {
      start_date: startDate,
      end_date: endDate,
      guests: adults,  // Use adults count from URL
      children: children,  // Use children count from URL
      number_of_room: roomsCount,
      payment_method: data.payment_method,
      option: data.option,
      paystack_reference: paystackReference,
    };

    if (isAuthenticated) {
      // For authenticated users, use first_name/last_name and emer_* for emergency
      reservationData.first_name = data.first_name;
      reservationData.last_name = data.last_name;
      reservationData.phone_number = data.phone_number;
      reservationData.emer_first_name = data.emer_first_name;
      reservationData.emer_last_name = data.emer_last_name;
      reservationData.emer_phone_number = data.emer_phone_number;
    } else {
      // For guests (unauthenticated), use other_* for guest details and emer_* for emergency
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

    const response = await fetch(`${API_URL}/api/v1/businesses/${hotel.id}/room_types/${room.id}/reservations`, {
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
        const email = user?.email || data.email_address || 'guest@abri.com';

        // Generate custom Paystack reference: BKN{timestamp}{random}
        const generateReference = () => {
          const timestamp = Date.now().toString(36); // Base36 encoded timestamp
          const random = Math.random().toString(36).substring(2, 10); // Random string
          return `BKN${timestamp}${random}`;
        };
        const customReference = generateReference();

        // Initialize payment through backend to get access_code
        const initResponse = await fetch(`${API_URL}/api/v1/payment_initializations`, {
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
                  number_of_room: roomsCount,
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
          onSelect={(key) => setValue('payment_method', key === '1' ? 'wallet' : 'card')}
          className="accordion-icon accordion-bg-light"
          id="accordioncircle"
        >
          {isAuthenticated && (
            <AccordionItem eventKey="1" className="mb-3">
              <AccordionHeader as="h6" id="heading-1">
                <BsWalletFill className=" text-primary me-2" /> <span className="me-5 text-inherit">Pay with Wallet</span>
              </AccordionHeader>
              <AccordionBody>
                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 opacity-75">Available Balance</h6>
                      <h5 className="mb-0 text-primary">{currency}0.00</h5>
                    </div>
                    <Button variant="outline-primary" size="sm">Add Funds</Button>
                  </div>
                </div>
                <p className="small opacity-50 mb-3">Your wallet balance will be debited for this booking.</p>
                <Button
                  variant="primary"
                  className="w-100 mb-0"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : `Pay ${currency}${total.toLocaleString()} Now`}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </div>
            </AccordionBody>
          </AccordionItem>
        </Accordion>
      </CardBody>
      <div className="card-footer p-4 pt-0 bg-transparent text-center">
        {!isAuthenticated && (
          <p className="bg-danger bg-opacity-10 text-danger p-2 rounded small mb-3 fw-bold border border-danger border-opacity-25">
            Guest bookings are non-refundable and cannot be cancelled.
          </p>
        )}
        <p className="mb-0 opacity-50 small">
          By processing, You accept Abri <Link href="#" className="text-primary text-decoration-none border-bottom">Terms of Services</Link> and <Link href="#" className="text-primary text-decoration-none border-bottom">Policy</Link>
        </p>
      </div>
    </Card>
  );
};

export default PaymentOptions;
