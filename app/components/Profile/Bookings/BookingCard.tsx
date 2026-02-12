'use client';

import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { type BookingCardType } from '@/app/data/bookings';

const BookingCard = ({ booking }: { booking: BookingCardType }) => {
  const { flightType, timing, travelRoute, icon, id, cancelled } = booking;
  const Icon = icon;
  return (
    <Card className="border mb-4">
      <CardHeader className="border-bottom d-md-flex justify-content-md-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="icon-lg bg-light rounded-circle flex-shrink-0 flex-centered">
            <Icon className="text-primary" />
          </div>

          <div className="ms-2">
            <h6 className="card-title mb-0 text-dark">{travelRoute}</h6>
            <ul className="nav nav-divider small">
              <li className="nav-item text-dark">Booking ID:{id}</li>
              <li className="nav-item text-dark">{flightType}</li>
            </ul>
          </div>
        </div>

        <div className="mt-2 mt-md-0">
          <Button variant="primary-soft" className="mb-0">
            Manage Booking
          </Button>
          {cancelled && <p className="text-danger text-md-end mb-0">Booking cancelled</p>}
        </div>
      </CardHeader>

      <CardBody>
        <Row className="g-3">
          {timing.map((item, idx) => {
            return (
              <Col sm={6} md={4} key={idx}>
                <span className="text-dark small">{item.label}</span>
                <h6 className="mb-0 text-dark">{item.name}</h6>
              </Col>
            );
          })}
        </Row>
      </CardBody>
    </Card>
  );
};

export default BookingCard;
