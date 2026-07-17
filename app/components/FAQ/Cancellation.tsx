'use client';

import { Card, CardBody, CardHeader } from 'react-bootstrap';

const Cancellation = () => {
  return (
    <Card className="bg-transparent border p-0">
      <CardHeader className="bg-transparent border-bottom p-4">
        <h5 className="mb-0">Cancellation</h5>
      </CardHeader>
      <CardBody className="p-4 pt-0">
        <div className="mt-4">
          <h6 className="fw-normal">How do I cancel a booking?</h6>
          <p className="mb-0 text-secondary">
            Go to Bookings in your account, open the reservation you want to cancel and select Cancel. You&apos;ll see any
            applicable cancellation terms before you confirm, so there are no surprises.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">Will I get a refund if I cancel?</h6>
          <p className="mb-0 text-secondary">
            Eligible cancellations are refunded automatically to your Shettar Wallet, where you can reuse the balance for your
            next booking or withdraw it. The amount refunded depends on the hotel&apos;s cancellation policy and how close the
            cancellation is to your check-in date.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">Why do cancellation terms differ between hotels?</h6>
          <p className="mb-0 text-secondary">
            Each hotel sets its own cancellation policy — some offer free cancellation up to a certain time, while others are
            non-refundable. The exact terms are always shown on the room details and again before you confirm your booking.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">How long does a refund take?</h6>
          <p className="mb-0 text-secondary">
            Refunds to your Shettar Wallet are typically instant. If you then withdraw to your bank account, the transfer time
            depends on your bank, but usually completes within a few minutes to 24 hours.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default Cancellation;
