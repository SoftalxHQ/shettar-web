'use client';

import { Card, CardBody, CardFooter, CardHeader, CardTitle } from 'react-bootstrap';

const currency = '$';

const PriceSummary = () => {
  return (
    <Card className="shadow rounded-2">
      <CardHeader className="border-bottom bg-transparent">
        <CardTitle as="h5" className="mb-0">
          Price Summary
        </CardTitle>
      </CardHeader>
      <CardBody>
        <ul className="list-group list-group-borderless">
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span className="h6 fw-light mb-0">Room Charges</span>
            <span className="fs-5">{currency}28,660</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span className="h6 fw-light mb-0">
              Total Discount<span className="badge text-bg-danger smaller mb-0 ms-2">10% off</span>
            </span>
            <span className="fs-5 text-success">-{currency}2,560</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span className="h6 fw-light mb-0">Price after discount</span>
            <span className="fs-5">{currency}1852</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span className="h6 fw-light mb-0">Taxes % Fees</span>
            <span className="fs-5">{currency}350</span>
          </li>
        </ul>
      </CardBody>
      <CardFooter className="border-top bg-transparent">
        <div className="d-flex justify-content-between align-items-center font-bold">
          <span className="h5 mb-0">Payable Now</span>
          <span className="h5 mb-0">{currency}22,500</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PriceSummary;
