'use client';

import { Col, Container, Image, Row } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa6';
import Link from 'next/link';

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="bg-dark p-3">
      <Container>
        <Row className="align-items-center">
          <Col md={4}>
            <div className="text-center text-md-start mb-3 mb-md-0">
              <Link href="/">
                <Image className="h-30px" src="/images/logo/logo-light.svg" alt="logo" width={120} height={30} />
              </Link>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-body-secondary text-primary-hover text-center">
              Copyrights ©{currentYear} Booking. Build by{' '}
              <Link href="https://www.stackbros.in/" target="_blank" className="text-body-secondary">
                StackBros
              </Link>
              .
            </div>
          </Col>
          <Col md={4}>
            <ul className="list-inline mb-0 text-center text-md-end">
              <li className="list-inline-item ms-2">
                <Link href="">
                  <FaFacebook className="text-white" />
                </Link>
              </li>
              <li className="list-inline-item ms-2">
                <Link href="">
                  <FaInstagram className="text-white" />
                </Link>
              </li>
              <li className="list-inline-item ms-2">
                <Link href="">
                  <FaLinkedinIn className="text-white" />
                </Link>
              </li>
              <li className="list-inline-item ms-2">
                <Link href="">
                  <FaTwitter className="text-white" />
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
