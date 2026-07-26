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
      { name: 'Download App', link: '/download' },
      { name: 'Contact us', link: '/contact' },
      { name: 'FAQ', link: '/faq' },
      { name: 'Live Chat', link: '/support-chat' },
      { name: 'Terms & Conditions', link: '/terms' },
    ],
  },
  {
    title: 'Explore',
    items: [
      { name: 'Find Hotels', link: '/hotel/list' },
      { name: 'Browse Hotels', link: '/hotel/grid' },
      { name: 'Refund Policy', link: '/refund' },
      { name: 'Privacy Policy', link: '/privacy' },
    ],
  },
];

const currentYear = new Date().getFullYear();

const IOS_APP_URL =
  process.env.NEXT_PUBLIC_IOS_APP_URL || 'https://apps.apple.com/search?term=Shettar';
const ANDROID_APP_URL =
  process.env.NEXT_PUBLIC_ANDROID_APP_URL ||
  'https://play.google.com/store/apps/details?id=com.softalx.shettar';

export default function FooterWithLinks() {
  return (
    <footer className="bg-dark pt-5">
      <Container>
        <Row className="g-4">
          <Col lg={4}>
            <Link href="/">
              <Image
                src="/images/logo/shettar-logo.png"
                alt="logo"
                width={160}
                height={40}
                className="h-40px"
                style={{ objectFit: 'contain' }}
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
                <NavLink className="text-body-secondary ps-0" href="/download">Download App</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/contact">Contact us</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/faq">FAQ</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/support-chat">Live Chat</NavLink>
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
                <NavLink className="text-body-secondary ps-0" href="/hotel/list">Find Hotels</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/hotel/grid">Browse Hotels</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/refund">Refund Policy</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="text-body-secondary ps-0" href="/privacy">Privacy Policy</NavLink>
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

            <h5 className="text-white mb-3 mt-4">Get the app</h5>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <a
                href={IOS_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/images/element/app-store.svg"
                  alt="Download on the App Store"
                  width={120}
                  height={36}
                  style={{ height: 36, width: 'auto' }}
                />
              </a>
              <a
                href={ANDROID_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get it on Google Play"
              >
                <Image
                  src="/images/element/google-play.svg"
                  alt="Get it on Google Play"
                  width={120}
                  height={36}
                  style={{ height: 36, width: 'auto' }}
                />
              </a>
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
