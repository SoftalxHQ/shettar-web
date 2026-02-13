'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Container, Row, Col, Card, CardBody } from 'react-bootstrap';
import { BsShieldLock } from 'react-icons/bs';

const PrivacyPage = () => {
  return (
    <>
      <Header />
      <main className="py-5">
        <section className="pt-4 pt-lg-5">
          <Container>
            <Row>
              <Col xs={12} className="text-center mb-5">
                <h6 className="text-primary text-uppercase">Legal</h6>
                <h1 className="h2 mb-0">Privacy Policy</h1>
                <p className="text-secondary mt-2">Last updated: June 2026</p>
              </Col>
            </Row>

            <Row>
              <Col md={10} lg={8} className="mx-auto">
                <Card className="border shadow-none">
                  <CardBody className="p-4 p-md-5">
                    <div className="d-flex align-items-center mb-3">
                      <BsShieldLock className="text-primary me-2" size={24} />
                      <h5 className="mb-0">Data Protection & Privacy</h5>
                    </div>
                    <p className="text-secondary">
                      At Abri, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you use our hotel booking services.
                    </p>
                    <p className="text-secondary">
                      Some banks and card issuing companies charge their account holders a transaction fee when the card issuer and the merchant location
                      are in different countries. If a User has any questions about the fees or exchange rate, they may contact their bank.
                    </p>
                    <p className="text-secondary">
                      Started several mistake joy say painful removed reached end. State burst think end are its. Arrived off she elderly beloved him affixed noisier yet. We ensure that all personal data is encrypted and handled in accordance with global data protection regulations.
                    </p>

                    <h5 className="mt-4">Information We Collect</h5>
                    <p className="text-secondary">
                      We collect information you provide directly to us, such as when you create an account, make a booking, or contact our support team. This includes your name, email address, phone number, and payment details.
                    </p>

                    <h5 className="mt-4">How We Use Your Information</h5>
                    <p className="text-secondary">
                      We use your information to process bookings, communicate with you about your reservations, and improve our services. We do not sell your personal data to third parties.
                    </p>
                  </CardBody>
                </Card>

                <div className="text-center mt-5">
                  <p className="text-secondary small">
                    If you have any questions regarding our privacy practices, please contact us at <a href="mailto:privacy@abri.com" className="text-primary">privacy@abri.com</a>
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

export default PrivacyPage;
