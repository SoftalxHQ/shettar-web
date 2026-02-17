'use client';

import { Card, CardBody, CardFooter, CardHeader, CardTitle } from 'react-bootstrap';

const currency = '₦';

const PriceSummary = ({
  room,
  hotel,
  startDate,
  endDate
}: {
  room: any,
  hotel: any,
  startDate: string | null,
  endDate: string | null
}) => {
  const price = room?.price || 0;

  const calculateNights = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
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
      <CardFooter className="border-top bg-light bg-opacity-10 p-4">
        <div className="d-flex justify-content-between align-items-center">
          <span className="h5 mb-0 fw-bold">Payable Now</span>
          <span className="h5 mb-0 text-primary fw-bold">{currency}{total.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PriceSummary;
