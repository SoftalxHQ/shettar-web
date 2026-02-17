'use client';

import { CheckFormInput, SelectFormInput, TextFormInput } from '@/app/components';
import { Alert, Button, Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { BsPeopleFill } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa6';
import Link from 'next/link';
import { useLayoutContext } from '@/app/states';

const SpecialRequest = ['Smoking room', 'Late check-in', 'Early check-in', 'Room on a high floor', 'Large bed', 'Airport transfer', 'Twin beds'];

const GuestDetails = () => {
  const { control } = useForm();
  const { isAuthenticated } = useLayoutContext();
  return (
    <Card className="shadow">
      <CardHeader className="card-header border-bottom p-4 bg-transparent">
        <h4 className="card-title mb-0 items-center">
          <BsPeopleFill className=" me-2" />
          Guest Details
        </h4>
      </CardHeader>
      <CardBody className="p-4">
        <form className="row g-4">
          <Col xs={12}>
            <div className="bg-light rounded-2 px-4 py-3 border-start border-primary border-4">
              <h6 className="mb-0">Main Guest Information</h6>
            </div>
          </Col>

          <TextFormInput
            name="firstName"
            type="text"
            label="First Name"
            control={control}
            placeholder="Enter first name"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="lastName"
            label="Last Name"
            type="text"
            control={control}
            placeholder="Enter last name"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="email"
            label="Email Address"
            type="email"
            control={control}
            placeholder="Enter email address"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="mobileNo"
            label="Phone Number"
            type="text"
            control={control}
            placeholder="Enter phone number"
            className="form-control-lg"
            containerClass="col-md-6"
          />

          <Col xs={12} className="mt-5">
            <div className="bg-light rounded-2 px-4 py-3 border-start border-danger border-4">
              <h6 className="mb-0">Emergency Contact</h6>
            </div>
          </Col>

          <TextFormInput
            name="emerFirstName"
            type="text"
            label="First Name"
            control={control}
            placeholder="Emergency contact first name"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="emerLastName"
            label="Last Name"
            type="text"
            control={control}
            placeholder="Emergency contact last name"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="emerPhone"
            label="Phone Number"
            type="text"
            control={control}
            placeholder="Emergency contact phone"
            className="form-control-lg"
            containerClass="col-md-12"
          />
        </form>

        {!isAuthenticated && (
          <Alert variant="warning" className="mt-4 mb-3 border-2" role="alert">
            <h6 className="alert-heading">Notice: Guest Booking Policy</h6>
            <p className="mb-0 small fw-bold text-dark">
              Please note that bookings made without an account are <strong>not eligible for refund or cancellation</strong>.
              To enjoy flexible booking options, please sign in or create an account before proceeding.
            </p>
          </Alert>
        )}

        <Alert variant="info" className="mt-0 mb-0" role="alert">
          Already have an account? {' '}
          <Link href="/auth/sign-in" className="alert-heading h6 text-decoration-none">
            Sign In
          </Link>{' '}
          to prefill details and earn rewards.
        </Alert>
      </CardBody>
    </Card>
  );
};

export default GuestDetails;
