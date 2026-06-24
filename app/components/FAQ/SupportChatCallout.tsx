'use client';

import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';
import { BsArrowRight, BsChatDots } from 'react-icons/bs';

const SupportChatCallout = () => {
  return (
    <section className="pt-0 pb-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-4 p-4 p-sm-5 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
              <div>
                <h4 className="mb-2">Still need help?</h4>
                <p className="mb-0 text-secondary">
                  Chat with our support team for live help with bookings, payments, and account issues.
                </p>
              </div>
              <Link href="/support-chat" className="btn btn-primary flex-shrink-0">
                <BsChatDots className="me-2" />
                Live Chat
                <BsArrowRight className="ms-2" />
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default SupportChatCallout;
