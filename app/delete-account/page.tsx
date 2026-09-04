'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { Container, Row, Col, Card, CardBody } from 'react-bootstrap';
import { BsTrash, BsClockHistory, BsShieldCheck, BsInfoCircle } from 'react-icons/bs';

const DeleteAccountPage = () => {
  return (
    <>
      <Header />
      <main className="py-5">
        <section className="pt-4 pt-lg-5">
          <Container>
            <Row>
              <Col xs={12} className="text-center mb-5">
                <h6 className="text-primary text-uppercase">Legal</h6>
                <h1 className="h2 mb-0">Delete your Shettar account</h1>
                <p className="text-secondary mt-2">Last updated: August 2026</p>
              </Col>
            </Row>

            <Row>
              <Col md={10} lg={8} className="mx-auto">
                <Card className="border shadow-none">
                  <CardBody className="p-4 p-md-5">
                    <p className="text-secondary">
                      You can request deletion of your Shettar guest account and the personal data tied to it.
                      This page explains how to make that request, what we delete, what we may keep, and why.
                    </p>

                    <div className="d-flex align-items-center mb-3 mt-4">
                      <BsTrash className="text-primary me-2" size={24} />
                      <h5 className="mb-0">How to request account deletion</h5>
                    </div>
                    <p className="text-secondary">
                      You must be signed in to schedule deletion. After you confirm, we wait 24 hours before
                      permanently deleting the account so you can cancel if you change your mind.
                    </p>
                    <ol className="text-secondary">
                      <li className="mb-2">
                        On the web, <Link href="/auth/sign-in">sign in</Link>, then open{' '}
                        <Link href="/user/delete-profile">Delete account</Link> in your profile menu
                        (or go to Settings).
                      </li>
                      <li className="mb-2">
                        In the Shettar mobile app, open <strong>Security</strong> and choose delete account.
                      </li>
                      <li className="mb-2">
                        Confirm the request and pick a reason. We email you when deletion is scheduled and when
                        it is cancelled.
                      </li>
                    </ol>
                    <p className="text-secondary">
                      If your wallet balance is ₦100 or more, withdraw it first. We cannot schedule deletion
                      while that balance remains.
                    </p>
                    <p className="text-secondary mb-0">
                      If you cannot sign in, contact us at{' '}
                      <a href="mailto:hey@shettar.com">hey@shettar.com</a> or use{' '}
                      <Link href="/contact">Contact</Link> / <Link href="/support-chat">Live chat</Link> and
                      ask us to process a deletion request. We will verify that the request comes from the
                      account holder.
                    </p>

                    <div className="d-flex align-items-center mb-3 mt-5">
                      <BsShieldCheck className="text-primary me-2" size={24} />
                      <h5 className="mb-0">What data gets deleted</h5>
                    </div>
                    <p className="text-secondary">After the 24-hour waiting period, we permanently delete:</p>
                    <ul className="text-secondary">
                      <li className="mb-2">Your account profile (name, email, phone number, and profile photo)</li>
                      <li className="mb-2">Sign-in credentials, passkeys, and saved devices</li>
                      <li className="mb-2">Wishlist, in-app notifications, and push-notification tokens</li>
                      <li className="mb-2">Wallet account details and remaining balance below the withdrawal threshold</li>
                    </ul>

                    <div className="d-flex align-items-center mb-3 mt-5">
                      <BsInfoCircle className="text-primary me-2" size={24} />
                      <h5 className="mb-0">What data may be retained</h5>
                    </div>
                    <p className="text-secondary">We may keep records that are no longer linked to a live account:</p>
                    <ul className="text-secondary">
                      <li className="mb-2">Booking and reservation records (dates, room, amounts, and guest details provided at booking)</li>
                      <li className="mb-2">Payment and wallet transaction history</li>
                      <li className="mb-2">Reviews and ratings you posted (the account link is removed)</li>
                      <li className="mb-2">Records we must keep for tax, accounting, fraud prevention, or legal disputes</li>
                    </ul>

                    <div className="d-flex align-items-center mb-3 mt-5">
                      <BsClockHistory className="text-primary me-2" size={24} />
                      <h5 className="mb-0">Why we keep some data, and for how long</h5>
                    </div>
                    <p className="text-secondary">
                      Hotels need booking history to honour stays, handle check-in, and resolve complaints.
                      Payment processors and Nigerian tax and financial rules also require us to keep
                      transaction records. Reviews stay on property pages because they describe a stay, not
                      a live user profile.
                    </p>
                    <ul className="text-secondary">
                      <li className="mb-2">
                        <strong>24 hours:</strong> grace period after you request deletion. You can cancel
                        from the web or app before this ends.
                      </li>
                      <li className="mb-2">
                        <strong>Booking and payment records:</strong> kept as long as needed for hotel
                        operations, refunds, chargebacks, accounting, and applicable law.
                      </li>
                      <li className="mb-2">
                        <strong>Legal holds:</strong> if a dispute, investigation, or legal request is open,
                        we keep the relevant records until that matter is closed.
                      </li>
                    </ul>
                    <p className="text-secondary mb-0">
                      We do not sell your personal data. See our <Link href="/privacy">Privacy Policy</Link>{' '}
                      for how we use information while your account is active.
                    </p>
                  </CardBody>
                </Card>

                <div className="text-center mt-5">
                  <Link href="/auth/sign-in" className="btn btn-primary">
                    Sign in to delete your account
                  </Link>
                  <p className="text-secondary small mt-3 mb-0">
                    Questions? <a href="mailto:hey@shettar.com">hey@shettar.com</a>
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

export default DeleteAccountPage;
