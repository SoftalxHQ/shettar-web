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
          <h6 className="fw-normal">How do I book a hotel on Shettar?</h6>
          <p className="mb-0 text-secondary">
            Search for a city or hotel, choose your check-in and check-out dates, then pick the room type that suits you.
            Review the price, confirm your details and pay with your Shettar Wallet or card. Your booking is confirmed
            instantly and you&apos;ll see it under Bookings in your account.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">Do I need an account to book?</h6>
          <p className="mb-0 text-secondary">
            Yes. A Shettar account lets us securely store your bookings, wallet balance and reviews, and keeps your
            confirmations and reminders in one place. Signing up takes less than a minute with your email or phone number.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">How will I know my booking is confirmed?</h6>
          <p className="mb-0 text-secondary">
            Once payment is successful, your reservation is confirmed in real time. You&apos;ll get an on-screen confirmation,
            a push notification, and the booking will appear in your account with all the details you need for check-in.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">Can I order room service or extras during my stay?</h6>
          <p className="mb-0 text-secondary">
            For hotels that offer it, you can browse the restaurant menu and place room-service orders right from your active
            booking, and pay with your wallet or card — no need to leave the app.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">How can I get help with an existing booking?</h6>
          <p className="mb-0 text-secondary">
            Open the booking in your account to view its status and details. If you need more help, start a live chat with our
            support team and we&apos;ll assist you with changes, payments or check-in questions.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default Booking;
