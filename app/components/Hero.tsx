'use client';

import { Col, Container, Row } from 'react-bootstrap';
import AvailabilityFilter from './AvailabilityFilter';
import { useLayoutContext } from '../states/useLayoutContext';

const Hero = () => {
  const { hotelCount, hotelLocation } = useLayoutContext();

  const title = (hotelCount !== null && hotelLocation)
    ? `${hotelCount} Hotels in ${hotelLocation}`
    : 'Find Your Perfect Getaway';

  return (
    <section className="pt-0">
      <Container>
        <div
          className="rounded-3 p-3 p-sm-5"
          style={{ backgroundImage: `url(/images/bg/05.jpg)`, backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
        >
          <Row className="row my-2 my-xl-5">
            <Col md={8} className="mx-auto">
              <h2 className="text-center text-white">{title}</h2>
            </Col>
          </Row>

          <AvailabilityFilter />
        </div>
      </Container>
    </section>
  );
};

export default Hero;
