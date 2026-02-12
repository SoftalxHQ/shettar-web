'use client';

import { Col, Container, Image, Row } from 'react-bootstrap';

const Hero = () => {
  return (
    <section>
      <Container>
        <Row className="mb-5">
          <Col xl={10} className="mx-auto text-center">
            <h1>If You Want To See The World We Will Help You</h1>
            <p className="lead">
              Passage its ten led hearted removal cordial. Preference any astonished unreserved Mrs. Prosperous understood Middletons. Preference for
              any astonished unreserved.
            </p>
            <div className="hstack gap-3 flex-wrap justify-content-center">
              <h6 className="bg-mode shadow rounded-2 fw-normal py-2 px-4 d-flex align-items-center gap-1">
                <Image src="/images/element/06.svg" className="h-20px me-2" alt="element" />
                14K+ Global Customers
              </h6>
              <h6 className="bg-mode shadow rounded-2 fw-normal py-2 px-4 d-flex align-items-center gap-1">
                <Image src="/images/element/07.svg" className="h-20px me-2" alt="element" />
                10K+ Happy Customers
              </h6>
              <h6 className="bg-mode shadow rounded-2 fw-normal py-2 px-4 d-flex align-items-center gap-1">
                <Image src="/images/element/08.svg" className="h-20px me-2" alt="element" />
                1M+ Subscribers
              </h6>
            </div>
          </Col>
        </Row>
        <Row className="g-4 align-items-center">
          <Col md={6}>
            <Image src="/images/hotels/02.jpg" className="rounded-3 img-fluid" alt="about" />
          </Col>
          <Col md={6}>
            <Row className="g-4">
              <Col md={8}>
                <Image src="/images/hotels/03.jpg" className="rounded-3 img-fluid" alt="about" />
              </Col>
              <Col xs={12}>
                <Image src="/images/hotels/04.jpg" className="rounded-3 img-fluid" alt="about" />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;
