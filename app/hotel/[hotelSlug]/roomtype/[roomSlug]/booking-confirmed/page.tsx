'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Col, Container, Row, Image } from 'react-bootstrap';
import { BsCheckCircleFill, BsCalendarCheck, BsHouse, BsDownload, BsPrinter } from 'react-icons/bs';
import TopNavBar4 from '@/app/components/TopNavBar4';
import Footer from '@/app/components/Footer';
import { Skeleton } from '@/app/components';

export default function BookingConfirmedPage() {
  const params = useParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;

  const [roomType, setRoomType] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <TopNavBar4 />
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
      <TopNavBar4 />
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
                        <h6 className="mb-0">4 March 2026</h6>
                        <small className="opacity-50">{roomType?.business?.check_in || '12:00 PM'}</small>
                      </Col>
                      <Col sm={4} className="text-center border-end border-sm-0">
                        <BsCalendarCheck size={24} className="text-primary mb-2" />
                        <h6 className="fw-light small mb-1 opacity-75">Check-out</h6>
                        <h6 className="mb-0">8 March 2026</h6>
                        <small className="opacity-50">{roomType?.business?.check_out || '11:00 AM'}</small>
                      </Col>
                      <Col sm={4} className="text-center">
                        <BsHouse size={24} className="text-primary mb-2" />
                        <h6 className="fw-light small mb-1 opacity-75">Duration</h6>
                        <h6 className="mb-0">4 Nights</h6>
                        <small className="opacity-50">Total Stay</small>
                      </Col>
                    </Row>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top pt-4">
                    <div>
                      <h4 className="mb-0 text-primary">₦{(roomType?.price * 1.05 * 4).toLocaleString()}</h4>
                      <p className="small opacity-50 mb-0">Total amount paid via Wallet</p>
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
