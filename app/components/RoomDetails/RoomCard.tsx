'use client';

import { useMemo } from 'react';
import { GlightBox, SkeletonImage, TinySlider } from '@/app/components';
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { renderToString } from 'react-dom/server';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { FaSquare } from 'react-icons/fa6';
import { type HotelRoomType } from '@/app/data/room-details';
import { type TinySliderSettings } from 'tiny-slider';

const currency = '₦';

const RoomCard = ({ id, slug, images, name, price, sqfeet, hotelSlug, isSelected, amenities, available_rooms }: HotelRoomType & { hotelSlug?: string, isSelected?: boolean }) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.toString();

  const baseRoomLink = hotelSlug
    ? `/hotel/${hotelSlug}/roomtype/${slug || id}`
    : `/hotel/booking?room_type=${slug || id}`;

  const roomLink = `${baseRoomLink}${searchQuery ? (baseRoomLink.includes('?') ? `&${searchQuery}` : `?${searchQuery}`) : ''}`;

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

  // Process active amenities
  const activeAmenities = Object.entries(amenities || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

  const displayAmenities = activeAmenities.slice(0, 5);
  if (activeAmenities.length > 5) {
    displayAmenities.push(`+${activeAmenities.length - 5} more`);
  }

  const requestedRooms = parseInt(searchParams.get('rooms') || '1');
  const isAvailable = (available_rooms ?? 0) >= requestedRooms;

  return (
    <Card className={`card-hover-shadow border-0 overflow-hidden shadow-sm ${isSelected ? 'border-primary border-2' : 'border'}`}>
      <Row className="g-0">
        <Col md={4} className="position-relative">
          <div className="tiny-slider arrow-round arrow-xs arrow-dark h-100">
            <TinySlider settings={roomSliderSettings} className="h-100">
              {images.map((image, idx) => (
                <div key={idx} className="h-100">
                  <SkeletonImage src={image} alt={name} className="w-100 h-100" height="200px" />
                </div>
              ))}
            </TinySlider>
          </div>
        </Col>
        <Col md={8}>
          <CardBody className="d-flex flex-column h-100 p-3 p-md-4">
            <h5 className="card-title mb-1">{name}</h5>

            <ul className="nav nav-divider small mb-2">
              <li className="nav-item mb-0 items-center">
                <FaSquare className="me-1 opacity-50" size={12} />
                {sqfeet} sq.ft
              </li>
              {displayAmenities.map((amenity, idx) => (
                <li key={idx} className="nav-item mb-0 items-center">
                  {amenity}
                </li>
              ))}
            </ul>

            <div className="mb-3">
              <p className={`mb-0 small fw-bold ${isAvailable ? 'text-primary' : 'text-danger'}`}>
                {available_rooms || 0} rooms available
                {!isAvailable && <span className="ms-2">(Insufficient for your search)</span>}
              </p>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-auto">
              <div className="d-flex align-items-center">
                <h4 className="fw-bold mb-0 text-dark">
                  {currency}{price.toLocaleString()}
                </h4>
                <span className="ms-1 small opacity-50">/night</span>
              </div>
              {isSelected ? (
                <div className="badge bg-success-soft text-success py-2 px-3 border border-success border-opacity-25 rounded-pill">
                  <span className="h6 mb-0">Current Selection</span>
                </div>
              ) : (
                isAvailable ? (
                  <Link href={roomLink}>
                    <Button size="sm" variant="dark" className="mb-0 px-3 shadow-sm rounded-2">
                      Select Room
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" variant="secondary" className="mb-0 px-3 shadow-sm rounded-2" disabled>
                    Sold Out
                  </Button>
                )
              )}
            </div>
          </CardBody>
        </Col>
      </Row>
    </Card>
  );
};

export default RoomCard;
