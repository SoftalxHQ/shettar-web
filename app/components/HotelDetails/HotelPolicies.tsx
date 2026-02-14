'use client';

import { Card, CardBody, CardHeader } from 'react-bootstrap';
import { BsArrowRight, BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';

const policies = [
  'Check-in: 1:00 pm - 9:00 pm',
  'Check out: 11:00 am',
  'Self-check-in with building staff',
  'No pets',
  'No parties or events',
  'Smoking is allowed',
];

const HotelPolicies = ({ checkIn, checkOut }: { checkIn: string, checkOut: string }) => {
  const dynamicPolicies = [
    `Check-in: ${checkIn || '12:00 PM'}`,
    `Check out: ${checkOut || '11:00 AM'}`,
    'Self-check-in with building staff',
    'No pets',
    'No parties or events',
    'Smoking is allowed in designated areas',
  ];

  return (
    <Card className="bg-transparent border-0">
      <CardHeader className="border-bottom bg-transparent px-0 pt-0">
        <h3 className="mb-0">Hotel Policies</h3>
      </CardHeader>
      <CardBody className="pt-4 p-0">
        <ul className="list-group list-group-borderless mb-2">
          <li className="list-group-item d-flex align-items-start">
            <BsCheckCircleFill className=" me-2 text-success mt-1" />
            Proper identification is required at the time of check-in.
          </li>
          <li className="list-group-item d-flex align-items-start">
            <BsCheckCircleFill className=" me-2 text-success mt-1" />
            Guests are requested to maintain a peaceful environment.
          </li>
          <li className="list-group-item d-flex align-items-start">
            <BsXCircleFill className=" me-2 text-danger mt-1" />
            Illegal products are strictly banned on the premises.
          </li>
        </ul>
        <ul className="list-group list-group-borderless mb-2">
          {dynamicPolicies.map((item, idx) => (
            <li key={idx} className="list-group-item h6 fw-light mb-0 items-center">
              <BsArrowRight className=" me-2 text-primary" />
              {item}
            </li>
          ))}
        </ul>
        <div className="bg-body-tertiary rounded-2 p-3 mb-3 border">
          <p className="mb-0 small opacity-50">
            The hotel reserves the right of admission. Please review all terms before booking.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default HotelPolicies;
