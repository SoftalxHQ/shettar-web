'use client';

import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import Link from 'next/link';

const currency = '₦';
const currentYear = new Date().getFullYear();

const PriceSummary = ({ room, hotel }: { room: any, hotel: any }) => {
  const price = room?.price || 0;
  const nights = 1; // Default
  const total = price * nights;

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
                  <h6 className="mb-0">Today</h6>
                </div>
              </Col>
              <Col md={6}>
                <div className="bg-light py-3 px-4 rounded-3">
                  <h6 className="fw-light small mb-1">Check out</h6>
                  <h6 className="mb-0">Tomorrow</h6>
                </div>
              </Col>
            </Row>
            <ul className="list-group list-group-borderless mb-3">
              <li className="list-group-item px-2 d-flex justify-content-between">
                <span className="h6 fw-light mb-0">{currency}{price.toLocaleString()} x {nights} Night{nights > 1 ? 's' : ''}</span>
                <span className="h6 fw-light mb-0">{currency}{total.toLocaleString()}</span>
              </li>
              <li className="list-group-item bg-light d-flex justify-content-between rounded-2 px-2 mt-2">
                <span className="h5 fw-normal mb-0 ps-1">Total</span>
                <span className="h5 fw-normal mb-0">{currency}{total.toLocaleString()}</span>
              </li>
            </ul>
            <div className="d-grid gap-2">
              <Link href={`/hotel/${hotel?.slug}/roomtype/${room?.slug || room?.id}/booking`}>
                <Button variant="dark" className="mb-0 w-100">
                  Continue To Book
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </Col>
  );
};

export default PriceSummary;
