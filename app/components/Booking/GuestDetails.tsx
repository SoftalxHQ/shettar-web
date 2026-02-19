import { CheckFormInput, SelectFormInput, TextFormInput } from '@/app/components';
import { Alert, Button, Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { BsPeopleFill } from 'react-icons/bs';
import Link from 'next/link';
import { useLayoutContext } from '@/app/states';

const GuestDetails = ({
  control,
  watch,
  setValue
}: {
  control: any,
  watch: any,
  setValue: any
}) => {
  const { isAuthenticated, account } = useLayoutContext();
  const option = watch('option');

  const isEmergencyMissing = isAuthenticated && (!account?.emer_first_name || !account?.emer_phone_number);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newOption = isChecked ? 'others' : 'self';
    setValue('option', newOption);

    if (isChecked) {
      // Clear fields if booking for others
      setValue('first_name', '');
      setValue('last_name', '');
      setValue('email_address', '');
      setValue('phone_number', '');
    } else if (account) {
      // Restore if booking for self
      setValue('first_name', account.first_name || '');
      setValue('last_name', account.last_name || '');
      setValue('email_address', account.email || '');
      setValue('phone_number', account.phone_number || '');
    }
  };

  return (
    <Card className="shadow">
      <CardHeader className="card-header border-bottom p-4 bg-transparent">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0 items-center">
            <BsPeopleFill className=" me-2" />
            Guest Details
          </h4>

          {isAuthenticated && (
            <div className="form-check form-switch mb-0 d-flex align-items-center">
              <input
                className="form-check-input me-3"
                type="checkbox"
                role="switch"
                id="bookingForOthers"
                style={{ width: '3rem', height: '1.5rem' }}
                checked={option === 'others'}
                onChange={handleOptionChange}
              />
              <label className="form-check-label small fw-bold mb-0" htmlFor="bookingForOthers">
                Booking for someone else?
              </label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody className="p-4">
        <form className="row g-4">
          <Col xs={12}>
            <div className="bg-light rounded-2 px-4 py-3 border-start border-primary border-4">
              <h6 className="mb-0">
                {option === 'others' ? 'Guest Information' : 'Personal Information'}
              </h6>
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

          {!isAuthenticated ? (
            <>
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
            </>
          ) : (
            <div style={{ display: 'none' }}>
              <input type="hidden" {...control.register('emer_first_name')} value={account?.emer_first_name || ''} />
              <input type="hidden" {...control.register('emer_last_name')} value={account?.emer_last_name || ''} />
              <input type="hidden" {...control.register('emer_phone_number')} value={account?.emer_phone_number || ''} />
            </div>
          )}
        </form>

        {isEmergencyMissing && (
          <Alert variant="danger" className="mt-4 mb-3 border-2" role="alert">
            <h6 className="alert-heading">Action Required: Update Profile</h6>
            <p className="mb-0 small fw-bold text-dark">
              You must update your <strong>Next of Kin</strong> details in your profile settings before you can proceed with a booking.
              <Link href="/user/settings" className="ms-2 text-danger text-decoration-underline">Update Settings Now</Link>
            </p>
          </Alert>
        )}

        {!isAuthenticated && (
          <Alert variant="warning" className="mt-4 mb-3 border-2" role="alert">
            <h6 className="alert-heading">Notice: Guest Booking Policy</h6>
            <p className="mb-0 small fw-bold text-dark">
              Please note that bookings made without an account are <strong>not eligible for refund or cancellation</strong>.
              To enjoy flexible booking options, please sign in or create an account before proceeding.
            </p>
          </Alert>
        )}

        {!isAuthenticated && (
          <Alert variant="info" className="mt-0 mb-0" role="alert">
            Already have an account? {' '}
            <Link href="/auth/sign-in" className="alert-heading h6 text-decoration-none">
              Sign In
            </Link>{' '}
            to prefill details and earn rewards.
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};

export default GuestDetails;
