'use client';

import { Button, Card, CardBody, CardHeader, Col, Row, Badge } from 'react-bootstrap';
import { currency } from '@/app/states';
import { BsBuilding, BsCalendar2Check, BsGeoAlt, BsInfoCircle } from 'react-icons/bs';

import Link from 'next/link';

interface Reservation {
  id: number;
  booking_id: string;
  start_date: string;
  end_date: string;
  total_amount: string | number;
  cancelled: boolean;
  business?: {
    name: string;
    address: string;
    slug: string;
    check_in: string;
    check_out: string;
  };
  room?: {
    room_type: {
      name: string;
    }
  };
}

const BookingCard = ({ booking }: { booking: Reservation }) => {
  const { booking_id, start_date, end_date, total_amount, cancelled, business, room } = booking;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="border mb-4 shadow-sm">
      <CardHeader className="border-bottom d-md-flex justify-content-md-between align-items-center bg-transparent">
        <div className="d-flex align-items-center">
          <div className="icon-lg bg-primary bg-opacity-10 text-primary rounded-circle flex-shrink-0 flex-centered">
            <BsBuilding size={24} />
          </div>

          <div className="ms-3">
            <h6 className="card-title mb-1">{business?.name || 'Hotel Name'}</h6>
            <div className="small text-secondary d-flex align-items-center">
              <BsGeoAlt className="me-1" /> {business?.address || 'Address not available'}
            </div>
            <ul className="nav nav-divider small mt-1">
              <li className="nav-item">Booking ID: <span className="text-dark fw-bold">{booking_id}</span></li>
              <li className="nav-item">{room?.room_type?.name || 'Standard Room'}</li>
            </ul>
          </div>
        </div>

        <div className="mt-3 mt-md-0 text-md-end">
          {cancelled ? (
            <Badge bg="danger" className="bg-opacity-10 text-danger mb-2 d-block">Cancelled</Badge>
          ) : (
            <Badge bg="success" className="bg-opacity-10 text-success mb-2 d-block">Confirmed</Badge>
          )}
          <h5 className="mb-0 text-primary">{currency}{Number(total_amount).toLocaleString()}</h5>
        </div>
      </CardHeader>

      <CardBody>
        <Row className="g-3">
          <Col sm={6} md={3}>
            <div className="d-flex align-items-center">
              <BsCalendar2Check className="text-secondary me-2" />
              <div>
                <span className="small text-secondary d-block">Check-in</span>
                <h6 className="mb-0">{formatDate(start_date)}</h6>
                <span className="small text-muted text-uppercase">{business?.check_in}</span>
              </div>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="d-flex align-items-center">
              <BsCalendar2Check className="text-secondary me-2" />
              <div>
                <span className="small text-secondary d-block">Check-out</span>
                <h6 className="mb-0">{formatDate(end_date)}</h6>
                <span className="small text-muted text-uppercase">{business?.check_out}</span>
              </div>
            </div>
          </Col>
          <Col sm={12} md={6} className="text-md-end align-self-center">
            {business?.slug && (
              <Link href={`/hotel/${business.slug}`} passHref>
                <Button variant="outline-primary" size="sm" className="mb-0">
                  <BsInfoCircle className="me-1" /> View Details
                </Button>
              </Link>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default BookingCard;
