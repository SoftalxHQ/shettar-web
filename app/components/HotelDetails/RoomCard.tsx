'use client';

import TinySlider from '../TinySlider';
import { useToggle } from '@/app/hooks';
import { Button, Card, CardBody, CardHeader, Col, Image, Modal, ModalBody, ModalHeader, Row } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { BsArrowLeft, BsArrowRight, BsEyeFill } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import { type TinySliderSettings } from 'tiny-slider';
import { type HotelsRoomType } from '@/app/data/hotel-details';

const currency = '$';

const amenities: string[] = ['Swimming Pool', 'Spa', 'Kids Play Area', 'Gym', 'Tv', 'Mirror', 'Ac', 'Slippers'];

const splitArray = <T,>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const RoomCard = ({ features, images, name, price, sale, schemes }: HotelsRoomType) => {
  const { isOpen, toggle } = useToggle();

  const roomSliderSettings: TinySliderSettings = {
    nested: 'inner',
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
  };

  const chunk_size = 2;
  const amenitiesChunks = splitArray(amenities, chunk_size);

  return (
    <Card className="shadow p-3">
      <Row className="g-4">
        <Col md={5} className="position-relative">
          {sale && (
            <div className="position-absolute top-0 start-0 z-index-1 mt-3 ms-4">
              <div className="badge text-bg-danger">{sale}</div>
            </div>
          )}
          <div className="tiny-slider arrow-round arrow-xs arrow-dark overflow-hidden rounded-2">
            <TinySlider settings={roomSliderSettings}>
              {images.map((image, idx) => (
                <div key={idx}>
                  <Image src={image} alt="Card image" className="w-100" />
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
              <Link href="#">{name}</Link>
            </h5>
            <ul className="nav nav-divider mb-2">
              {features.map((feature, idx) => (
                <li key={idx} className="nav-item">
                  {feature}
                </li>
              ))}
            </ul>

            {schemes ? (
              schemes.map((scheme, idx) => (
                <p key={idx} className="text-success mb-0">
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
                  {price}
                </h5>
                <span className="mb-0 me-2">/day</span>
                <span className="text-decoration-line-through mb-0">{currency}1000</span>
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
                Room detail
              </h5>
            </ModalHeader>
            <ModalBody className="p-0">
              <Card className="bg-transparent p-3 border-0">
                <div className="tiny-slider arrow-round arrow-dark overflow-hidden rounded-2">
                  <TinySlider settings={roomSliderSettings} className="rounded-2 overflow-hidden">
                    {images.map((image, idx) => (
                      <div key={idx}>
                        <Image src={image} className="rounded-2 w-100" alt="Card image" />
                      </div>
                    ))}
                  </TinySlider>
                </div>
                <CardHeader className="bg-transparent pb-0">
                  <h3 className="card-title mb-0">Deluxe Pool View</h3>
                </CardHeader>
                <CardBody>
                  <p>
                    Club rooms are well furnished with air conditioner, 32 inch LCD television and a mini bar. They have attached bathroom with
                    showerhead and hair dryer and 24 hours supply of hot and cold running water. Complimentary wireless internet access is available.
                    Additional amenities include bottled water, a safe and a desk.
                  </p>
                  <h5 className="mb-0">Amenities</h5>
                  {amenitiesChunks.map((chunk, idx) => (
                    <Row key={idx}>
                      {chunk.map((item, idx) => (
                        <Col key={idx} md={6}>
                          <ul className="list-group list-group-borderless mt-2 mb-0">
                            <li className="list-group-item d-flex mb-0">
                              <FaCheckCircle className="text-success me-2" />
                              <span className="h6 fw-light mb-0">{item}</span>
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
