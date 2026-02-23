'use client';

import { useToggle } from '@/app/hooks';
import { type ReactNode, useEffect, useState } from 'react';
import { Button, Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { FaSlidersH } from 'react-icons/fa';
import { Header } from '@/app/components';
import LeftPanel from './LeftPanel';
import Footer from './Footer';
import { notFound } from 'next/navigation';
import { useLayoutContext } from '@/app/states';

const UserLayout = ({ children }: { children: ReactNode }) => {
  const { isOpen, toggle } = useToggle();
  const { isAuthenticated, isAccountLoading } = useLayoutContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.classList.add('dashboard');
    return () => {
      document.body.classList.remove('dashboard');
    };
  }, []);

  // Wait for client hydration to finish before evaluating client-side auth state
  if (!mounted || isAccountLoading) {
    return null;
  }

  // If not authenticated, act as if the page doesn't exist
  if (!isAuthenticated) {
    notFound();
    return null;
  }

  return (
    <>
      <Header />

      <main>
        <section className="pt-3">
          <Container>
            <Row>
              <Col lg={4} xl={3}>
                <div className="d-none d-lg-block">
                  <LeftPanel />
                </div>
                <Offcanvas
                  show={isOpen}
                  onHide={toggle}
                  placement="end"
                  className="offcanvas-lg"
                  tabIndex={-1}
                  id="offcanvasSidebar"
                >
                  <OffcanvasHeader className="justify-content-end pb-2" closeButton onClick={toggle}>
                  </OffcanvasHeader>
                  <OffcanvasBody className="p-3 p-lg-0">
                    <LeftPanel />
                  </OffcanvasBody>
                </Offcanvas>
              </Col>
              <Col lg={8} xl={9}>
                <div className="d-grid mb-0 d-lg-none w-100">
                  <Button
                    variant="primary"
                    className="mb-4 items-center justify-content-center gap-1 d-flex"
                    type="button"
                    onClick={toggle}
                  >
                    <FaSlidersH /> Menu
                  </Button>
                </div>

                {children}
              </Col>
            </Row>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default UserLayout;
