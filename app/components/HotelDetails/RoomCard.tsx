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
import { useSearchParams } from 'next/navigation';

const currency = '₦';

const amenities: string[] = ['Swimming Pool', 'Spa', 'Kids Play Area', 'Gym', 'Tv', 'Mirror', 'Ac', 'Slippers'];

const splitArray = <T,>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const RoomCard = ({ id, slug, features, images, name, price, sale, schemes, hotelSlug, allAmenities, available_rooms, ...props }: HotelsRoomType & { hotelSlug?: string, allAmenities?: string[], daily_availability?: Record<string, number> }) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.toString();

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

  const formattedPrice = typeof price === 'number' ? price : parseFloat(price || '0');

  // Build the link based on hotelSlug
  const roomIdentifier = slug && slug !== "" ? slug : id;
  const baseRoomLink = hotelSlug
    ? `/hotel/${hotelSlug}/roomtype/${roomIdentifier}`
    : `/hotel/room/${roomIdentifier}`;
  const roomLink = `${baseRoomLink}${searchQuery ? `?${searchQuery}` : ''}`;

  const requestedRooms = parseInt(searchParams.get('rooms') || '1');
  const actualAvailableRooms = available_rooms ?? 0;
  const isAvailable = actualAvailableRooms >= requestedRooms;

  // Calculate sold out dates from daily_availability
  const dailyAvailability = (props as any).daily_availability || {};
  const endDateStr = searchParams.get('end_date');
  const endDate = endDateStr ? new Date(endDateStr) : null;

  const soldOutDates = Object.entries(dailyAvailability)
    .filter(([date, count]) => {
      const d = new Date(date);
      // Only count if it's before the check-out date
      if (endDate && d >= endDate) return false;
      return (count as number) < requestedRooms;
    })
    .map(([date, _]) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

  return (
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
                <li key={idx} className="nav-item small opacity-75">
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

            <div className="mb-3">
              <p className={`mb-0 small fw-bold ${isAvailable ? 'text-primary' : 'text-danger'}`}>
                {actualAvailableRooms === 0 ? (
                  <>Sold Out {soldOutDates.length > 0 && `on ${soldOutDates.join(', ')}`}</>
                ) : actualAvailableRooms < requestedRooms ? (
                  <>Only {actualAvailableRooms} rooms available (Insufficient for your search)</>
                ) : (
                  <>
                    <FaCheckCircle className="me-1" /> {actualAvailableRooms} rooms available
                  </>
                )}
              </p>
              {!isAvailable && soldOutDates.length > 0 && (
                <p className="text-muted small mb-0 mt-1">
                  Try adjusting your dates to skip these fully booked nights.
                </p>
              )}
              {!isAvailable && actualAvailableRooms > 0 && actualAvailableRooms < requestedRooms && (
                <p className="text-muted small mb-0 mt-1">
                  Try reducing the number of rooms in your search.
                </p>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <h3 className="fw-bold mb-0">
                  {currency}{formattedPrice.toLocaleString()}
                </h3>
                <span className="ms-1 small opacity-50">/night</span>
              </div>
              {isAvailable ? (
                <Link href={roomLink} className="btn btn-primary mb-0 px-4 shadow-sm">
                  View Room
                </Link>
              ) : (
                <Button variant="secondary" className="mb-0 px-4 shadow-sm" disabled>
                  Unavailable
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default RoomCard;
