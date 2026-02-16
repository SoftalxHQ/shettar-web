'use client';

import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const currency = '₦';
const currentYear = new Date().getFullYear();

const parseDateFromLocalISO = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const PriceSummary = ({ room, hotel }: { room: any, hotel: any }) => {
  const searchParams = useSearchParams();
  const start_date_str = searchParams.get('start_date');
  const end_date_str = searchParams.get('end_date');

  const start_date = start_date_str ? parseDateFromLocalISO(start_date_str) : new Date();
  const end_date = end_date_str ? parseDateFromLocalISO(end_date_str) : new Date(Date.now() + 24 * 60 * 60 * 1000);

  const rooms_str = searchParams.get('rooms');
  const rooms = rooms_str ? parseInt(rooms_str) : 1;

  const diffTime = Math.abs(end_date.getTime() - start_date.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const checkIn = start_date_str ? formatDate(start_date) : "Today";
  const checkOut = end_date_str ? formatDate(end_date) : "Tomorrow";

  const price = room?.price || 0;
  const subtotal = price * nights;
  const total = subtotal * rooms;

  const availableRoomsCount = room?.available_rooms ?? 0;
  const isAvailable = rooms <= availableRoomsCount;

  return (
    <Col as={'aside'} lg={5}>
      <div className="sticky-top" style={{ top: '100px', zIndex: 1 }}>
        <Card className="bg-transparent border">
          <CardHeader className="bg-transparent border-bottom">
            <h4 className="card-title mb-0">Price Summary</h4>
          </CardHeader>
          <CardBody>
            <Row className="g-4 mb-3">
              <Col md={6}>
                <div className="bg-light py-3 px-4 rounded-3">
                  <h6 className="fw-light small mb-1">Check-in</h6>
                  <h6 className="mb-0">{checkIn}</h6>
                </div>
              </Col>
              <Col md={6}>
                <div className="bg-light py-3 px-4 rounded-3">
                  <h6 className="fw-light small mb-1">Check out</h6>
                  <h6 className="mb-0">{checkOut}</h6>
                </div>
              </Col>
            </Row>
            <ul className="list-group list-group-borderless mb-3">
              <li className="list-group-item px-2 d-flex justify-content-between">
                <span className="h6 fw-light mb-0">{currency}{price.toLocaleString()} x {nights} Night{nights > 1 ? 's' : ''}</span>
                <span className="h6 fw-light mb-0">{currency}{subtotal.toLocaleString()}</span>
              </li>
              {rooms > 1 && (
                <li className="list-group-item px-2 d-flex justify-content-between pt-0">
                  <span className="h6 fw-light mb-0">Number of Rooms</span>
                  <span className="h6 fw-light mb-0">x {rooms}</span>
                </li>
              )}
              <li className="list-group-item bg-light d-flex justify-content-between rounded-2 px-2 mt-2">
                <span className="h5 fw-normal mb-0 ps-1">Total</span>
                <span className="h5 fw-normal mb-0">{currency}{total.toLocaleString()}</span>
              </li>
            </ul>

            {!isAvailable && (
              <div className="alert alert-danger px-2 py-2 mb-3 small" role="alert">
                Only {availableRoomsCount} rooms available for the selected dates. Please reduce the number of rooms.
              </div>
            )}

            <div className="d-grid gap-2">
              {isAvailable ? (
                <Link href={`/hotel/${hotel?.slug}/roomtype/${room?.slug || room?.id}/booking${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}>
                  <Button variant="dark" className="mb-0 w-100">
                    Continue To Book
                  </Button>
                </Link>
              ) : (
                <Button variant="dark" className="mb-0 w-100" disabled>
                  Continue To Book
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </Col>
  );
};

export default PriceSummary;
