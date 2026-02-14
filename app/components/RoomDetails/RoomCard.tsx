'use client';

import { GlightBox } from '@/app/components';
import { Button, Card, CardBody, Col, Image, Row } from 'react-bootstrap';
import Link from 'next/link';
import { BsArrowRight } from 'react-icons/bs';
import { FaBed, FaSquare, FaTableCellsLarge } from 'react-icons/fa6';
import { type HotelRoomType } from '@/app/data/room-details';

const currency = '₦';

const RoomCard = ({ images, name, price, sqfeet }: HotelRoomType) => {
  return (
    <Card className="border bg-transparent p-3">
      <Row className="g-3 g-md-4">
        <Col md={4}>
          <div className="position-relative">
            <Image src={images[0]} className="card-img" alt={name} />
            <div className="card-img-overlay">
              <GlightBox image={images[0]} className="badge bg-dark stretched-link" data-glightbox="" data-gallery="gallery">
                {images.length} Photos <BsArrowRight />
              </GlightBox>
            </div>

            {(images ?? []).slice(1).map((img, idx) => (
              <GlightBox key={idx} image={img} className="stretched-link z-index-9" data-glightbox="" data-gallery="gallery" />
            ))}
          </div>
        </Col>
        <Col md={8}>
          <CardBody className="d-flex flex-column p-0 h-100">
            <h5 className="card-title">{name}</h5>
            <ul className="nav small nav-divider mb-0">
              <li className="nav-item mb-0 items-center">
                <FaSquare className="me-1" />
                {sqfeet} sq.ft
              </li>
              <li className="nav-item mb-0 items-center">
                <FaTableCellsLarge className="me-1" />
                City view
              </li>
              <li className="nav-item mb-0 items-center">
                <FaBed className="me-1" />
                King Bed
              </li>
            </ul>
            <div className="d-flex justify-content-between align-items-center mt-2 mt-md-auto">
              <div className="d-flex text-success">
                <h6 className="h5 mb-0 text-success">
                  {currency}
                  {price}
                </h6>
                <span className="fw-light">/per night</span>
              </div>
              <Link href="/hotels/booking">
                <Button size="sm" variant="dark" className="mb-0">
                  Select room
                </Button>
              </Link>
            </div>
          </CardBody>
        </Col>
      </Row>
    </Card>
  );
};

export default RoomCard;
