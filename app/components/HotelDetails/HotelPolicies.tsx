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

const HotelPolicies = () => {
  return (
    <Card className="bg-transparent border-0">
      <CardHeader className="border-bottom bg-transparent px-0 pt-0">
        <h3 className="mb-0">Hotel Policies</h3>
      </CardHeader>
      <CardBody className="pt-4 p-0">
        <ul className="list-group list-group-borderless mb-2">
          <li className="list-group-item d-flex align-items-start">
            <BsCheckCircleFill className=" me-2 text-success mt-1" />
            This is a family farmhouse, hence we request you to not indulge.
          </li>
          <li className="list-group-item d-flex align-items-start">
            <BsCheckCircleFill className=" me-2 text-success mt-1" />
            Drinking and smoking within controlled limits are permitted at the farmhouse but please do not create a mess or ruckus at the house.
          </li>
          <li className="list-group-item d-flex align-items-start">
            <BsCheckCircleFill className=" me-2 text-success mt-1" />
            Drugs and intoxicating illegal products are banned and not to be brought to the house or consumed.
          </li>
          <li className="list-group-item d-flex align-items-start">
            <BsXCircleFill className=" me-2 text-danger mt-1" />
            For any update, the customer shall pay applicable cancellation/modification charges.
          </li>
        </ul>
        <ul className="list-group list-group-borderless mb-2">
          {policies.map((item, idx) => (
            <li key={idx} className="list-group-item h6 fw-light mb-0 items-center">
              <BsArrowRight className=" me-2" />
              {item}
            </li>
          ))}
        </ul>
        <div className="bg-danger bg-opacity-10 rounded-2 p-3 mb-3">
          <p className="mb-0 text-danger">
            During the COVID-19 pandemic, all hosts and guests must review and follow Booking social distancing and other COVID-19-related guidelines.
          </p>
        </div>
        <div className="bg-danger bg-opacity-10 rounded-2 p-3">
          <p className="mb-0 text-danger">
            Smoke alarm not reported — The host hasn't reported a smoke alarm on the property. We suggest bringing a portable detector for your trip.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default HotelPolicies;
