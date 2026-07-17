'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Container, Row, Col, Card, CardBody } from 'react-bootstrap';
import {
  BsExclamationTriangle,
  BsBriefcase,
  BsInfoCircle,
  BsPersonCheck,
  BsWallet2,
  BsArrowCounterclockwise,
  BsShieldCheck,
  BsChatQuote,
  BsArrowRepeat,
} from 'react-icons/bs';

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
                    <p className="text-secondary">
                      Welcome to Shettar. These Terms &amp; Conditions govern your use of the Shettar website, apps and
                      services (&quot;Shettar&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account or making a
                      booking, you agree to these terms. Please read them carefully.
                    </p>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsInfoCircle className="text-primary me-2" size={24} />
                      <h5 className="mb-0">1. Role of Shettar</h5>
                    </div>
                    <p className="text-secondary">
                      Shettar is an online platform that connects guests with hotels and accommodation providers
                      (&quot;hotels&quot; or &quot;properties&quot;) across Nigeria. &quot;Hotels&quot; in this context include
                      all categories of accommodation such as hotels, apartments, home-stays and short-stays.
                    </p>
                    <p className="text-secondary">
                      We act as an intermediary that facilitates discovery, booking and payment. The accommodation, its
                      condition and the services provided during your stay are the sole responsibility of the hotel you book
                      with. Shettar is not the owner or operator of the properties listed.
                    </p>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsPersonCheck className="text-primary me-2" size={24} />
                      <h5 className="mb-0">2. Your Account</h5>
                    </div>
                    <ul className="text-secondary">
                      <li className="mb-2">You must be at least 18 years old and able to enter into a binding contract to use Shettar.</li>
                      <li className="mb-2">You are responsible for keeping your login details and transaction PIN confidential and for all activity on your account.</li>
                      <li className="mb-2">You agree to provide accurate information and to keep it up to date.</li>
                      <li className="mb-2">Notify us immediately if you suspect any unauthorised access to your account.</li>
                    </ul>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsBriefcase className="text-primary me-2" size={24} />
                      <h5 className="mb-0">3. Bookings &amp; Confirmation</h5>
                    </div>
                    <ul className="text-secondary">
                      <li className="mb-2">A booking is confirmed once payment is successfully completed and you receive a confirmation from Shettar.</li>
                      <li className="mb-2">Prices are displayed in Nigerian Naira (₦) and include any applicable service fees shown at checkout.</li>
                      <li className="mb-2">You are responsible for reviewing the room details, dates, house rules and cancellation policy before confirming.</li>
                      <li className="mb-2">Check-in and check-out times, identification requirements and other conditions are set by each hotel.</li>
                    </ul>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsWallet2 className="text-primary me-2" size={24} />
                      <h5 className="mb-0">4. Payments &amp; the Shettar Wallet</h5>
                    </div>
                    <p className="text-secondary">
                      You may pay using your Shettar Wallet or a debit/credit card. Card and bank transfer payments are
                      processed securely by our payment partner, Paystack. Where a hotel permits it, you may also pay by cash
                      or POS on arrival. You are responsible for any charges applied by your bank. Wallet balances are held in
                      Naira and may be used for bookings and other supported services on the platform.
                    </p>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsArrowCounterclockwise className="text-primary me-2" size={24} />
                      <h5 className="mb-0">5. Cancellations &amp; Refunds</h5>
                    </div>
                    <p className="text-secondary">
                      Each hotel sets its own cancellation policy, which is shown before you confirm your booking. Where a
                      cancellation is eligible for a refund, the amount is credited to your Shettar Wallet, from which you may
                      reuse or withdraw it. Non-refundable bookings will be clearly marked. Refund timelines may vary depending
                      on your bank.
                    </p>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsShieldCheck className="text-primary me-2" size={24} />
                      <h5 className="mb-0">6. Acceptable Use</h5>
                    </div>
                    <ul className="text-secondary">
                      <li className="mb-2">Do not use Shettar for any unlawful, fraudulent or abusive purpose.</li>
                      <li className="mb-2">Do not attempt to interfere with, disrupt or gain unauthorised access to our systems.</li>
                      <li className="mb-2">Respect the property, staff and house rules of any hotel you book.</li>
                    </ul>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsChatQuote className="text-primary me-2" size={24} />
                      <h5 className="mb-0">7. Reviews &amp; Content</h5>
                    </div>
                    <p className="text-secondary">
                      Reviews and other content you submit must be honest, based on genuine experience and free of offensive or
                      misleading material. By posting content, you grant Shettar a licence to display and share it on the
                      platform. We may remove content that breaches these terms.
                    </p>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsExclamationTriangle className="text-warning me-2" size={24} />
                      <h5 className="mb-0">8. Limitation of Liability</h5>
                    </div>
                    <p className="text-secondary">
                      Shettar provides the platform on an &quot;as is&quot; basis. To the fullest extent permitted by law, we
                      are not liable for the acts, omissions or standards of any hotel, or for any indirect or consequential
                      loss arising from your stay. Disputes relating to the accommodation should first be raised with the hotel,
                      and we will assist where we reasonably can.
                    </p>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsArrowRepeat className="text-primary me-2" size={24} />
                      <h5 className="mb-0">9. Changes to These Terms</h5>
                    </div>
                    <p className="text-secondary">
                      We may update these Terms &amp; Conditions from time to time. Where changes are material, we will take
                      reasonable steps to notify you. Continued use of Shettar after an update means you accept the revised
                      terms.
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
