'use client';

import { Button, Card, CardBody, Col, Image, Row } from 'react-bootstrap';
import { BsArrowRight } from 'react-icons/bs';
import { FaStarHalfAlt } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import Link from 'next/link';
import Sticky from 'react-sticky-el';
import useViewPort from '@/app/hooks/useViewPort';

const currency = '₦';

const PriceOverView = ({ hotel }: { hotel: any }) => {
  const { width } = useViewPort();

  if (!hotel) return null;

  const averageRating = hotel.average_rating || 0;
  const reviewsCount = hotel.reviews_count || hotel.reviews?.length || 0;
  const startingPrice = typeof hotel.starting_from === 'number' ? hotel.starting_from : parseFloat(hotel.starting_from || '0');
  const oldPrice = typeof hotel.old_price === 'number' ? hotel.old_price : parseFloat(hotel.old_price || '0');

  return (
    <Sticky
      disabled={width <= 1199}
      topOffset={100}
      bottomOffset={0}
      boundaryElement="aside"
      hideOnBoundaryHit={false}
      stickyStyle={{ transition: '0.2s all linear' }}>
      <Card as={CardBody} className="border shadow-sm">
        <div className="d-sm-flex justify-content-sm-between align-items-center mb-3">
          <div>
            <span>Price Start at</span>
            <div className="d-flex align-items-center">
              <h4 className="card-title mb-0 me-2">{currency}{startingPrice > 0 ? startingPrice.toLocaleString() : '---'}</h4>
              {oldPrice > startingPrice && (
                <span className="text-decoration-line-through small text-muted">{currency}{oldPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div className="text-sm-end">
            <h6 className="fw-normal mb-0">per night</h6>
            <small className="text-muted">+ {currency}0 taxes &amp; fees</small>
          </div>
        </div>
        <ul className="list-inline mb-2 items-center">
          <li className="list-inline-item me-1 h6 fw-light mb-0">
            {averageRating}
          </li>
          {Array.from(new Array(Math.floor(averageRating))).map((_val, idx) => (
            <li className="list-inline-item me-1 small" key={idx}>
              <FaStar size={16} className="text-warning" />
            </li>
          ))}
          {averageRating % 1 !== 0 && (
            <li className="list-inline-item me-0 small">
              <FaStarHalfAlt className="text-warning" />
            </li>
          )}
          <li className="list-inline-item ms-2 small">({reviewsCount} reviews)</li>
        </ul>
        <p className="h6 fw-light mb-4 items-center">
          <BsArrowRight className=" me-2 text-primary" />
          Best price guaranteed
        </p>
        <div className="d-grid">
          <a href="#room-options">
            <Button variant="primary" size="lg" className="mb-0 w-100">
              View {hotel.available_room_types?.length || 0} Room Options
            </Button>
          </a>
        </div>
      </Card>
    </Sticky>
  );
};

export default PriceOverView;
