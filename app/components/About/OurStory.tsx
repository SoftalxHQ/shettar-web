'use client';

import clsx from 'clsx';
import { Col, Container, Row } from 'react-bootstrap';
import { ourStories } from './data';

const OurStory = () => {
  return (
    <section className="pt-0 pt-lg-5">
      <Container>
        <Row className="mb-4 mb-md-5">
          <Col md={10} className="mx-auto">
            <h3 className="mb-4">Our Story</h3>
            <p className="fw-bold">
              Shettar was built to solve a simple, everyday frustration: booking a place to stay in Nigeria should be quick,
              trustworthy and stress-free. Too often, travellers deal with unverified listings, unclear pricing, and payments
              that feel anything but secure. We set out to change that.
            </p>
            <p className="mb-0">
              Shettar connects guests directly with hotels, apartments and short-stays across the country. Every property on
              the platform is reviewed and verified before it can accept bookings, so what you see is what you get. You can
              search by city, compare room types and prices in Naira, read genuine reviews from other guests, and confirm your
              stay in seconds.
              <br />
              <br />
              Payments are just as effortless. Fund the Shettar Wallet with your card or a dedicated bank account created just
              for you, and book without re-entering your details every time. Prefer to pay at the property? Many hotels also
              accept cash and POS on arrival. Every online payment is processed securely through Paystack, and eligible
              cancellations are refunded straight back to your wallet.
              <br />
              <br />
              Beyond guests, Shettar gives hotels the tools to manage rooms, bookings, payouts and analytics, and rewards the
              marketers who help great properties get discovered. From a weekend getaway to an extended business trip, our goal
              is the same — to make finding and booking the right stay effortless, for everyone.
            </p>
          </Col>
        </Row>
        <Row className="g-4">
          {ourStories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Col key={idx} sm={6} lg={3}>
                <div className={clsx('icon-lg bg-opacity-10 rounded-2 flex-centered', item.variant)}>
                  <Icon size={21} />
                </div>
                <h5 className="mt-2">{item.title}</h5>
                <p className="mb-0">{item.description}</p>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default OurStory;
