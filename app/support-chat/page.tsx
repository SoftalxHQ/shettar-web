'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import {
  BsArrowDown,
  BsChatDots,
  BsHouse,
  BsLightningCharge,
  BsHeadset,
} from 'react-icons/bs';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import {
  closeTidioChat,
  loadTidioChat,
  onTidioEvent,
  openTidioChat,
  setTidioVisible,
} from '@/app/helpers/tidio';

export default function SupportChatPage() {
  const [isChatActive, setIsChatActive] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await loadTidioChat();
      if (!mounted) return;

      setTidioVisible(true);
      onTidioEvent('chat:open', () => setIsChatActive(true));
      onTidioEvent('chat:close', () => setIsChatActive(false));
      setIsReady(true);
    };

    void init();

    return () => {
      mounted = false;
      closeTidioChat();
      setTidioVisible(false);
    };
  }, []);

  return (
    <>
      <Header />
      <main>
        <section className="pt-4 pt-lg-5 pb-0">
          <Container>
            <Row>
              <Col lg={8} className="mx-auto text-center">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb breadcrumb-dots justify-content-center">
                    <li className="breadcrumb-item">
                      <Link href="/" className="d-inline-flex align-items-center gap-1">
                        <BsHouse /> Home
                      </Link>
                    </li>
                    <li className="breadcrumb-item active">Support Hub</li>
                  </ol>
                </nav>
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                  <h1 className="h3 mb-0">Support Hub</h1>
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                    <span
                      className="d-inline-block rounded-circle bg-success me-1"
                      style={{ width: 6, height: 6 }}
                    />
                    Team Online
                  </span>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="py-5">
          <Container>
            <Row className="justify-content-center">
              <Col lg={7} xl={6}>
                <div
                  className="text-center px-3 px-sm-4"
                  style={{
                    opacity: isChatActive ? 0 : 1,
                    pointerEvents: isChatActive ? 'none' : 'auto',
                    transition: 'opacity 0.25s ease',
                  }}
                >
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                    style={{
                      width: 120,
                      height: 120,
                      background: 'var(--bs-primary-bg-subtle)',
                    }}
                  >
                    <BsHeadset size={56} className="text-primary" />
                  </div>

                  <h2 className="h4 mb-2">How can we help?</h2>
                  <p className="text-secondary mb-4">
                    Our team is here to assist with bookings, payments, or any other enquiries.
                  </p>

                  <div className="d-inline-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 mb-4">
                    <BsLightningCharge className="text-primary" />
                    <span className="small fw-semibold">Typically replies in 2 mins</span>
                  </div>

                  <div className="d-grid gap-3 mx-auto" style={{ maxWidth: 320 }}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="shadow-sm"
                      disabled={!isReady}
                      onClick={() => openTidioChat()}
                    >
                      {!isReady ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Loading chat…
                        </>
                      ) : (
                        <>
                          <BsChatDots className="me-2" />
                          Start Live Chat
                        </>
                      )}
                    </Button>
                    <p className="small text-secondary mb-0">
                      Or tap the chat icon in the bottom-right corner to talk with our agents.
                    </p>
                    <BsArrowDown size={22} className="text-primary mx-auto" />
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
