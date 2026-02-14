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

const RoomCard = ({ id, features, images, name, price, sale, schemes }: HotelsRoomType) => {
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
    <Card className="shadow p-3">
      <Row className="g-4">
        <Col md={5} className="position-relative">
          {sale && (
            <div className="position-absolute top-0 start-0 z-index-1 mt-3 ms-4">
              <div className="badge text-bg-danger">{sale}</div>
            </div>
          )}
          <div className="tiny-slider arrow-round arrow-xs arrow-dark overflow-hidden rounded-2" style={{ height: '220px' }}>
            <TinySlider settings={roomSliderSettings}>
              {images.map((image, idx) => (
                <div key={idx}>
                  <SkeletonImage src={image} alt="Room image" className="w-100" height="220px" />
                </div>
              ))}
            </TinySlider>
          </div>
          <Link href="#" className="btn btn-link text-decoration-underline p-0 mb-0 mt-1 items-center" onClick={(e) => { e.preventDefault(); toggle(); }}>
            <BsEyeFill className=" me-1" />
            View more details
          </Link>
        </Col>
        <Col md={7}>
          <div className="card-body d-flex flex-column h-100 p-0">
            <h5 className="card-title">
              {name}
            </h5>
            <ul className="nav nav-divider mb-2">
              {features.map((feature, idx) => (
                <li key={idx} className="nav-item small">
                  {feature}
                </li>
              ))}
            </ul>

            {schemes ? (
              schemes.map((scheme, idx) => (
                <p key={idx} className="text-success mb-1 small">
                  <FaCheckCircle className="me-2" />
                  {scheme}
                </p>
              ))
            ) : (
              <p className="text-danger mb-3">Non Refundable</p>
            )}

            <div className="d-sm-flex justify-content-sm-between align-items-center mt-auto">
              <div className="d-flex align-items-center">
                <h5 className="fw-bold mb-0 me-1">
                  {currency}
                  {formattedPrice.toLocaleString()}
                </h5>
                <span className="mb-0 me-2 small">/night</span>
              </div>
              <div className="mt-3 mt-sm-0">
                <Button variant="primary" size="sm" className="mb-0">
                  Select Room
                </Button>
              </div>
            </div>
          </div>

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
        </Col>
      </Row>
    </Card>
  );
};

export default RoomCard;
