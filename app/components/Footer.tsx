'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Container, Row, Col, Nav, NavItem, NavLink, Button } from 'react-bootstrap';
import { BsEnvelope, BsTelephone } from 'react-icons/bs';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa6';

const footerLinks = [
  {
    title: 'Company',
    items: [
      { name: 'About us', link: '/about' },
      { name: 'Contact us', link: '/contact' },
      { name: 'FAQ', link: '/faq' },
      { name: 'Terms & Conditions', link: '/terms' },
    ],
  },
  {
    title: 'Explore',
    items: [
      { name: 'Hotels', link: '/hotel' },
      { name: 'Near Me', link: '/hotel' },
      { name: 'Best Deals', link: '/hotel' },
      { name: 'Luxury Stays', link: '/hotel' },
    ],
  },
];

const currentYear = new Date().getFullYear();

export default function FooterWithLinks() {
  return (
    <footer className="bg-dark pt-5">
      <Container>
        <Row className="g-4">
          <Col lg={4}>
            <Link href="/">
              <Image
                src="/images/logo/logo-light.svg"
                alt="logo"
                width={160}
                height={40}
                className="h-40px"
              />
            </Link>
            <p className="my-3 text-body-secondary">
              Shettar is your ultimate companion for finding the perfect stay. From luxury resorts to cozy local hotels, we make booking your next room effortless and rewarding.
            </p>
            <div className="vstack gap-2 mt-4">
              <Link href="#" className="text-body-secondary text-primary-hover d-flex align-items-center mb-0">
                <BsTelephone className="me-2" />
                +1234 568 963
              </Link>
              <Link href="#" className="text-body-secondary text-primary-hover d-flex align-items-center mb-0">
                <BsEnvelope className="me-2" />
                hello@shettar.com
              </Link>
            </div>
          </Col>

          <Col md={6} lg={2} className="ms-lg-auto">
            <h5 className="text-white mb-3 mb-md-4">Company</h5>
            <Nav className="flex-column text-primary-hover">
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/about">About us</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/contact">Contact us</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/faq">FAQ</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/terms">Terms & Conditions</NavLink>
              </NavItem>
            </Nav>
          </Col>

          <Col md={6} lg={2}>
            <h5 className="text-white mb-3 mb-md-4">Explore</h5>
            <Nav className="flex-column text-primary-hover">
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/hotel">Hotels</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/hotel">Near Me</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/hotel">Best Deals</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/hotel">Luxury Stays</NavLink>
              </NavItem>
            </Nav>
          </Col>

          <Col lg={3}>
            <h5 className="text-white mb-3">Payment & Security</h5>
            <ul className="list-inline mb-4 mt-3">
              <li className="list-inline-item me-2">
                <Image src="/images/element/paypal.svg" className="h-30px" alt="paypal" width={45} height={30} />
              </li>
              <li className="list-inline-item me-2">
                <Image src="/images/element/visa.svg" className="h-30px" alt="visa" width={45} height={30} />
              </li>
              <li className="list-inline-item me-2">
                <Image src="/images/element/mastercard.svg" className="h-30px" alt="mastercard" width={45} height={30} />
              </li>
              <li className="list-inline-item">
                <Image src="/images/element/expresscard.svg" className="h-30px" alt="expresscard" width={45} height={30} />
              </li>
            </ul>

            <h5 className="text-white mb-3">Follow us on</h5>
            <div className="d-flex gap-2">
              <Button size="sm" className="px-2 bg-facebook mb-0 shadow-none border-0" href="#">
                <FaFacebookF size={14} />
              </Button>
              <Button size="sm" className="px-2 bg-instagram mb-0 shadow-none border-0" href="#">
                <FaInstagram size={14} />
              </Button>
              <Button size="sm" className="px-2 bg-twitter mb-0 shadow-none border-0" href="#">
                <FaTwitter size={14} />
              </Button>
              <Button size="sm" className="px-2 bg-linkedin mb-0 shadow-none border-0" href="#">
                <FaLinkedinIn size={14} />
              </Button>
            </div>
          </Col>
        </Row>


        <hr className="mt-4 mb-0" />

        <Row>
          <Container>
            <div className="d-lg-flex justify-content-between align-items-center py-3 text-center text-lg-start">
              <div className="text-body-secondary text-primary-hover">
                Copyrights ©{currentYear} Shettar. Build by{' '}
                <a href="#" className="text-body-secondary">
                  Softalx Solution
                </a>.
              </div>
              <Nav className="nav mt-2 mt-lg-0">
                <ul className="list-inline text-primary-hover mx-auto mb-0">
                  <li className="list-inline-item me-0">
                    <NavLink className="text-body-secondary py-1" href="/privacy">
                      Privacy policy
                    </NavLink>
                  </li>
                  <li className="list-inline-item me-0">
                    <NavLink className="text-body-secondary py-1" href="/terms">
                      Terms and conditions
                    </NavLink>
                  </li>
                  <li className="list-inline-item me-0">
                    <NavLink className="text-body-secondary py-1 pe-0" href="/refund">
                      Refund policy
                    </NavLink>
                  </li>
                </ul>
              </Nav>
            </div>
          </Container>
        </Row>
      </Container>
    </footer>
  );
}
