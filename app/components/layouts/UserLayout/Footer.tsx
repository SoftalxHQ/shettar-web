'use client';

import { Col, Container, Image, Row } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa6';
import Link from 'next/link';

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="bg-dark p-4 mt-auto">
      <Container>
        <Row className="align-items-center">
          <Col md={4}>
            <div className="text-center text-md-start mb-3 mb-md-0">
              <Link href="/">
                <Image className="h-30px" src="/images/logo/shettar-logo.png" alt="logo" width={110} height={28} style={{ objectFit: 'contain' }} />
              </Link>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-body-secondary text-primary-hover text-center small">
              Copyrights ©{currentYear} <Link href="/" className="text-body-secondary fw-bold">Shettar</Link>.<br />
              <span className="opacity-50">A product by Softalx Solution.</span>
            </div>
          </Col>
          <Col md={4}>
            <div className="d-flex justify-content-center justify-content-md-end align-items-center">
              <ul className="list-inline mb-0 me-3">
                <li className="list-inline-item ms-2">
                  <Link href="/privacy" className="text-body-secondary small text-primary-hover">Privacy</Link>
                </li>
                <li className="list-inline-item ms-2">
                  <Link href="/terms" className="text-body-secondary small text-primary-hover">Terms</Link>
                </li>
              </ul>
              <ul className="list-inline mb-0">
                <li className="list-inline-item ms-2">
                  <Link href="#" className="btn btn-xs btn-icon btn-light-soft mb-0">
                    <FaFacebook size={14} className="text-white" />
                  </Link>
                </li>
                <li className="list-inline-item ms-2">
                  <Link href="#" className="btn btn-xs btn-icon btn-light-soft mb-0">
                    <FaLinkedinIn size={14} className="text-white" />
                  </Link>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
