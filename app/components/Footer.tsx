'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Container, Row, Col, Nav, NavItem, NavLink, Button } from 'react-bootstrap';
import { BsEnvelope, BsTelephone } from 'react-icons/bs';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa6';

const footerLinks = [
  {
    title: 'Page',
    items: [
      { name: 'About us', link: '#' },
      { name: 'Contact us', link: '#' },
      { name: 'News and Blog', link: '#' },
      { name: 'Meet a Team', link: '#' },
    ],
  },
  {
    title: 'Link',
    items: [
      { name: 'Sign up', link: '#' },
      { name: 'Sign in', link: '#' },
      { name: 'Privacy Policy', link: '#' },
      { name: 'Terms', link: '#' },
      { name: 'Cookie', link: '#' },
      { name: 'Support', link: '#' },
    ],
  },
  {
    title: 'Global Sites',
    items: [
      { name: 'India', link: '#' },
      { name: 'California', link: '#' },
      { name: 'Indonesia', link: '#' },
      { name: 'Canada', link: '#' },
      { name: 'Malaysia', link: '#' },
    ],
  },
  {
    title: 'Booking',
    items: [
      { name: 'Hotel', link: '#' },
      { name: 'Flight', link: '#' },
      { name: 'Tour', link: '#' },
      { name: 'Cabs', link: '#' },
      { name: 'About', link: '#' },
    ],
  },
];

const topLinks = [
  { name: 'Hotels in New York', link: '#' },
  { name: 'Hotels in California', link: '#' },
  { name: 'Villas in England', link: '#' },
  { name: 'Apartments in Chicago', link: '#' },
  { name: 'Hotels in Phoenix', link: '#' },
  { name: 'Hotels in Bangladesh', link: '#' },
  { name: 'Hotels in New Jersey', link: '#' },
  { name: 'Homestay in Canada', link: '#' },
  { name: 'Villas in Seattle', link: '#' },
  { name: 'Flats in Kuala Lumpur', link: '#' },
  { name: 'Homestays in Thailand', link: '#' },
];

export default function FooterWithLinks() {
  return (
    <footer className="bg-dark pt-5">
      <Container>
        <Row className="g-4">
          <Col lg={3}>
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
              Departure defective arranging rapturous did believe him all had supported.
            </p>
            <p className="mb-2">
              <Link href="#" className="text-body-secondary text-primary-hover d-flex align-items-center">
                <BsTelephone className="me-2" />
                +1234 568 963
              </Link>
            </p>
            <p className="mb-0">
              <Link href="#" className="text-body-secondary text-primary-hover d-flex align-items-center">
                <BsEnvelope className="me-2" />
                example@gmail.com
              </Link>
            </p>
          </Col>

          <Col lg={8} className="ms-auto">
            <Row className="g-4">
              {footerLinks.map((item, idx) => (
                <Col xs={6} md={3} key={idx}>
                  <h5 className="text-white mb-2 mb-md-4">{item.title}</h5>
                  <Nav className="flex-column text-primary-hover">
                    {item.items.map((link, i) => (
                      <NavItem key={i}>
                        <NavLink className="text-body-secondary" href={link.link}>
                          {link.name}
                        </NavLink>
                      </NavItem>
                    ))}
                  </Nav>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        <Row className="mt-5">
          <h5 className="mb-2 text-white">Top Links</h5>
          <ul className="list-inline text-primary-hover lh-lg">
            {topLinks.map((item, idx) => (
              <li key={idx} className="list-inline-item me-2">
                <Link href={item.link ?? ''} className="text-body-secondary">
                  {item.name}&nbsp;
                </Link>
              </li>
            ))}
          </ul>
        </Row>

        <Row className="g-4 justify-content-between mt-0 mt-md-2">
          <Col sm={7} md={6} lg={4}>
            <h5 className="text-white mb-2">Payment &amp; Security</h5>
            <ul className="list-inline mb-0 mt-3">
              <li className="list-inline-item me-2">
                <Link href="#">
                  <Image src="/images/element/paypal.svg" className="h-30px me-1" alt="paypal" width={50} height={30} />
                </Link>
              </li>
              <li className="list-inline-item me-2">
                <Link href="#">
                  <Image src="/images/element/visa.svg" className="h-30px me-1" alt="visa" width={50} height={30} />
                </Link>
              </li>
              <li className="list-inline-item me-2">
                <Link href="#">
                  <Image src="/images/element/mastercard.svg" className="h-30px me-1" alt="mastercard" width={50} height={30} />
                </Link>
              </li>
              <li className="list-inline-item me-2">
                <Link href="#">
                  <Image src="/images/element/expresscard.svg" className="h-30px me-1" alt="expresscard" width={50} height={30} />
                </Link>
              </li>
            </ul>
          </Col>

          <Col sm={5} md={6} lg={3} className="text-sm-end">
            <h5 className="text-white mb-2">Follow us on</h5>
            <ul className="list-inline mb-0 mt-3 d-flex gap-2 justify-content-end">
              <li className="list-inline-item">
                <Button size="sm" className="shadow px-2 bg-facebook mb-0" href="#">
                  <FaFacebookF size={16} />
                </Button>
              </li>
              <li className="list-inline-item">
                <Button size="sm" className="shadow px-2 bg-instagram mb-0" href="#">
                  <FaInstagram size={16} />
                </Button>
              </li>
              <li className="list-inline-item">
                <Button size="sm" className="shadow px-2 bg-twitter mb-0" href="#">
                  <FaTwitter size={16} />
                </Button>
              </li>
              <li className="list-inline-item">
                <Button size="sm" className="shadow px-2 bg-linkedin mb-0" href="#">
                  <FaLinkedinIn size={16} />
                </Button>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="mt-4 mb-0" />

        <Row>
          <Container>
            <div className="d-lg-flex justify-content-between align-items-center py-3 text-center text-lg-start">
              <div className="text-body-secondary text-primary-hover">
                Copyrights ©2024 Booking. Build by{' '}
                <a href="https://www.stackbros.in/" target="_blank" className="text-body-secondary">
                  StackBros
                </a>.
              </div>
              <Nav className="nav mt-2 mt-lg-0">
                <ul className="list-inline text-primary-hover mx-auto mb-0">
                  <li className="list-inline-item me-0">
                    <NavLink className="text-body-secondary py-1" href="#">
                      Privacy policy
                    </NavLink>
                  </li>
                  <li className="list-inline-item me-0">
                    <NavLink className="text-body-secondary py-1" href="#">
                      Terms and conditions
                    </NavLink>
                  </li>
                  <li className="list-inline-item me-0">
                    <NavLink className="text-body-secondary py-1 pe-0" href="#">
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
