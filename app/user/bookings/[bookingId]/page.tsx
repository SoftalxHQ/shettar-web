'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserLayout from '@/app/components/layouts/UserLayout';
import { Button, Card, Spinner, Badge, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  fetchGuestReservation,
  businessPublicId,
  hotelDetailPath,
  reservationBookedAt,
  reservationRoomNumber,
  roomServicePath,
  type GuestReservation,
} from '@/app/helpers/bookings';
import { currency } from '@/app/states';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<GuestReservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuestReservation(bookingId)
      .then(setBooking)
      .catch((e: unknown) => {
        toast.error(e instanceof Error ? e.message : 'Failed to load booking');
        router.push('/user/bookings');
      })
      .finally(() => setLoading(false));
  }, [bookingId, router]);

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
  const roomType = booking.room?.room_type?.name || 'Room';
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const hotelPath = hotelDetailPath(booking.business);
  const bookedAt = reservationBookedAt(booking);

  return (
    <UserLayout>
      <div className="mb-4">
        <Button variant="link" className="p-0 mb-2" onClick={() => router.push('/user/bookings')}>
          ← Back to bookings
        </Button>
        <h4 className="mb-1">Booking details</h4>
        <p className="text-secondary small mb-0">{booking.business?.name}</p>
      </div>

      <Card className="shadow-sm border mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <span className="text-secondary small d-block">Booking ID</span>
              <span className="fw-bold font-monospace">{booking.booking_id}</span>
            </div>
            <Badge bg="primary" className="text-capitalize">
              {booking.cancelled ? 'Cancelled' : booking.status || 'Confirmed'}
            </Badge>
          </div>

          <Row className="g-3">
            <Col sm={6}>
              <span className="text-secondary small d-block">Room</span>
              <span className="fw-semibold">
                {roomNum ? `Room ${roomNum}` : '—'} · {roomType}
              </span>
            </Col>
            <Col sm={6}>
              <span className="text-secondary small d-block">Total</span>
              <span className="fw-bold text-primary">
                {currency}
                {Number(booking.total_amount).toLocaleString()}
              </span>
            </Col>
            {bookedAt && (
              <Col sm={6}>
                <span className="text-secondary small d-block">Booked on</span>
                <span>{formatDateTime(bookedAt)}</span>
              </Col>
            )}
            {(booking.payment_method_label || booking.payment_method) && (
              <Col sm={6}>
                <span className="text-secondary small d-block">Payment method</span>
                <span className="text-capitalize">
                  {booking.payment_method_label || booking.payment_method}
                </span>
              </Col>
            )}
            <Col sm={6}>
              <span className="text-secondary small d-block">Check-in</span>
              <span>{formatDate(booking.start_date)}</span>
              {booking.business?.check_in && (
                <span className="text-muted small ms-1">({booking.business.check_in})</span>
              )}
            </Col>
            <Col sm={6}>
              <span className="text-secondary small d-block">Check-out</span>
              <span>{formatDate(booking.end_date)}</span>
              {booking.business?.check_out && (
                <span className="text-muted small ms-1">({booking.business.check_out})</span>
              )}
            </Col>
            {booking.checked_in_at && (
              <Col sm={6}>
                <span className="text-secondary small d-block">Checked in</span>
                <span>{new Date(booking.checked_in_at).toLocaleString()}</span>
              </Col>
            )}
            {booking.checked_out_at && (
              <Col sm={6}>
                <span className="text-secondary small d-block">Checked out</span>
                <span>{new Date(booking.checked_out_at).toLocaleString()}</span>
              </Col>
            )}
          </Row>

          {booking.qr_code_url && !booking.checked_out_at && !booking.cancelled && (
            <div className="text-center mt-4 pt-3 border-top">
              <p className="small text-secondary mb-2">Show this QR code at reception</p>
              <img
                src={booking.qr_code_url}
                alt="Booking QR code"
                style={{ maxWidth: 200, height: 'auto' }}
                className="rounded border"
              />
            </div>
          )}

          <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
            {booking.can_order_room_service && businessPublicId(booking.business) && (
              <Link
                href={roomServicePath(booking.booking_id, {
                  businessUniqueId: businessPublicId(booking.business)!,
                  reservationId: booking.id,
                  roomNumber: roomNum,
                })}
                className="btn btn-primary btn-sm"
              >
                Room service
              </Link>
            )}
            {hotelPath && (
              <Link href={hotelPath} className="btn btn-outline-primary btn-sm">
                View hotel
              </Link>
            )}
          </div>
        </Card.Body>
      </Card>

      <p className="text-secondary small">{booking.business?.address}</p>
    </UserLayout>
  );
}
