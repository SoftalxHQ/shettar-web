'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card, CardBody, Spinner } from 'react-bootstrap';
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    const processPayment = async () => {
      try {
        const reference = searchParams.get('reference');
        if (!reference) {
          throw new Error('Payment reference not found');
        }

        // Get booking data from session storage
        const bookingDataStr = sessionStorage.getItem('pending_booking_data');
        if (!bookingDataStr) {
          throw new Error('Booking data not found');
        }

        const bookingData = JSON.parse(bookingDataStr);
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        const token = localStorage.getItem('token');

        // Create reservation with payment reference
        const response = await fetch(
          `${API_URL}/api/v1/businesses/${bookingData.hotel_id}/room_types/${bookingData.room_type_id}/reservations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              reservation: {
                start_date: bookingData.start_date,
                end_date: bookingData.end_date,
                guests: bookingData.guests,
                number_of_room: bookingData.number_of_room,
                payment_method: 'card',
                option: bookingData.option,
                paystack_reference: reference,
                first_name: bookingData.first_name,
                last_name: bookingData.last_name,
                email_address: bookingData.email_address,
                phone_number: bookingData.phone_number,
                emer_first_name: bookingData.emer_first_name,
                emer_last_name: bookingData.emer_last_name,
                emer_phone_number: bookingData.emer_phone_number,
              },
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.[0]?.message || result.errors || 'Failed to create booking');
        }

        // Clear session storage
        sessionStorage.removeItem('pending_booking_data');

        // Redirect to confirmation page
        setStatus('success');
        setMessage('Payment successful! Redirecting to confirmation...');
        setTimeout(() => {
          router.push(
            `/hotel/${hotelSlug}/roomtype/${roomSlug}/booking-confirmed?booking_id=${result.reservations[0].booking_id}`
          );
        }, 2000);
      } catch (err: any) {
        console.error('Payment callback error:', err);
        setStatus('error');
        setMessage(err.message || 'Payment verification failed');
      }
    };

    processPayment();
  }, [searchParams, router, hotelSlug, roomSlug]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Card className="shadow-lg border-0" style={{ maxWidth: '500px', width: '100%' }}>
        <CardBody className="p-5 text-center">
          {status === 'processing' && (
            <>
              <Spinner animation="border" variant="primary" className="mb-4" style={{ width: '4rem', height: '4rem' }} />
              <h3 className="mb-2">Processing Payment</h3>
              <p className="text-muted">{message}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <BsCheckCircleFill className="text-success mb-4" style={{ fontSize: '4rem' }} />
              <h3 className="mb-2">Payment Successful!</h3>
              <p className="text-muted">{message}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <BsXCircleFill className="text-danger mb-4" style={{ fontSize: '4rem' }} />
              <h3 className="mb-2">Payment Failed</h3>
              <p className="text-muted">{message}</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => router.push(`/hotel/${hotelSlug}/roomtype/${roomSlug}/booking`)}
              >
                Try Again
              </button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
