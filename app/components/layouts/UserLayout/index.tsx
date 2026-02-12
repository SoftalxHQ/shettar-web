'use client';

import { useToggle } from '@/app/hooks';
import { type ReactNode, useEffect } from 'react';
import { Button, Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { FaSlidersH } from 'react-icons/fa';
import TopNavBar from './TopNavBar';
import LeftPanel from './LeftPanel';
import Footer from './Footer';

const UserLayout = ({ children }: { children: ReactNode }) => {
  const { isOpen, toggle } = useToggle();

  useEffect(() => {
    document.body.classList.add('dashboard');
    return () => {
      document.body.classList.remove('dashboard');
    };
  }, []);

  return (
    <>
      <TopNavBar />

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
