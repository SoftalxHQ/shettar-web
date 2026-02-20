'use client';

import { Button, Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Image, Row } from 'react-bootstrap';
import { BsGeoAlt } from 'react-icons/bs';
import { FaCopy, FaFacebookSquare, FaHeart, FaLinkedin, FaShareAlt, FaStar, FaStarHalfAlt, FaTwitterSquare } from 'react-icons/fa';
import Link from 'next/link';
import { type WishCardType } from '@/app/data/wishlist';
import { currency } from '@/app/states';

interface WishCardProps {
  wishCard: WishCardType & { id?: number; slug?: string };
  onRemove?: () => void;
}

const WishCard = ({ wishCard, onRemove }: WishCardProps) => {
  const { address, image, name, price, rating } = wishCard;

  return (
    <Card className="shadow p-2 border-0">
      <Row className="g-0">
        <Col md={3}>
          <Image src={image} className="card-img rounded-2" alt="Card image" width={300} height={225} />
        </Col>
        <Col md={9}>
          <CardBody className="py-md-2 d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-center">
              <ul className="list-inline small mb-1">
                {Array.from(new Array(Math.floor(rating))).map((_star, idx) => (
                  <li key={idx} className="list-inline-item me-1 small">
                    <FaStar size={16} className="text-warning" />
                  </li>
                ))}
                {!Number.isInteger(rating) && (
                  <li className="list-inline-item me-1 small">
                    <FaStarHalfAlt size={15} className="text-warning" />
                  </li>
                )}
                {rating < 5 &&
                  Array.from(new Array(5 - Math.ceil(rating))).map((_val, idx) => (
                    <li key={idx} className="list-inline-item me-1 small">
                      <FaStar size={16} className="text-muted" />
                    </li>
                  ))}
              </ul>
              <ul className="list-inline mb-0 items-center gap-1 d-flex">
                <li className="list-inline-item">
                  <Button
                    size="sm"
                    className="btn-round btn-danger mb-0 flex-centered"
                    onClick={(e) => {
                      e.preventDefault();
                      onRemove?.();
                    }}
                  >
                    <FaHeart size={10} className="fa-fw" />
                  </Button>
                </li>
                <Dropdown className="list-inline-item">
                  <DropdownToggle as={Link} href="" className="arrow-none btn btn-sm btn-round btn-light mb-0 flex-centered">
                    <FaShareAlt size={10} />
                  </DropdownToggle>
                  <DropdownMenu align="end" className="min-w-auto shadow rounded border-0">
                    <DropdownItem href="">
                      <FaTwitterSquare className="me-2 text-primary" />
                      Twitter
                    </DropdownItem>
                    <DropdownItem href="">
                      <FaFacebookSquare className="me-2 text-primary" />
                      Facebook
                    </DropdownItem>
                    <DropdownItem href="">
                      <FaLinkedin className="me-2 text-primary" />
                      LinkedIn
                    </DropdownItem>
                    <DropdownItem href="">
                      <FaCopy className="me-2 text-primary" />
                      Copy link
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </ul>
            </div>
            <h5 className="card-title mb-1">
              <Link href={`/hotel/${wishCard.slug || wishCard.id}`}>{name}</Link>
            </h5>
            <small className="items-center">
              <BsGeoAlt className=" me-2" />
              {address}
            </small>
            <div className="d-sm-flex justify-content-sm-between align-items-center mt-3 mt-md-auto">
              <div className="d-flex align-items-center">
                <h5 className="fw-bold mb-0 me-1">
                  {currency}
                  {price}
                </h5>
                <span className="mb-0 me-2 small">/day</span>
              </div>
              <div className="mt-3 mt-sm-0">
                <Link href={`/hotel/${wishCard.slug || wishCard.id}`} className="btn btn-sm btn-dark w-100 mb-0">
                  View hotel
                </Link>
              </div>
            </div>
          </CardBody>
        </Col>
      </Row>
    </Card>
  );
};

export default WishCard;
