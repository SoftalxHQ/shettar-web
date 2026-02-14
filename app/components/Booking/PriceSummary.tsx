'use client';

import { Card, CardBody, CardFooter, CardHeader, CardTitle } from 'react-bootstrap';

const currency = '₦';

const PriceSummary = ({ room, hotel }: { room: any, hotel: any }) => {
  const price = room?.price || 0;
  const nights = 1; // Default for now
  const roomCharges = price * nights;
  const discount = 0;
  const taxes = roomCharges * 0.05; // 5% tax example
  const total = roomCharges - discount + taxes;

  return (
    <Card className="shadow rounded-2 border-0">
      <CardHeader className="border-bottom bg-transparent p-4">
        <CardTitle as="h5" className="mb-0">
          Price Summary
        </CardTitle>
      </CardHeader>
      <CardBody className="p-4">
        <ul className="list-group list-group-borderless">
          <li className="list-group-item d-flex justify-content-between align-items-center px-0">
            <span className="h6 fw-light mb-0">Room Charges</span>
            <span className="h6 mb-0">{currency}{roomCharges.toLocaleString()}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center px-0">
            <span className="h6 fw-light mb-0">Total Discount</span>
            <span className="h6 mb-0 text-success">-{currency}{discount.toLocaleString()}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center px-0">
            <span className="h6 fw-light mb-0">Taxes &amp; Fees</span>
            <span className="h6 mb-0">{currency}{taxes.toLocaleString()}</span>
          </li>
        </ul>
      </CardBody>
      <CardFooter className="border-top bg-light p-4">
        <div className="d-flex justify-content-between align-items-center">
          <span className="h5 mb-0">Payable Now</span>
          <span className="h5 mb-0 text-primary">{currency}{total.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PriceSummary;
