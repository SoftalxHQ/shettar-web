'use client';

import { Button, Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Image, Row } from 'react-bootstrap';
import { BsGeoAlt } from 'react-icons/bs';
import { FaCopy, FaFacebookSquare, FaHeart, FaLinkedin, FaShareAlt, FaStar } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Link from 'next/link';
import { type WishCardType } from '@/app/data/wishlist';
import { currency } from '@/app/states';
import Skeleton from '../../Skeleton';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface WishCardProps {
  wishCard: WishCardType & { id?: number; slug?: string };
  onRemove?: () => void;
}

const WishCard = ({ wishCard, onRemove }: WishCardProps) => {
  const { address, image, name, price, rating } = wishCard;
  const [isImageLoading, setIsImageLoading] = useState(true);
  const hotelPath = `/hotel/${wishCard.slug || wishCard.id}`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${hotelPath}` : hotelPath;

  return (
    <Card className="shadow p-2 border-0">
      <Row className="g-0">
        <Col md={3} className="position-relative">
          {isImageLoading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 p-2">
              <Skeleton height="100%" className="rounded-2" />
            </div>
          )}
          <Image
            src={image}
            className={`card-img rounded-2 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ transition: 'opacity 0.3s ease-in-out', objectFit: 'cover' }}
            alt="Card image"
            width={300}
            height={225}
            onLoad={() => setIsImageLoading(false)}
          />
        </Col>
        <Col md={9}>
          <CardBody className="py-md-2 d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-1">
                <FaStar size={14} className="text-warning" />
                <span className="small fw-bold text-body">{parseFloat(String(rating || 0)).toFixed(1)}</span>
              </div>
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
                  <DropdownToggle as="button" type="button" className="arrow-none btn btn-sm btn-round btn-light mb-0 flex-centered border-0">
                    <FaShareAlt size={10} />
                  </DropdownToggle>
                  <DropdownMenu align="end" className="min-w-auto shadow rounded border-0">
                    <DropdownItem onClick={() => {
                      const text = `Check out ${name} on Shettar!`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                    }}>
                      <FaXTwitter className="me-2" />
                      X (Twitter)
                    </DropdownItem>
                    <DropdownItem onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                    }}>
                      <FaFacebookSquare className="me-2 text-primary" />
                      Facebook
                    </DropdownItem>
                    <DropdownItem onClick={() => {
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                    }}>
                      <FaLinkedin className="me-2 text-primary" />
                      LinkedIn
                    </DropdownItem>
                    <DropdownItem onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                        toast.success('Link copied to clipboard!');
                      } catch {
                        toast.error('Could not copy link');
                      }
                    }}>
                      <FaCopy className="me-2" />
                      Copy link
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </ul>
            </div>
            <h5 className="card-title mb-1">
              <Link href={hotelPath} className="text-body text-decoration-none">{name}</Link>
            </h5>
            <small className="items-center text-secondary">
              <BsGeoAlt className=" me-2" />
              {address}
            </small>
            <div className="d-sm-flex justify-content-sm-between align-items-center mt-3 mt-md-auto">
              <div className="d-flex align-items-center">
                <h5 className="fw-bold mb-0 me-1 text-body">
                  {currency}
                  {price}
                </h5>
                <span className="mb-0 me-2 small text-secondary">/night</span>
              </div>
              <div className="mt-3 mt-sm-0">
                <Link href={hotelPath} className="btn btn-sm btn-primary w-100 mb-0">
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
