'use client';

import { Container, Row, Col, Form, Button } from 'react-bootstrap';

export default function Hero() {
  return (
    <section className="pt-0">
      <Container>
        <div
          className="rounded-3 p-3 p-sm-5"
          style={{
            backgroundImage: `url(/images/bg/05.jpg)`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <Row className="my-2 my-xl-5">
            <Col md={8} className="mx-auto">
              <h1 className="text-center text-white">150 Hotels in New York</h1>
            </Col>
          </Row>

          {/* Search Form */}
          <Form className="bg-mode shadow rounded-3 p-4">
            <Row className="g-4 align-items-center">
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label className="h6 fw-normal mb-0">
                    <i className="bi bi-geo-alt me-1"></i>Location
                  </Form.Label>
                  <Form.Control
                    size="lg"
                    type="text"
                    placeholder="Enter location"
                    defaultValue="New York"
                  />
                </Form.Group>
              </Col>

              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label className="h6 fw-normal mb-0">
                    <i className="bi bi-calendar me-1"></i>Check in
                  </Form.Label>
                  <Form.Control size="lg" type="date" />
                </Form.Group>
              </Col>

              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label className="h6 fw-normal mb-0">
                    <i className="bi bi-calendar me-1"></i>Check out
                  </Form.Label>
                  <Form.Control size="lg" type="date" />
                </Form.Group>
              </Col>

              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label className="h6 fw-normal mb-0">
                    <i className="bi bi-person me-1"></i>Guests & rooms
                  </Form.Label>
                  <Form.Select size="lg">
                    <option>1 room 2 Guests</option>
                    <option>2 room 4 Guests</option>
                    <option>3 room 6 Guests</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col lg={2} className="d-grid">
                <Button variant="primary" size="lg" className="mb02">
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Container>
    </section>
  );
}
