'use client';

import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';

const currency = '$';
const currentYear = new Date().getFullYear();

const PriceSummary = () => {
  return (
    <Col as={'aside'} xl={5} className="d-none d-xl-block">
      <Card className="bg-transparent border">
        <CardHeader className="bg-transparent border-bottom">
          <h4 className="card-title mb-0">Price Summary</h4>
        </CardHeader>
        <CardBody>
          <Row className="g-4 mb-3">
            <Col md={6}>
              <div className="bg-light py-3 px-4 rounded-3">
                <h6 className="fw-light small mb-1">Check-in</h6>
                <h6 className="mb-0">4 March {currentYear}</h6>
              </div>
            </Col>
            <Col md={6}>
              <div className="bg-light py-3 px-4 rounded-3">
                <h6 className="fw-light small mb-1">Check out</h6>
                <h6 className="mb-0">8 March {currentYear}</h6>
              </div>
            </Col>
          </Row>
          <ul className="list-group list-group-borderless mb-3">
            <li className="list-group-item px-2 d-flex justify-content-between">
              <span className="h6 fw-light mb-0">{currency}6,100 x 2 Nights</span>
              <span className="h6 fw-light mb-0">{currency}13,200</span>
            </li>
            <li className="list-group-item px-2 d-flex justify-content-between">
              <span className="h6 fw-light mb-0">10% campaign discount</span>
              <span className="h6 fw-light mb-0">-{currency}500</span>
            </li>
            <li className="list-group-item px-2 d-flex justify-content-between">
              <span className="h6 fw-light mb-0">Services Fee</span>
              <span className="h6 fw-light mb-0">{currency}100</span>
            </li>
            <li className="list-group-item bg-light d-flex justify-content-between rounded-2 px-2 mt-2">
              <span className="h5 fw-normal mb-0 ps-1">Total</span>
              <span className="h5 fw-normal mb-0">{currency}13,500</span>
            </li>
          </ul>
          <div className="d-grid gap-2">
            <Button variant="dark" className="mb-0">
              Continue To Book
            </Button>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PriceSummary;
