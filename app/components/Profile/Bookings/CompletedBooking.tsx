'use client';

import { Col, Image, Row } from 'react-bootstrap';
import Link from 'next/link';

const CompletedBooking = () => {
  return (
    <div className="bg-mode shadow p-4 rounded overflow-hidden border">
      <Row className="g-4 align-items-center">
        <Col md={9}>
          <h6 className="text-dark">Looks like you have never booked with BOOKING</h6>
          <h4 className="mb-2 text-dark">When you book your trip will be shown here.</h4>
          <Link href="/hotels/list" className="btn btn-primary-soft mb-0">
            Start booking now
          </Link>
        </Col>

        <Col md={3} className="text-end">
          <Image src="/images/element/17.svg" className="mb-n5" alt="element" width={100} height={100} />
        </Col>
      </Row>
    </div>
  );
};

export default CompletedBooking;
