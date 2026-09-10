'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserLayout from '@/app/components/layouts/UserLayout';
import { Button, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { BsShare } from 'react-icons/bs';
import BookingPass from '@/app/components/Booking/BookingPass';
import {
  fetchGuestReservation,
  businessPublicId,
  hotelDetailPath,
  reservationRoomNumber,
  roomServicePath,
  type GuestReservation,
} from '@/app/helpers/bookings';
import { shareBookingPassPng } from '@/app/helpers/receipt-export';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const passRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<GuestReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchGuestReservation(bookingId)
      .then(setBooking)
      .catch((e: unknown) => {
        toast.error(e instanceof Error ? e.message : 'Failed to load booking');
        router.push('/user/bookings');
      })
      .finally(() => setLoading(false));
  }, [bookingId, router]);

  const copyBookingCode = async () => {
    if (!booking?.booking_id) return;
    try {
      await navigator.clipboard.writeText(booking.booking_id);
      toast.success('Booking code copied');
    } catch {
      toast.error('Could not copy booking code');
    }
  };

  const shareBookingPass = async () => {
    if (sharing || !passRef.current || !booking?.booking_id) return;
    setSharing(true);
    try {
      const result = await shareBookingPassPng(passRef.current, booking.booking_id);
      toast.success(result === 'shared' ? 'Booking shared' : 'Booking image downloaded');
    } catch (error) {
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'NotAllowedError')) {
        return;
      }
      console.error('Share booking failed:', error);
      toast.error('Could not share booking');
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </UserLayout>
    );
  }

  if (!booking) return null;

  const roomNum = reservationRoomNumber(booking);
  const hotelPath = hotelDetailPath(booking.business);

  return (
    <UserLayout>
      <div className="booking-pass-page">
        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
          <Button variant="link" className="p-0 text-decoration-none" onClick={() => router.push('/user/bookings')}>
            ← Back to bookings
          </Button>
          <Link href="/" className="btn btn-link p-0 text-decoration-none">
            Home
          </Link>
        </div>

        <BookingPass
          ref={passRef}
          booking={booking}
          onCopyCode={copyBookingCode}
          hideInteractive={sharing}
        />

        <div className="d-flex flex-wrap gap-2 mt-4">
          <Button variant="outline-primary" onClick={shareBookingPass} disabled={sharing}>
            {sharing ? <Spinner size="sm" className="me-2" /> : <BsShare className="me-2" />}
            {sharing ? 'Preparing…' : 'Share as image'}
          </Button>
          {booking.can_order_room_service && businessPublicId(booking.business) && (
            <Link
              href={roomServicePath(booking.booking_id, {
                businessUniqueId: businessPublicId(booking.business)!,
                reservationId: booking.id,
                roomNumber: roomNum,
              })}
              className="btn btn-primary"
            >
              Room service
            </Link>
          )}
          {!booking.can_order_room_service &&
            booking.has_room_service_orders &&
            businessPublicId(booking.business) && (
              <Link
                href={roomServicePath(booking.booking_id, {
                  businessUniqueId: businessPublicId(booking.business)!,
                  reservationId: booking.id,
                  roomNumber: roomNum,
                  historyOnly: true,
                })}
                className="btn btn-outline-primary"
              >
                View orders
              </Link>
            )}
          {hotelPath && (
            <Link href={hotelPath} className="btn btn-outline-primary">
              View hotel
            </Link>
          )}
          <Link href="/" className="btn btn-outline-primary">
            Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .booking-pass-page {
          max-width: 560px;
        }
      `}</style>
    </UserLayout>
  );
}
