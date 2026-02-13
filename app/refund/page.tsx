'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Container, Row, Col, Card, CardBody } from 'react-bootstrap';
import { BsArrowLeftRight } from 'react-icons/bs';

const RefundPage = () => {
  return (
    <>
      <Header />
      <main className="py-5">
        <section className="pt-4 pt-lg-5">
          <Container>
            <Row>
              <Col xs={12} className="text-center mb-5">
                <h6 className="text-primary text-uppercase">Legal</h6>
                <h1 className="h2 mb-0">Refund Policy</h1>
                <p className="text-secondary mt-2">Last updated: June 2026</p>
              </Col>
            </Row>

            <Row>
              <Col md={10} lg={8} className="mx-auto">
                <Card className="border shadow-none">
                  <CardBody className="p-4 p-md-5">
                    <div className="d-flex align-items-center mb-3">
                      <BsArrowLeftRight className="text-primary me-2" size={24} />
                      <h5 className="mb-0">Cancellations & Refunds</h5>
                    </div>
                    <p className="text-secondary">
                      Our refund policy is designed to be fair to both our users and our hotel partners. Cancellation terms vary depending on the hotel and the type of rate booked.
                    </p>

                    <h5 className="mt-4">General Refund Rules</h5>
                    <ul className="text-secondary">
                      <li className="mb-2">Refunds are processed to the original payment method used during booking.</li>
                      <li className="mb-2">Processing times for refunds typically take 5-10 business days depending on your bank.</li>
                      <li className="mb-2">Non-refundable bookings are not eligible for refunds under any circumstances, except where required by law.</li>
                    </ul>

                    <h5 className="mt-4">How to Request a Refund</h5>
                    <p className="text-secondary">
                      To request a refund, please log in to your account and navigate to your bookings. If your booking is eligible for a refund, you will see a 'Request Refund' button. Alternatively, you can contact our 24/7 support team.
                    </p>

                    <p className="text-secondary mt-4 mb-0">
                      Abri acts as a facilitator and follows the specific cancellation policies set by each hotel partner. Please review the specific terms of your booking before confirming.
                    </p>
                  </CardBody>
                </Card>

                <div className="text-center mt-5">
                  <p className="text-secondary small">
                    For specific refund queries, please contact our support at <a href="mailto:support@abri.com" className="text-primary">support@abri.com</a>
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default RefundPage;
