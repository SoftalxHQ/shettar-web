'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Col, Container, Row, Image } from 'react-bootstrap';
import { BsCheckCircleFill, BsCalendarCheck, BsHouse, BsDownload, BsPrinter } from 'react-icons/bs';
import { Header } from '@/app/components';
import Footer from '@/app/components/Footer';
import { Skeleton } from '@/app/components';
import confetti from 'canvas-confetti';

export default function BookingConfirmedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;

  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const [roomType, setRoomType] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const displayCheckIn = formatDate(startDate, '4 March 2026');
  const displayCheckOut = formatDate(endDate, '8 March 2026');

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
    const fetchRoomDetail = async () => {
      if (!hotelSlug || !roomSlug) return;
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        const response = await fetch(`${API_URL}/api/v1/businesses/${hotelSlug}/room_types/${roomSlug}`);
        if (response.ok) {
          const data = await response.json();
          setRoomType(data);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomDetail();
  }, [hotelSlug, roomSlug]);

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

  const bookingId = "ABR-" + Math.random().toString(36).substring(2, 8).toUpperCase();

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
            <Col lg={7}>
              <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4 bg-body">
                {/* Ticket Header */}
                <div className="bg-primary bg-gradient p-4 text-white">
                  <Row className="align-items-center">
                    <Col>
                      <span className="text-white-50 small text-uppercase fw-bold ls-1">Reservation Number</span>
                      <h3 className="mb-0 text-white font-monospace">{bookingId}</h3>
                    </Col>
                    <Col xs="auto" className="d-flex gap-2">
                      <Button variant="white" size="sm" className="btn-light-soft bg-white bg-opacity-25 border-0 text-white rounded-circle p-2 flex-centered" title="Print Receipt" style={{ width: '40px', height: '40px' }}>
                        <BsPrinter size={18} />
                      </Button>
                      <Button variant="white" size="sm" className="btn-light-soft bg-white bg-opacity-25 border-0 text-white rounded-circle p-2 flex-centered" title="Download PDF" style={{ width: '40px', height: '40px' }}>
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
                      <span className="text-body-secondary fw-medium small">Service Charge & Tax (5%)</span>
                      <span className="text-body fw-semibold small">₦{(roomType?.price * 0.05 * nights).toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25">
                      <h5 className="mb-0 text-body-emphasis fw-bold">Total Amount</h5>
                      <h4 className="mb-0 text-primary fw-bold">₦{(roomType?.price * 1.05 * nights).toLocaleString()}</h4>
                    </div>
                    <p className="text-end small text-body-secondary mt-2 font-italic">Paid securely via Card Payment</p>
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
                        <p className="small text-body-secondary mb-0">Your Booking ID is <strong>{bookingId}</strong>. We recommend taking a screenshot for offline use.</p>
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
      `}</style>
    </>
  );
}
