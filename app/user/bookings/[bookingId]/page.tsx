'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserLayout from '@/app/components/layouts/UserLayout';
import { Button, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { BsCopy, BsShare } from 'react-icons/bs';
import {
  fetchGuestReservation,
  businessPublicId,
  hotelDetailPath,
  reservationBookedAt,
  reservationRoomNumber,
  roomServicePath,
  isBookedForSomeone,
  reservationGuestName,
  reservationGuestEmail,
  reservationGuestPhone,
  reservationStatusLabel,
  type GuestReservation,
} from '@/app/helpers/bookings';
import { currency } from '@/app/states';
import { formatBusinessTime } from '@/app/helpers/dates';
import { shareBookingPassPng } from '@/app/helpers/receipt-export';

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="booking-pass-meta-row">
      <span className="booking-pass-meta-label">{label}</span>
      <span className="booking-pass-meta-value">{value}</span>
    </div>
  );
}

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
  const guestName = reservationGuestName(booking);
  const guestEmail = reservationGuestEmail(booking);
  const guestPhone = reservationGuestPhone(booking);
  const bookedForSomeone = isBookedForSomeone(booking);
  const statusLabel = reservationStatusLabel(booking);
  const guestsLine =
    booking.guests != null
      ? `${booking.guests} adult${booking.guests === 1 ? '' : 's'}${
          booking.children ? ` · ${booking.children} child${booking.children === 1 ? '' : 'ren'}` : ''
        }`
      : null;

  return (
    <UserLayout>
      <div className="booking-pass-page">
        <Button variant="link" className="p-0 mb-3 text-decoration-none" onClick={() => router.push('/user/bookings')}>
          ← Back to bookings
        </Button>

        <div className="booking-pass" ref={passRef}>
          <div className="booking-pass-header">
            <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
              <span className="booking-pass-eyebrow">Shettar reservation</span>
              <span className="booking-pass-status">{statusLabel}</span>
            </div>
            <h1 className="booking-pass-hotel">{booking.business?.name || 'Booking'}</h1>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="booking-pass-code">{booking.booking_id}</span>
              <button
                type="button"
                className="booking-pass-copy"
                onClick={copyBookingCode}
                aria-label="Copy booking code"
                title="Copy booking code"
              >
                <BsCopy size={15} />
              </button>
            </div>
          </div>

          <div className="booking-pass-dates">
            <div>
              <div className="booking-pass-date-label">Check-in</div>
              <div className="booking-pass-date-value">{formatDate(booking.start_date)}</div>
              <div className="booking-pass-date-time">
                {formatBusinessTime(booking.business?.check_in, '2:00 PM')}
              </div>
            </div>
            <div className="booking-pass-date-divider" />
            <div className="text-sm-end">
              <div className="booking-pass-date-label">Check-out</div>
              <div className="booking-pass-date-value">{formatDate(booking.end_date)}</div>
              <div className="booking-pass-date-time">
                {formatBusinessTime(booking.business?.check_out, '11:00 AM')}
              </div>
            </div>
          </div>

          <div className="booking-pass-body">
            <div className="booking-pass-section-label">Stay details</div>
            <MetaRow label="Room" value={`${roomNum ? `Room ${roomNum}` : '—'} · ${roomType}`} />
            {guestsLine ? <MetaRow label="Guests" value={guestsLine} /> : null}
            {bookedAt ? <MetaRow label="Booked on" value={formatDateTime(bookedAt)} /> : null}
            {(booking.payment_method_label || booking.payment_method) && (
              <MetaRow
                label="Payment"
                value={
                  <span className="text-capitalize">
                    {booking.payment_method_label || booking.payment_method}
                  </span>
                }
              />
            )}
            {booking.checked_in_at ? (
              <MetaRow label="Checked in" value={formatDateTime(booking.checked_in_at)} />
            ) : null}
            {booking.checked_out_at ? (
              <MetaRow label="Checked out" value={formatDateTime(booking.checked_out_at)} />
            ) : null}

            <div className="booking-pass-total">
              <span>Total paid</span>
              <strong>
                {currency}
                {Number(booking.total_amount).toLocaleString()}
              </strong>
            </div>
          </div>

          {bookedForSomeone && (guestName || guestEmail || guestPhone) ? (
            <div className="booking-pass-body booking-pass-body-border">
              <div className="booking-pass-section-label">Booked for</div>
              {guestName ? <MetaRow label="Name" value={guestName} /> : null}
              {guestEmail ? <MetaRow label="Email" value={guestEmail} /> : null}
              {guestPhone ? <MetaRow label="Phone" value={guestPhone} /> : null}
            </div>
          ) : null}

          {(booking.business?.address || booking.business?.phone_number) && (
            <div className="booking-pass-body booking-pass-body-border">
              <div className="booking-pass-section-label">Property</div>
              {booking.business?.address ? (
                <p className="booking-pass-property mb-1">{booking.business.address}</p>
              ) : null}
              {booking.business?.phone_number ? (
                <p className="booking-pass-property-phone mb-0">{booking.business.phone_number}</p>
              ) : null}
            </div>
          )}

          {booking.qr_code_url && !booking.checked_out_at && !booking.cancelled && (
            <div className="booking-pass-qr">
              <div className="booking-pass-section-label mb-3">Show at reception</div>
              <img
                src={booking.qr_code_url}
                alt="Booking QR code"
                className="booking-pass-qr-img"
              />
            </div>
          )}
        </div>

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
        </div>
      </div>

      <style jsx>{`
        .booking-pass-page {
          max-width: 560px;
        }

        .booking-pass {
          background: var(--bs-body-bg);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 18px 40px rgba(20, 20, 50, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        :global([data-bs-theme='dark']) .booking-pass {
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
          border-color: rgba(255, 255, 255, 0.06);
        }

        .booking-pass-header {
          background: var(--bs-primary);
          color: #fff;
          padding: 1.5rem 1.5rem 1.65rem;
        }

        .booking-pass-eyebrow {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
        }

        .booking-pass-status {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 0.25rem 0.7rem;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .booking-pass-hotel {
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 0.65rem;
          color: #fff;
        }

        .booking-pass-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.04em;
          color: #fff;
        }

        .booking-pass-copy {
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .booking-pass-copy:hover {
          background: rgba(255, 255, 255, 0.24);
        }

        .booking-pass-dates {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
        }

        .booking-pass-date-divider {
          width: 1px;
          background: rgba(0, 0, 0, 0.08);
        }

        :global([data-bs-theme='dark']) .booking-pass-date-divider {
          background: rgba(255, 255, 255, 0.1);
        }

        .booking-pass-date-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bs-secondary-color);
          margin-bottom: 0.35rem;
        }

        .booking-pass-date-value {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--bs-body-color);
        }

        .booking-pass-date-time {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--bs-primary);
          margin-top: 0.15rem;
        }

        .booking-pass-body {
          padding: 1.15rem 1.5rem 1.35rem;
        }

        .booking-pass-body-border {
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        :global([data-bs-theme='dark']) .booking-pass-body-border {
          border-top-color: rgba(255, 255, 255, 0.08);
        }

        .booking-pass-section-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bs-secondary-color);
          margin-bottom: 0.65rem;
        }

        .booking-pass-meta-row {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.45rem 0;
        }

        .booking-pass-meta-label {
          color: var(--bs-secondary-color);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .booking-pass-meta-value {
          color: var(--bs-body-color);
          font-size: 0.95rem;
          font-weight: 600;
          text-align: right;
        }

        .booking-pass-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.85rem;
          padding-top: 0.95rem;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          font-size: 1rem;
          font-weight: 700;
        }

        :global([data-bs-theme='dark']) .booking-pass-total {
          border-top-color: rgba(255, 255, 255, 0.08);
        }

        .booking-pass-total strong {
          color: var(--bs-primary);
          font-size: 1.45rem;
          font-weight: 900;
        }

        .booking-pass-property {
          font-weight: 600;
          color: var(--bs-body-color);
          line-height: 1.45;
        }

        .booking-pass-property-phone {
          color: var(--bs-secondary-color);
          font-size: 0.9rem;
        }

        .booking-pass-qr {
          text-align: center;
          padding: 1.25rem 1.5rem 1.75rem;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        :global([data-bs-theme='dark']) .booking-pass-qr {
          border-top-color: rgba(255, 255, 255, 0.08);
        }

        .booking-pass-qr-img {
          max-width: 180px;
          height: auto;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #fff;
          padding: 8px;
        }
      `}</style>
    </UserLayout>
  );
}
