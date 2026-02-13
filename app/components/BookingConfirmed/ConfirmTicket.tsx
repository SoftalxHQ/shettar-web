'use client';

import { Card, CardBody, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import { BsCalendar, BsCurrencyDollar, BsFilePdf, BsPeople, BsPerson, BsShare, BsWallet2 } from 'react-icons/bs';
import { FaCopy, FaLinkedin } from 'react-icons/fa6';
import { FaFacebookSquare, FaTwitterSquare } from 'react-icons/fa';
import Image from 'next/image';
import { currency } from '@/app/states';

const ConfirmTicket = () => {
  return (
    <section className="pt-4">
      <Container>
        <Row>
          <Col md={10} xl={8} className="mx-auto">
            <Card className="shadow">
              <div className="position-relative w-100" style={{ height: '300px' }}>
                <Image
                  src="/images/gallery/04.jpg"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-top"
                  alt="Booking Confirmed"
                />
              </div>
              <CardBody className="text-center p-4">
                <h1 className="card-title fs-3">🎊 Congratulations! 🎊</h1>
                <p className="lead mb-3">Your trip has been booked</p>
                <h5 className="text-primary mb-4">Beautiful Bali with Malaysia</h5>
                <Row className="justify-content-between text-start mb-4">
                  <Col lg={5}>
                    <ul className="list-group list-group-borderless">
                      <li className="list-group-item d-sm-flex justify-content-between align-items-center">
                        <span className="mb-0 items-center">
                          <BsPerson className=" fa-fw me-2" />
                          Booking ID:
                        </span>
                        <span className="h6 fw-normal mb-0">BS-58678</span>
                      </li>
                      <li className="list-group-item d-sm-flex justify-content-between align-items-center">
                        <span className="mb-0 items-center">
                          <BsPerson className=" fa-fw me-2" />
                          Booked by:
                        </span>
                        <span className="h6 fw-normal mb-0">Frances Guerrero</span>
                      </li>
                      <li className="list-group-item d-sm-flex justify-content-between align-items-center">
                        <span className="mb-0 items-center">
                          <BsWallet2 className=" fa-fw me-2" />
                          Payment Method:
                        </span>
                        <span className="h6 fw-normal mb-0">Credit card</span>
                      </li>
                      <li className="list-group-item d-sm-flex justify-content-between align-items-center">
                        <span className="mb-0 items-center">
                          <BsCurrencyDollar className=" fa-fw me-2" />
                          Total Price:
                        </span>
                        <span className="h6 fw-normal mb-0">{currency}1200</span>
                      </li>
                    </ul>
                  </Col>
                  <Col lg={5}>
                    <ul className="list-group list-group-borderless">
                      <li className="list-group-item d-sm-flex justify-content-between align-items-center">
                        <span className="mb-0 items-center">
                          <BsCalendar className=" fa-fw me-2" />
                          Date:
                        </span>
                        <span className="h6 fw-normal mb-0">29 July 2026</span>
                      </li>
                      <li className="list-group-item d-sm-flex justify-content-between align-items-center">
                        <span className="mb-0 items-center">
                          <BsCalendar className=" fa-fw me-2" />
                          Tour Date:
                        </span>
                        <span className="h6 fw-normal mb-0">15 Aug 2026</span>
                      </li>
                      <li className="list-group-item d-sm-flex justify-content-between align-items-center">
                        <span className="mb-0 items-center">
                          <BsPeople className=" fa-fw me-2" />
                          Guests:
                        </span>
                        <span className="h6 fw-normal mb-0">3</span>
                      </li>
                    </ul>
                  </Col>
                </Row>
                <div className="d-sm-flex justify-content-sm-end d-grid gap-2">
                  <Dropdown className="me-sm-2 mb-2 mb-sm-0">
                    <DropdownToggle as="button" type="button" className="arrow-none btn btn-light mb-0 w-100 flex-centered" id="shareDropdown" role="button">
                      <BsShare className=" me-2" />
                      Share
                    </DropdownToggle>
                    <DropdownMenu align="end" className="min-w-auto shadow rounded">
                      <DropdownItem className="flex-centered justify-content-start">
                        <FaTwitterSquare className="me-2" />
                        Twitter
                      </DropdownItem>
                      <DropdownItem className="flex-centered justify-content-start">
                        <FaFacebookSquare className="me-2" />
                        Facebook
                      </DropdownItem>
                      <DropdownItem className="flex-centered justify-content-start">
                        <FaLinkedin className="me-2" />
                        LinkedIn
                      </DropdownItem>
                      <DropdownItem className="flex-centered justify-content-start">
                        <FaCopy className="me-2" />
                        Copy link
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <button className="btn btn-primary mb-0 flex-centered w-100 w-sm-auto">
                    <BsFilePdf className=" me-2" />
                    Download PDF
                  </button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ConfirmTicket;
