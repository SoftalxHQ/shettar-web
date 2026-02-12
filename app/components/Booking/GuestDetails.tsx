'use client';

import { CheckFormInput, SelectFormInput, TextFormInput } from '@/app/components';
import { Alert, Button, Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { BsPeopleFill } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa6';
import Link from 'next/link';

const SpecialRequest = ['Smoking room', 'Late check-in', 'Early check-in', 'Room on a high floor', 'Large bed', 'Airport transfer', 'Twin beds'];

const GuestDetails = () => {
  const { control } = useForm();
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
            <div className="bg-light rounded-2 px-4 py-3">
              <h6 className="mb-0">Main Guest</h6>
            </div>
          </Col>
          <Col md={2}>
            <div className="form-size-lg">
              <label className="form-label text-dark">Title</label>
              <SelectFormInput className="form-select js-choice">
                <option value={-1}>Title</option>
                <option>Mr</option>
                <option>Mrs</option>
              </SelectFormInput>
            </div>
          </Col>
          <TextFormInput
            name="fName"
            type="text"
            label="First Name"
            control={control}
            placeholder="Enter your first name"
            className="form-control-lg"
            containerClass="col-md-5"
          />
          <TextFormInput
            name="lName"
            label="Last Name"
            type="text"
            control={control}
            placeholder="Enter your last name"
            className="form-control-lg"
            containerClass="col-md-5"
          />
          <Col xs={12}>
            <Button variant="link" className="mb-0 p-0 items-center">
              <FaPlus className="fa-solid me-2" />
              Add New Guest
            </Button>
          </Col>
          <Col md={6}>
            <TextFormInput name="email" label="Email id" type="text" control={control} placeholder="Enter your email" className="form-control-lg" />
            <div id="emailHelp" className="form-text">
              (Booking voucher will be sent to this email ID)
            </div>
          </Col>
          <TextFormInput
            name="mobileNo"
            label="Mobile number"
            type="text"
            control={control}
            placeholder="Enter your mobile number"
            className="form-control-lg"
            containerClass="col-md-6"
          />
        </form>
        <Alert variant="info" className="my-4" role="alert">
          <Link href="/auth/sign-up" className="alert-heading h6">
            Login
          </Link>{' '}
          to prefill all details and get access to secret deals
        </Alert>
        <Card className="border mt-4">
          <CardHeader className="border-bottom bg-transparent">
            <h5 className="card-title mb-0">Special request</h5>
          </CardHeader>
          <CardBody>
            <form className="hstack flex-wrap gap-3">
              {SpecialRequest.map((request, idx) => {
                return <CheckFormInput key={idx} id={`checkbox-${idx}`} type="checkbox" name={`checkbox-${idx}`} label={request} control={control} />;
              })}
            </form>
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  );
};

export default GuestDetails;
