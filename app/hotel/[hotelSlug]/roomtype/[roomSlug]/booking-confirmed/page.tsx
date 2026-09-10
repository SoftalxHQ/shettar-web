'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Container } from 'react-bootstrap';
import { BsCheckCircleFill } from 'react-icons/bs';
import { Header } from '@/app/components';
import Footer from '@/app/components/Footer';
import { Skeleton } from '@/app/components';
import confetti from 'canvas-confetti';
import { useLayoutContext } from '@/app/states';
import { fetchGuestReservation, type GuestReservation } from '@/app/helpers/bookings';

export default function BookingConfirmedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelSlug = params.hotelSlug as string;
  const { isAuthenticated } = useLayoutContext();

  const [booking, setBooking] = useState<GuestReservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    const load = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setBooking(await fetchGuestReservation(bookingId));
      } catch {
        setError('Unable to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [bookingId]);

  useEffect(() => {
    if (isLoading || !booking) return;

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, [isLoading, booking]);

  if (isLoading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Skeleton height="280px" width="100%" className="rounded-4" />
        </Container>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Card className="border-0 shadow-sm rounded-4 p-5 mx-auto" style={{ maxWidth: 480 }}>
            <h3 className="text-danger">Booking Not Found</h3>
            <p className="text-body-secondary">{error || 'Unable to load booking details'}</p>
            <Link href="/">
              <Button variant="primary">Back to Home</Button>
            </Link>
          </Card>
        </Container>
        <Footer />
      </>
    );
  }

  const displayBookingId = booking.booking_id || bookingId;
  const roomsFromQuery = Number(searchParams.get('rooms') || 0);
  const roomsBooked = Math.max(1, roomsFromQuery || 1);
  const bookingsHref =
    roomsBooked > 1
      ? '/user/bookings'
      : `/user/bookings/${encodeURIComponent(String(displayBookingId))}`;
  const bookingsLabel = roomsBooked > 1 ? 'View My Bookings' : 'View Booking';

  return (
    <>
      <Header />
      <main className="py-5 min-vh-100 bg-body-tertiary bg-opacity-25 d-flex align-items-center">
        <Container>
          <Card className="border-0 shadow-sm rounded-4 mx-auto text-center p-4 p-md-5" style={{ maxWidth: 520 }}>
            <div className="mb-4 position-relative d-inline-block">
              <BsCheckCircleFill size={72} className="text-success" />
            </div>
            <h1 className="h2 fw-bold mb-2 text-body-emphasis">Booking Confirmed</h1>
            <p className="text-body-secondary mb-1">
              {booking.business?.name
                ? <>You&apos;re booked at <strong className="text-body-emphasis">{booking.business.name}</strong>.</>
                : 'Your reservation is confirmed.'}
            </p>
            <p className="small text-body-secondary mb-4">A confirmation email is on its way. Share your receipt from the booking page.</p>
            {displayBookingId ? (
              <div className="mb-4">
                <div className="small text-uppercase fw-semibold text-body-secondary mb-1" style={{ letterSpacing: '0.12em' }}>
                  Booking code
                </div>
                <div className="font-monospace fw-bold text-primary" style={{ fontSize: '1.25rem', letterSpacing: '0.06em' }}>
                  {displayBookingId}
                </div>
              </div>
            ) : null}
            <div className="d-grid gap-2">
              {isAuthenticated && (
                <Link href={bookingsHref}>
                  <Button variant="primary" className="w-100 py-3 rounded-3">
                    {bookingsLabel}
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button variant="outline-primary" className="w-100 py-3 rounded-3">
                  Back to Home
                </Button>
              </Link>
              <Link href={`/hotel/${hotelSlug}`} className="small text-body-secondary text-decoration-none mt-1">
                View hotel
              </Link>
            </div>
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
