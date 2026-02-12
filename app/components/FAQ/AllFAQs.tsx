'use client';

import { Col, Container, Row } from 'react-bootstrap';
import Booking from './Booking';
import Cancellation from './Cancellation';
import Payment from './Payment';

const AllFAQs = () => {
  return (
    <section className="pt-0">
      <Container>
        <Row>
          <Col xl={10} className="mx-auto">
            <div className="vstack gap-4">
              <Booking />
              <Cancellation />
              <Payment />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AllFAQs;
