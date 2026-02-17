import { CheckFormInput, SelectFormInput, TextFormInput } from '@/app/components';
import { Alert, Button, Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { BsPeopleFill } from 'react-icons/bs';
import Link from 'next/link';
import { useLayoutContext } from '@/app/states';

const GuestDetails = ({ control }: { control: any }) => {
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
            name="first_name"
            type="text"
            label="First Name"
            control={control}
            placeholder="Enter first name"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="last_name"
            label="Last Name"
            type="text"
            control={control}
            placeholder="Enter last name"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="email_address"
            label="Email Address"
            type="email"
            control={control}
            placeholder="Enter email address"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="phone_number"
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
            name="emer_first_name"
            type="text"
            label="First Name"
            control={control}
            placeholder="Emergency contact first name"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="emer_last_name"
            label="Last Name"
            type="text"
            control={control}
            placeholder="Emergency contact last name"
            className="form-control-lg"
            containerClass="col-md-6"
          />
          <TextFormInput
            name="emer_phone_number"
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
