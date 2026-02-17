'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Col, Container, Row, Image } from 'react-bootstrap';
import { BsCheckCircleFill, BsCalendarCheck, BsHouse, BsDownload, BsPrinter } from 'react-icons/bs';
import { Header } from '@/app/components';
import Footer from '@/app/components/Footer';
import { Skeleton } from '@/app/components';
import confetti from 'canvas-confetti';
import { useReactToPrint } from 'react-to-print';

export default function BookingConfirmedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;

  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [roomType, setRoomType] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = searchParams.get('booking_id');

  const formatDate = (dateStr: string | null, defaultDate: string) => {
    if (!dateStr) return defaultDate;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return defaultDate;
    }
  };

  const calculateNights = () => {
    if (!booking) return 1;
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const displayCheckIn = formatDate(booking?.start_date, '4 March 2026');
  const displayCheckOut = formatDate(booking?.end_date, '8 March 2026');

  const formatTime = (timeStr: string | null, defaultTime: string) => {
    if (!timeStr) return defaultTime;
    try {
      if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return timeStr;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch {
      return defaultTime;
    }
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        const token = localStorage.getItem('token');

        // Fetch booking details
        const bookingResponse = await fetch(`${API_URL}/api/v1/reservations/${bookingId}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (!bookingResponse.ok) {
          throw new Error('Failed to fetch booking details');
        }

        const bookingData = await bookingResponse.json();
        setBooking(bookingData);

        // Fetch room type details if needed (data should already be in booking.room.room_type)
        if (bookingData.room?.room_type) {
          setRoomType(bookingData.room.room_type);
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Unable to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    if (!isLoading && roomType) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [isLoading, roomType]);

  if (isLoading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Skeleton height="400px" width="100%" className="rounded-4" />
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
          <Card className="border-0 shadow-lg rounded-4 p-5">
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
  const totalAmount = booking.total_amount || (roomType?.price * nights);

  return (
    <>
      <Header />
      <main className="py-5 min-vh-100 bg-body-tertiary bg-opacity-25 pb-9">
        <Container>
          {/* Success Header */}
          <div className="text-center mb-5 animate__animated animate__fadeIn">
            <div className="mb-4 position-relative d-inline-block">
              <BsCheckCircleFill size={100} className="text-success shadow-lg rounded-circle" />
              <div className="position-absolute top-50 start-50 translate-middle w-100 h-100 bg-success bg-opacity-10 rounded-circle animate-ping" style={{ zIndex: -1 }}></div>
            </div>
            <h1 className="display-4 fw-bold mb-2 text-body-emphasis">Booking Confirmed!</h1>
            <p className="lead text-body-secondary mx-auto" style={{ maxWidth: '600px' }}>
              We're excited to host you at <strong className="text-body-emphasis">{roomType?.business?.name}</strong>. A copy of your reservation has been sent to your email.
            </p>
          </div>

          <Row className="g-4 justify-content-center">
            {/* Main Receipt Column */}
            <Col lg={7} className="print-card" ref={componentRef}>
              <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4 bg-body">
                {/* Ticket Header */}
                <div className="bg-primary bg-gradient p-4 text-white">
                  <Row className="align-items-center">
                    <Col>
                      <span className="text-white-50 small text-uppercase fw-bold ls-1">Reservation Number</span>
                      <h3 className="mb-0 text-white font-monospace">{displayBookingId}</h3>
                    </Col>
                    <Col xs="auto" className="d-flex gap-2 no-print">
                      <Button
                        variant="white"
                        size="sm"
                        className="btn-light-soft bg-white bg-opacity-25 border-0 text-white rounded-circle p-2 flex-centered"
                        title="Print Receipt"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => handlePrint()}
                      >
                        <BsPrinter size={18} />
                      </Button>
                      <Button
                        variant="white"
                        size="sm"
                        className="btn-light-soft bg-white bg-opacity-25 border-0 text-white rounded-circle p-2 flex-centered"
                        title="Download PDF"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => handlePrint()}
                      >
                        <BsDownload size={18} />
                      </Button>
                    </Col>
                  </Row>
                </div>

                <Card.Body className="p-4 p-md-5">
                  {/* Property Info */}
                  <div className="d-flex align-items-center mb-5">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary flex-centered">
                        <BsHouse size={32} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h4 className="mb-1 text-body-emphasis fw-bold">{roomType?.business?.name}</h4>
                      <p className="mb-0 text-body-secondary small">
                        {roomType?.business?.address}, {roomType?.business?.city}, {roomType?.business?.state}
                      </p>
                    </div>
                  </div>

                  {/* Stay Details Grid */}
                  <div className="bg-body-tertiary p-4 rounded-4 mb-5 border-start border-primary border-4 shadow-sm">
                    <Row className="g-4 text-center text-md-start">
                      <Col xs={6} md={4}>
                        <h6 className="text-uppercase small fw-bold text-primary mb-2" style={{ letterSpacing: '0.5px' }}>Check-in</h6>
                        <p className="h6 mb-1 text-body fw-bold">{displayCheckIn}</p>
                        <small className="text-primary fw-bold text-uppercase">{formatTime(roomType?.business?.check_in, '2:00 PM')}</small>
                      </Col>
                      <Col xs={6} md={4}>
                        <h6 className="text-uppercase small fw-bold text-primary mb-2" style={{ letterSpacing: '0.5px' }}>Check-out</h6>
                        <p className="h6 mb-1 text-body fw-bold">{displayCheckOut}</p>
                        <small className="text-primary fw-bold text-uppercase">{formatTime(roomType?.business?.check_out, '11:00 AM')}</small>
                      </Col>
                      <Col xs={12} md={4}>
                        <h6 className="text-uppercase small fw-bold text-primary mb-2" style={{ letterSpacing: '0.5px' }}>Stay Duration</h6>
                        <p className="h6 mb-1 text-body fw-bold">{nights} {nights > 1 ? 'Nights' : 'Night'}</p>
                        <small className="text-body-secondary fw-semibold">Abri Managed Stay</small>
                      </Col>
                    </Row>
                  </div>

                  {/* Room & Payment */}
                  <div className="mb-5">
                    <h6 className="text-uppercase small text-body-secondary mb-3 border-bottom pb-2 fw-bold" style={{ letterSpacing: '1px' }}>Booking Summary</h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-body-emphasis">{roomType?.name}</span>
                      <span className="text-body fw-semibold small">₦{roomType?.price?.toLocaleString()} / night</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-body-secondary fw-medium small">Number of Rooms</span>
                      <span className="text-body fw-semibold small">×{booking.room ? 1 : 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-body-secondary fw-medium small">Guests</span>
                      <span className="text-body fw-semibold small">{booking.guests || 0} Adults{booking.children > 0 ? `, ${booking.children} Children` : ''}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25">
                      <h5 className="mb-0 text-body-emphasis fw-bold">Total Amount Paid</h5>
                      <h4 className="mb-0 text-primary fw-bold">₦{totalAmount?.toLocaleString()}</h4>
                    </div>
                    <p className="text-end small text-body-secondary mt-2 font-italic">
                      {booking.payment_method === 0 ? 'Paid via Card Payment' : 'Payment Method Recorded'}
                    </p>
                  </div>

                  {/* Amenities Quick View */}
                  {roomType?.amenities && (
                    <div className="mb-0">
                      <h6 className="text-uppercase small text-body-secondary mb-3 fw-bold">Your Included Perks</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {Object.entries(roomType.amenities)
                          .filter(([_, value]) => value === true)
                          .slice(0, 8)
                          .map(([key], index) => (
                            <span key={index} className="badge bg-body-secondary text-body-emphasis border border-secondary border-opacity-25 px-3 py-2 fw-medium shadow-sm">
                              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </Card.Body>

                {/* Perforated edge look - dynamically matches background */}
                <div className="perforated-edge d-flex w-100 px-3 overflow-hidden" style={{ marginTop: '-12px', marginBottom: '-12px', gap: '8px' }}>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="perforated-hole rounded-circle flex-shrink-0" style={{ width: '20px', height: '20px', border: '1px solid rgba(0,0,0,0.05)' }}></div>
                  ))}
                </div>
              </Card>
            </Col>

            {/* What's Next Column */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-body">
                <Card.Header className="bg-dark text-white p-4 border-0">
                  <h5 className="mb-0 text-white">Stay Preparation</h5>
                  <p className="small text-white-50 mb-0 opacity-75">Useful tips for your arrival</p>
                </Card.Header>
                <Card.Body className="p-4">
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex mb-4">
                      <div className="bg-success bg-opacity-25 text-success rounded-circle flex-centered small fw-bold" style={{ width: '32px', height: '32px', minWidth: '32px' }}>1</div>
                      <div className="ms-3 flex-grow-1">
                        <h6 className="mb-1 text-body-emphasis fw-bold">Verify your Email</h6>
                        <p className="small text-body-secondary mb-0">Check your inbox for a detailed check-in guide and digital key instructions.</p>
                      </div>
                    </li>
                    <li className="d-flex mb-4">
                      <div className="bg-primary bg-opacity-25 text-primary rounded-circle flex-centered small fw-bold" style={{ width: '32px', height: '32px', minWidth: '32px' }}>2</div>
                      <div className="ms-3 flex-grow-1">
                        <h6 className="mb-1 text-body-emphasis fw-bold">Identity Verification</h6>
                        <p className="small text-body-secondary mb-0">Bring a valid government ID. It's required for verification at the hotel reception.</p>
                      </div>
                    </li>
                    <li className="d-flex mb-4">
                      <div className="bg-primary bg-opacity-25 text-primary rounded-circle flex-centered small fw-bold" style={{ width: '32px', height: '32px', minWidth: '32px' }}>3</div>
                      <div className="ms-3 flex-grow-1">
                        <h6 className="mb-1 text-body-emphasis fw-bold">Keep ID Accessible</h6>
                        <p className="small text-body-secondary mb-0">Your Booking ID is <strong>{displayBookingId}</strong>. We recommend taking a screenshot for offline use.</p>
                      </div>
                    </li>
                  </ul>

                  <div className="bg-warning bg-opacity-10 border border-warning border-opacity-25 p-3 rounded-3 mt-2 shadow-sm">
                    <p className="small mb-0 text-warning-emphasis fw-medium">
                      <strong>Support?</strong> Reach out 24/7 if you have any questions before you arrive.
                    </p>
                  </div>

                  <div className="mt-5 vstack gap-2">
                    <Link href="/">
                      <Button variant="primary" className="w-100 py-3 rounded-3 shadow-sm">Explore More Places</Button>
                    </Link>
                    <Link href={`/hotel/${hotelSlug}`}>
                      <Button variant="outline-primary" className="w-100 py-3 rounded-3">View Host Contact</Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
      <Footer />
      <style jsx>{`
        .ls-1 { letter-spacing: 1px; }
        .flex-centered { display: flex; align-items: center; justify-content: center; }
        .perforated-hole {
          background-color: var(--bs-body-tertiary);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }

        @media print {
          @page {
            margin: 0.5cm;
            size: auto;
          }
          /* Hide everything */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the card and its content */
          .print-card, .print-card * {
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
          /* Specifically hide action buttons from the printed version */
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          /* Ensure colors and cards look professional on paper */
          .card {
            border: 1px solid #eee !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
            margin: 0 auto !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .bg-primary {
            background-color: #4f46e5 !important;
            background-image: linear-gradient(to bottom right, #4f46e5, #4338ca) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .perforated-edge {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </>
  );
}
