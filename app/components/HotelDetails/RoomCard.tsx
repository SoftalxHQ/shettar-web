'use client';

import { useMemo } from 'react';
import TinySlider from '../TinySlider';
import { useToggle } from '@/app/hooks';
import { Button, Card, CardBody, CardHeader, Col, Modal, ModalBody, ModalHeader, Row } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { BsArrowLeft, BsArrowRight, BsEyeFill } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import { type TinySliderSettings } from 'tiny-slider';
import { type HotelsRoomType } from '@/app/data/hotel-details';
import { SkeletonImage } from '../';

const currency = '₦';

const amenities: string[] = ['Swimming Pool', 'Spa', 'Kids Play Area', 'Gym', 'Tv', 'Mirror', 'Ac', 'Slippers'];

const splitArray = <T,>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const RoomCard = ({ id, slug, features, images, name, price, sale, schemes }: HotelsRoomType) => {
  const { isOpen, toggle } = useToggle();

  const roomSliderSettings: TinySliderSettings = useMemo(() => ({
    autoplay: false,
    controls: true,
    autoplayButton: false,
    autoplayButtonOutput: false,
    controlsText: [renderToString(<BsArrowLeft size={16} />), renderToString(<BsArrowRight size={16} />)],
    arrowKeys: true,
    items: 1,
    nav: false,
    mouseDrag: true,
    slideBy: 'page',
    autoWidth: false,
  }), []);

  const chunk_size = 2;
  const amenitiesChunks = splitArray(amenities, chunk_size);
  const formattedPrice = typeof price === 'number' ? price : parseFloat(price || '0');

  return (
    <>
      <Card className="card-hover-shadow border-0 overflow-hidden mb-4 shadow-sm">
        <Row className="g-0">
          <Col md={4} className="position-relative">
            {sale && (
              <div className="position-absolute top-0 start-0 z-index-1 mt-3 ms-3">
                <div className="badge text-bg-danger">{sale}</div>
              </div>
            )}
            <div className="tiny-slider arrow-round arrow-xs arrow-dark h-100">
              <div className="position-absolute top-0 start-0 w-100 h-100 tns-height-fix">
                <TinySlider settings={roomSliderSettings} className="h-100">
                  {images.map((image, idx) => (
                    <div key={idx} className="h-100">
                      <SkeletonImage src={image} alt="Room image" className="w-100 h-100" height="100%" />
                    </div>
                  ))}
                </TinySlider>
              </div>
            </div>
            <style dangerouslySetInnerHTML={{
              __html: `
              .tns-height-fix .tns-outer,
              .tns-height-fix .tns-inner,
              .tns-height-fix .tns-ovh,
              .tns-height-fix .tns-slider {
                height: 100% !important;
              }
            `}} />
          </Col>
          <Col md={8}>
            <div className="card-body p-3 p-md-4">
              <h5 className="card-title mb-1">
                {name}
              </h5>
              <ul className="nav nav-divider mb-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="nav-item small text-muted">
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mb-3">
                {schemes ? (
                  schemes.map((scheme, idx) => (
                    <p key={idx} className="text-success mb-1 small fw-medium">
                      <FaCheckCircle className="me-2" />
                      {scheme}
                    </p>
                  ))
                ) : (
                  <p className="text-danger mb-1 small text-uppercase">Non Refundable</p>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <h3 className="fw-bold mb-0">
                    {currency}{formattedPrice.toLocaleString()}
                  </h3>
                  <span className="ms-1 small text-muted">/night</span>
                </div>
                <Button variant="primary" className="mb-0 px-4">
                  Select Room
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Modal show={isOpen} onHide={toggle}>
        <ModalHeader closeButton className="p-3">
          <h5 className="modal-title mb-0">
            {name}
          </h5>
        </ModalHeader>
        <ModalBody className="p-0">
          <Card className="bg-transparent p-3 border-0">
            <div className="tiny-slider arrow-round arrow-dark overflow-hidden rounded-2" style={{ height: '250px' }}>
              <TinySlider settings={roomSliderSettings} className="rounded-2 overflow-hidden">
                {images.map((image, idx) => (
                  <div key={idx}>
                    <SkeletonImage src={image} className="rounded-2 w-100" alt="Room detail" height="250px" />
                  </div>
                ))}
              </TinySlider>
            </div>
            <CardBody className="px-0">
              <p className="small">
                High-quality room with modern amenities, comfortable bedding, and a peaceful environment to ensure a pleasant stay.
              </p>
              <h5 className="mb-3">Room Amenities</h5>
              {amenitiesChunks.map((chunk, idx) => (
                <Row key={idx}>
                  {chunk.map((item, idx) => (
                    <Col key={idx} md={6}>
                      <ul className="list-group list-group-borderless mb-2">
                        <li className="list-group-item d-flex mb-0 p-0 align-items-center">
                          <FaCheckCircle className="text-success me-2" size={14} />
                          <span className="h6 fw-light mb-0 small">{item}</span>
                        </li>
                      </ul>
                    </Col>
                  ))}
                </Row>
              ))}
            </CardBody>
          </Card>
        </ModalBody>
      </Modal>
    </>
  );
};

export default RoomCard;
