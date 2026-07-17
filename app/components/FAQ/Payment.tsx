'use client';

import { Card, CardBody, CardHeader } from 'react-bootstrap';

const Payment = () => {
  return (
    <Card className="bg-transparent border p-0">
      <CardHeader className="bg-transparent border-bottom p-4">
        <h5 className="mb-0">Payment</h5>
      </CardHeader>
      <CardBody className="p-4 pt-0">
        <div className="mt-4">
          <h6 className="fw-normal">What payment methods can I use?</h6>
          <p className="mb-0 text-secondary">
            You can pay with your Shettar Wallet or a debit/credit card. Card payments are processed securely through Paystack.
            Many hotels also accept cash or POS on arrival if you prefer to pay at the property.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">How does the Shettar Wallet work?</h6>
          <p className="mb-0 text-secondary">
            Your wallet lets you keep a balance in Naira for fast, one-tap booking. Fund it with your card, or transfer to the
            dedicated bank account we generate just for you — deposits are credited automatically. You can also use your wallet
            for extras like airtime, data and utility payments.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">Is it safe to pay on Shettar?</h6>
          <p className="mb-0 text-secondary">
            Yes. All online payments run through Paystack&apos;s secure, PCI-compliant infrastructure, and we never store your
            full card details. You can add an extra layer of protection with a transaction PIN on your account.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">What currency are prices in?</h6>
          <p className="mb-0 text-secondary">
            All prices on Shettar are shown in Nigerian Naira (₦), so the amount you see is the amount you pay — with no hidden
            charges at checkout.
          </p>
        </div>
        <div className="mt-4">
          <h6 className="fw-normal">How do I get my refund?</h6>
          <p className="mb-0 text-secondary">
            Refunds for eligible cancellations go straight to your Shettar Wallet, usually instantly. From there you can reuse
            the balance on your next stay or withdraw it to your bank account.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default Payment;
