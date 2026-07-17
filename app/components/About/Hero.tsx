'use client';

import { Col, Container, Image, Row } from 'react-bootstrap';

const Hero = () => {
  return (
    <section>
      <Container>
        <Row className="mb-5">
          <Col xl={10} className="mx-auto text-center">
            <h1>Find and Book Your Perfect Stay, Anywhere in Nigeria</h1>
            <p className="lead">
              Shettar is the easiest way to discover verified hotels and stays, pay securely with your wallet or card, and
              get instant confirmation — all from one place.
            </p>
            <div className="hstack gap-3 flex-wrap justify-content-center">
              <h6 className="bg-mode shadow rounded-2 fw-normal py-2 px-4 d-flex align-items-center gap-1">
                <Image src="/images/element/06.svg" className="h-20px me-2" alt="element" />
                Verified Hotels & Stays
              </h6>
              <h6 className="bg-mode shadow rounded-2 fw-normal py-2 px-4 d-flex align-items-center gap-1">
                <Image src="/images/element/07.svg" className="h-20px me-2" alt="element" />
                Secure Wallet & Card Payments
              </h6>
              <h6 className="bg-mode shadow rounded-2 fw-normal py-2 px-4 d-flex align-items-center gap-1">
                <Image src="/images/element/08.svg" className="h-20px me-2" alt="element" />
                Instant Booking Confirmation
              </h6>
            </div>
          </Col>
        </Row>
        <Row className="g-4 align-items-center">
          <Col md={6}>
            <Image src="/images/hotel/02.jpg" className="rounded-3 img-fluid" alt="about" />
          </Col>
          <Col md={6}>
            <Row className="g-4">
              <Col md={8}>
                <Image src="/images/hotel/03.jpg" className="rounded-3 img-fluid" alt="about" />
              </Col>
              <Col xs={12}>
                <Image src="/images/hotel/04.jpg" className="rounded-3 img-fluid" alt="about" />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;
