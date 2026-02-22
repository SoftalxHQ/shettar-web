'use client';

import { Card, CardBody, CardHeader } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa6';
import { useLayoutContext } from '@/app/states';

const LoginAdvantages = () => {
  const { isAuthenticated } = useLayoutContext();

  if (isAuthenticated) return null;

  return (
    <Card className="shadow">
      <CardHeader className="border-bottom bg-transparent">
        <h5 className="card-title mb-0 text-dark font-bold">Why Sign up or Log in</h5>
      </CardHeader>
      <CardBody>
        <ul className="list-group list-group-borderless">
          <li className="list-group-item d-flex mb-0 items-center">
            <FaCheck className="text-success me-2" />
            <span className="h6 fw-normal mb-0 text-dark">Get Access to Secret Deal</span>
          </li>
          <li className="list-group-item d-flex mb-0 items-center">
            <FaCheck className="text-success me-2" />
            <span className="h6 fw-normal mb-0 text-dark">Book Faster</span>
          </li>
          <li className="list-group-item d-flex mb-0 items-center">
            <FaCheck className="text-success me-2" />
            <span className="h6 fw-normal mb-0 text-dark">Manage Your Booking</span>
          </li>
        </ul>
      </CardBody>
    </Card>
  );
};

export default LoginAdvantages;
