'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Container, Row, Col, Card, CardBody } from 'react-bootstrap';
import { BsExclamationTriangle, BsBriefcase, BsInfoCircle } from 'react-icons/bs';

const TermsPage = () => {
  return (
    <>
      <Header />
      <main className="py-5">
        <section className="pt-4 pt-lg-5">
          <Container>
            <Row>
              <Col xs={12} className="text-center mb-5">
                <h6 className="text-primary text-uppercase">Legal</h6>
                <h1 className="h2 mb-0">Terms & Conditions</h1>
                <p className="text-secondary mt-2">Last updated: June 2026</p>
              </Col>
            </Row>

            <Row>
              <Col md={10} lg={8} className="mx-auto">
                <Card className="border shadow-none">
                  <CardBody className="p-4 p-md-5">
                    <div className="d-flex align-items-center mb-3">
                      <BsInfoCircle className="text-primary me-2" size={24} />
                      <h5 className="mb-0">1. Role of Abri</h5>
                    </div>
                    <p className="text-secondary">
                      Abri acts as a facilitator and merely provides an online platform for the User to select and book a particular hotel.
                      Off melancholy alteration principles old. Is do speedily kindness properly oh. Respect article painted cottage he is offices parlors.
                    </p>
                    <p className="text-secondary">
                      Improved own provided blessing may peculiar domestic. Sight house has sex never. No visited raising gravity outward subject my cottage Mr be.
                    </p>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsBriefcase className="text-primary me-2" size={24} />
                      <h5 className="mb-0">2. Booking & Confirmation</h5>
                    </div>
                    <p className="text-secondary">
                      Booking acts as a facilitator and merely provides an online platform for the User to select and book a particular hotel.
                      Hotels in this context include all categories of accommodations such as hotels, home-stays, bed and breakfast stays, and more.
                    </p>
                    <ul className="text-secondary">
                      <li className="mb-2">Offered chiefly farther of my no colonel shyness. Such on help ye some door if in.</li>
                      <li className="mb-2">First am plate jokes to began to cause a scale. Subjects he prospect elegance followed.</li>
                      <li className="mb-2">Insipidity the sufficient discretion imprudence resolution sir him decisively.</li>
                    </ul>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsExclamationTriangle className="text-warning me-2" size={24} />
                      <h5 className="mb-0">3. Limitation of Liability</h5>
                    </div>
                    <p className="text-secondary">
                      Hold do at tore in park feet near my case. Invitation at understood occasional sentiments insipidity inhabiting in.
                      Laughter proposal laughing any son law consider. Needed except up piqued an.
                    </p>
                  </CardBody>
                </Card>

                <div className="text-center mt-5">
                  <p className="text-secondary small">
                    If you have any questions regarding our terms, please contact us at <a href="mailto:legal@shettar.com" className="text-primary">legal@shettar.com</a>
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

export default TermsPage;
