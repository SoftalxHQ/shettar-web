'use client';

import { Col, Container, Row } from 'react-bootstrap';
import AvailabilityFilter from './AvailabilityFilter';

const Hero = () => {
  return (
    <section className="pt-0">
      <Container>
        <div
          className="rounded-3 p-3 p-sm-5"
          style={{ backgroundImage: `url(/images/bg/05.jpg)`, backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
        >
          <Row className="row my-2 my-xl-5">
            <Col md={8} className="mx-auto">
              <h1 className="text-center text-white">150 Hotels in New York</h1>
            </Col>
          </Row>

          <AvailabilityFilter />
        </div>
      </Container>
    </section>
  );
};

export default Hero;
