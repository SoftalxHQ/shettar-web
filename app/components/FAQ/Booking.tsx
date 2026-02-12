'use client';

import { Card, CardBody, CardHeader } from 'react-bootstrap';

const Booking = () => {
  return (
    <Card className="border bg-transparent p-0">
      <CardHeader className="bg-transparent border-bottom p-4">
        <h5 className="mb-0">Booking</h5>
      </CardHeader>
      <CardBody className="p-4 pt-0">
        <div className="mt-4">
          <h6 className="fw-normal">Can I move my booking to a future date?</h6>
          <p className="mb-0 text-secondary">
            Yet remarkably appearance gets him his projection. Diverted endeavor bed peculiar men the not desirous. Acuteness abilities ask can
            offending furnished fulfilled sex. Warrant fifteen exposed ye at mistake. Blush since so in noisy still built up an again. As young ye
            hopes no he place means. Partiality diminution gay yet entreaties admiration. In mention perhaps attempt pointed suppose. Unknown ye
            chamber of warrant of Norland arrived.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">Can I give my reservation to someone else?</h6>
          <p className="mb-0 text-secondary">
            Supposing so be resolving breakfast am or perfectly. It drew a hill from me. Valley by oh twenty direct me so. Departure defective
            arranging rapturous did believe him all had supported. Family months lasted simple set nature vulgar him. Picture for attempt joy excited
            ten carried manners talking how. Suspicion neglected the resolving agreement perceived at an. Comfort reached gay perhaps chamber his six
            detract besides add.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">How can I get help with an existing reservation?</h6>
          <p className="mb-0 text-secondary">
            Departure defective arranging rapturous did believe him all had supported. Family months lasted simple set nature vulgar him. Picture for
            attempt joy excited ten carried manners talking how. Suspicion neglected the resolving agreement perceived at an. Comfort reached gay
            perhaps chamber his six detract besides add.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">You can change your booking at any time</h6>
          <p className="mb-0 text-secondary">
            At the moment, we only accept Credit/Debit cards and Paypal payments. Paypal is the easiest way to make payments online. While checking
            out your order. Be sure to fill in correct details for fast &amp; hassle-free payment processing.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default Booking;
