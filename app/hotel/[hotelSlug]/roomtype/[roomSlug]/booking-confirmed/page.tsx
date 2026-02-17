'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Col, Container, Row, Image } from 'react-bootstrap';
import { BsCheckCircleFill, BsCalendarCheck, BsHouse, BsDownload, BsPrinter } from 'react-icons/bs';
import { Header } from '@/app/components';
import Footer from '@/app/components/Footer';
import { Skeleton } from '@/app/components';

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
      <main className="py-5 min-vh-100">
        <Container>
          <div className="text-center mb-5">
            <div className="mb-4">
              <BsCheckCircleFill size={80} className="text-success shadow-sm rounded-circle" />
            </div>
            <h1 className="display-4 fw-bold">Booking Confirmed!</h1>
            <p className="lead opacity-75">Your stay at {roomType?.business?.name || 'the hotel'} is all set. We've sent a confirmation email to your inbox.</p>
          </div>

          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="border shadow-lg rounded-4 overflow-hidden mb-4">
                <div className="bg-primary p-4 text-white d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-white-50 small text-uppercase fw-bold opacity-75">Booking ID</span>
                    <h4 className="mb-0 text-white">{bookingId}</h4>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="light" size="sm" className="items-center px-3 btn-sm">
                      <BsPrinter className="me-2" /> Print
                    </Button>
                    <Button variant="light" size="sm" className="items-center px-3 btn-sm">
                      <BsDownload className="me-2" /> PDF
                    </Button>
                  </div>
                </div>

                <Card.Body className="p-4 p-md-5">
                  <Row className="g-4 mb-5">
                    <Col md={6}>
                      <h6 className="opacity-50 small text-uppercase mb-3 fw-bold">Hotel Details</h6>
                      <h5 className="mb-1">{roomType?.business?.name}</h5>
                      <p className="mb-0 opacity-75 small">{roomType?.business?.address}</p>
                      <p className="mb-0 opacity-75 small">{roomType?.business?.city}, {roomType?.business?.state}</p>
                    </Col>
                    <Col md={6} className="text-md-end">
                      <h6 className="opacity-50 small text-uppercase mb-3 fw-bold">Room Selection</h6>
                      <h5 className="mb-1">{roomType?.name}</h5>
                      <p className="mb-0 opacity-75 small">Standard Occupancy: 2 Guests</p>
                    </Col>
                  </Row>

                  <div className="bg-light p-4 rounded-4 mb-5 border">
                    <Row className="align-items-center g-4">
                      <Col sm={4} className="text-center border-end border-sm-0">
                        <BsCalendarCheck size={24} className="text-primary mb-2" />
                        <h6 className="fw-light small mb-1 opacity-75">Check-in</h6>
                        <h6 className="mb-0">{displayCheckIn}</h6>
                        <small className="opacity-50">{formatTime(roomType?.business?.check_in, '2:00 PM')}</small>
                      </Col>
                      <Col sm={4} className="text-center border-end border-sm-0">
                        <BsCalendarCheck size={24} className="text-primary mb-2" />
                        <h6 className="fw-light small mb-1 opacity-75">Check-out</h6>
                        <h6 className="mb-0">{displayCheckOut}</h6>
                        <small className="opacity-50">{formatTime(roomType?.business?.check_out, '11:00 AM')}</small>
                      </Col>
                      <Col sm={4} className="text-center">
                        <BsHouse size={24} className="text-primary mb-2" />
                        <h6 className="fw-light small mb-1 opacity-75">Duration</h6>
                        <h6 className="mb-0">{nights} {nights > 1 ? 'Nights' : 'Night'}</h6>
                        <small className="opacity-50">Total Stay</small>
                      </Col>
                    </Row>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top pt-4">
                    <div>
                      <h4 className="mb-0 text-primary">₦{(roomType?.price * 1.05 * nights).toLocaleString()}</h4>
                      <p className="small opacity-50 mb-0">Total amount paid via Card</p>
                    </div>
                    <Link href="/">
                      <Button variant="primary" className="px-4 py-2 rounded-pill shadow-sm">Back to Home</Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>

              <div className="text-center">
                <p className="opacity-50">Need help with your booking? <Link href="/contact" className="text-primary fw-bold text-decoration-none border-bottom">Contact Support</Link></p>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
      <Footer />
    </>
  );
}
