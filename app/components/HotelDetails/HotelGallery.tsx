'use client';

import { useToggle } from '@/app/hooks';
import { Alert, Button, Card, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalHeader, Row } from 'react-bootstrap';
import { BsExclamationOctagonFill, BsEyeFill, BsFullscreen, BsGeoAlt, BsPinMapFill, BsXLg } from 'react-icons/bs';
import { FaFacebookSquare, FaShareAlt, FaTwitterSquare } from 'react-icons/fa';
import { FaCopy, FaHeart, FaLinkedin } from 'react-icons/fa6';
import Link from 'next/link';
import GlightBox from '../GlightBox';

const HotelGallery = () => {
  const { isOpen, toggle } = useToggle();
  const { isOpen: alertVisible, hide: hideAlert } = useToggle(true);

  return (
    <>
      <section className="py-0 pt-sm-5">
        <Container className="position-relative">
          <Row className="mb-3">
            <Col xs={12}>
              <div className="d-lg-flex justify-content-lg-between mb-1">
                <div className="mb-2 mb-lg-0">
                  <h1 className="fs-2">Courtyard by Marriott New York </h1>
                  <p className="fw-bold mb-0 items-center flex-wrap">
                    <BsGeoAlt className=" me-2" />
                    5855 W Century Blvd, Los Angeles - 90045
                    <Link
                      href="#"
                      onClick={(e) => { e.preventDefault(); toggle(); }}
                      className="ms-3 text-decoration-underline items-center"
                    >
                      <BsEyeFill className="me-1" />
                      View On Map
                    </Link>
                  </p>
                </div>
                <ul className="list-inline text-end">
                  <li className="list-inline-item">
                    <Button variant="light" size="sm" className="px-2">
                      <FaHeart className="fa-fw" />
                    </Button>
                  </li>
                  <Dropdown className="list-inline-item dropdown">
                    <DropdownToggle
                      className="btn btn-sm btn-light px-2 arrow-none"
                      role="button"
                      id="dropdownShare"
                    >
                      <FaShareAlt className="fa-fw" />
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end min-w-auto shadow rounded" aria-labelledby="dropdownShare">
                      <DropdownItem href="#">
                        <FaTwitterSquare className="me-2" />
                        Twitter
                      </DropdownItem>
                      <DropdownItem href="#">
                        <FaFacebookSquare className="me-2" />
                        Facebook
                      </DropdownItem>
                      <DropdownItem href="#">
                        <FaLinkedin className="me-2" />
                        LinkedIn
                      </DropdownItem>
                      <DropdownItem href="#">
                        <FaCopy className="me-2" />
                        Copy link
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </ul>
              </div>
            </Col>
          </Row>
          <Alert
            show={alertVisible}
            variant="danger"
            className="d-flex justify-content-between align-items-center rounded-3 fade show mb-4 mb-0 pe-2 py-3"
            role="alert"
          >
            <div className="items-center">
              <span className="alert-heading h5 mb-0 me-2">
                <BsExclamationOctagonFill />
              </span>
              <span>
                <strong className="alert-heading me-2">Covid Policy:</strong>You may require to present an RT-PCR negative test report at the hotel
              </span>
            </div>
            <Button variant="link" onClick={hideAlert} type="button" className="pb-0 pt-1 text-end">
              <BsXLg className=" text-dark" />
            </Button>
          </Alert>
        </Container>
      </section>

      <section className="card-grid pt-0">
        <Container>
          <Row className="g-2">
            <Col md={6}>
              <GlightBox image="/images/gallery/14.jpg" data-glightbox="" data-gallery="hotel-gallery">
                <Card
                  className="card-grid-lg card-element-hover card-overlay-hover overflow-hidden"
                  style={{ backgroundImage: `url(/images/gallery/14.jpg)`, backgroundPosition: 'center left', backgroundSize: 'cover' }}
                >
                  <div className="hover-element position-absolute w-100 h-100">
                    <BsFullscreen
                      size={28}
                      className=" fs-6 text-white position-absolute top-50 start-50 translate-middle bg-dark rounded-1 p-2 lh-1"
                    />
                  </div>
                </Card>
              </GlightBox>
            </Col>
            <Col md={6}>
              <Row className="g-2">
                <Col xs={12}>
                  <GlightBox image="/images/gallery/13.jpg" data-glightbox="" data-gallery="hotel-gallery">
                    <Card
                      className="card-grid-sm card-element-hover card-overlay-hover overflow-hidden"
                      style={{ backgroundImage: `url(/images/gallery/13.jpg)`, backgroundPosition: 'center left', backgroundSize: 'cover' }}
                    >
                      <div className="hover-element position-absolute w-100 h-100">
                        <BsFullscreen
                          size={28}
                          className=" fs-6 text-white position-absolute top-50 start-50 translate-middle bg-dark rounded-1 p-2 lh-1"
                        />
                      </div>
                    </Card>
                  </GlightBox>
                </Col>
                <Col md={6}>
                  <GlightBox image="/images/gallery/12.jpg" data-glightbox="" data-gallery="hotel-gallery">
                    <Card
                      className="card-grid-sm card-element-hover card-overlay-hover overflow-hidden"
                      style={{ backgroundImage: `url(/images/gallery/12.jpg)`, backgroundPosition: 'center left', backgroundSize: 'cover' }}
                    >
                      <div className="hover-element position-absolute w-100 h-100">
                        <BsFullscreen
                          size={28}
                          className="bifs-6 text-white position-absolute top-50 start-50 translate-middle bg-dark rounded-1 p-2 lh-1"
                        />
                      </div>
                    </Card>
                  </GlightBox>
                </Col>
                <Col md={6}>
                  <Card
                    className="card-grid-sm overflow-hidden"
                    style={{ backgroundImage: `url(/images/gallery/11.jpg)`, backgroundPosition: 'center left', backgroundSize: 'cover' }}
                  >
                    <div className="bg-overlay bg-dark opacity-7" />
                    <GlightBox image="/images/gallery/11.jpg" data-glightbox="" data-gallery="hotel-gallery" className="stretched-link z-index-9" />
                    <GlightBox image="/images/gallery/15.jpg" data-glightbox="" data-gallery="hotel-gallery" />
                    <GlightBox image="/images/gallery/16.jpg" data-glightbox="" data-gallery="hotel-gallery" />
                    <div className="card-img-overlay d-flex h-100 w-100">
                      <h6 className="card-title m-auto fw-light text-decoration-underline">
                        <Link href="#" onClick={(e) => e.preventDefault()} className="text-white">
                          View all
                        </Link>
                      </h6>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      <Modal size="lg" centered show={isOpen} onHide={toggle} className="fade">
        <ModalHeader closeButton>
          <h5 className="modal-title">
            View Our Hotel Location
          </h5>
        </ModalHeader>
        <div className="modal-body p-0">
          <iframe
            className="w-100"
            height={400}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878428698!3d40.74076684379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sGoogle!5e0!3m2!1sen!2sin!4v1586000412513!5m2!1sen!2sin"
            style={{ border: 0 }}
            title="map"
            aria-hidden="false"
            tabIndex={0}
          />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-sm btn-primary mb-0 items-center">
            <BsPinMapFill className="me-2" />
            View In Google Map
          </button>
        </div>
      </Modal>
    </>
  );
};

export default HotelGallery;
