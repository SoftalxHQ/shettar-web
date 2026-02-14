'use client';

import { useToggle } from '@/app/hooks';
import { Alert, Button, Card, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalHeader, Row } from 'react-bootstrap';
import { BsExclamationOctagonFill, BsEyeFill, BsFullscreen, BsGeoAlt, BsPinMapFill, BsXLg } from 'react-icons/bs';
import { FaFacebookSquare, FaShareAlt, FaTwitterSquare } from 'react-icons/fa';
import { FaCopy, FaHeart, FaLinkedin } from 'react-icons/fa6';
import Link from 'next/link';
import GlightBox from '../GlightBox';
import { Skeleton } from '../';
import { useState } from 'react';

const HotelGallery = ({ hotel }: { hotel: any }) => {
  const { isOpen, toggle } = useToggle();
  const { isOpen: alertVisible, hide: hideAlert } = useToggle(true);
  const [isMapLoading, setIsMapLoading] = useState(true);

  if (!hotel) return null;

  const images = hotel.images_url || [];
  const mainImage = images[0] || '/images/gallery/14.jpg';
  const subImages = images.slice(1);

  const latitude = hotel.latitude || 0;
  const longitude = hotel.longitude || 0;
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <>
      <section className="py-0 pt-sm-5">
        <Container className="position-relative">
          <Row className="mb-3">
            <Col xs={12}>
              <div className="d-lg-flex justify-content-lg-between mb-1">
                <div className="mb-2 mb-lg-0">
                  <h1 className="fs-2">{hotel.name}</h1>
                  <p className="fw-bold mb-0 items-center flex-wrap text-muted">
                    <BsGeoAlt className=" me-2" />
                    {hotel.address}, {hotel.city}, {hotel.state}
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
                <strong className="alert-heading me-2">Notice:</strong>Please follow all health and safety guidelines during your stay.
              </span>
            </div>
            <Button variant="link" onClick={hideAlert} type="button" className="pb-0 pt-1 text-end">
              <BsXLg className="text-reset" />
            </Button>
          </Alert>
        </Container>
      </section>

      <section className="card-grid pt-0">
        <Container>
          <Row className="g-2">
            <Col md={6}>
              <GlightBox image={mainImage} data-glightbox="" data-gallery="hotel-gallery">
                <Card
                  className="card-grid-lg card-element-hover card-overlay-hover overflow-hidden"
                  style={{ backgroundImage: `url(${mainImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
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
                  <GlightBox image={subImages[0] || mainImage} data-glightbox="" data-gallery="hotel-gallery">
                    <Card
                      className="card-grid-sm card-element-hover card-overlay-hover overflow-hidden"
                      style={{ backgroundImage: `url(${subImages[0] || mainImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
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
                  <GlightBox image={subImages[1] || mainImage} data-glightbox="" data-gallery="hotel-gallery">
                    <Card
                      className="card-grid-sm card-element-hover card-overlay-hover overflow-hidden"
                      style={{ backgroundImage: `url(${subImages[1] || mainImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
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
                    style={{ backgroundImage: `url(${subImages[2] || mainImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
                  >
                    <div className="bg-overlay bg-dark opacity-7" />
                    <GlightBox image={subImages[2] || mainImage} data-glightbox="" data-gallery="hotel-gallery" className="stretched-link z-index-9" />
                    {subImages.slice(3).map((img: string, i: number) => (
                      <GlightBox key={i} image={img} data-glightbox="" data-gallery="hotel-gallery" />
                    ))}
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
        <div className="modal-body p-0 position-relative" style={{ height: '400px' }}>
          {isMapLoading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-body z-index-1">
              <Skeleton height="100%" width="100%" />
            </div>
          )}
          <iframe
            className="w-100"
            height={400}
            src={mapUrl}
            onLoad={() => setIsMapLoading(false)}
            style={{ border: 0 }}
            title="map"
            aria-hidden="false"
            tabIndex={0}
          />
        </div>
        <div className="modal-footer">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary mb-0 items-center"
          >
            <BsPinMapFill className="me-2" />
            View In Google Map
          </a>
        </div>
      </Modal>
    </>
  );
};

export default HotelGallery;
