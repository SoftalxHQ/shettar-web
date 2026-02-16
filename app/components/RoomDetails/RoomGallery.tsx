'use client';

import { GlightBox, SkeletonImage, TinySlider } from '@/app/components';
import { Col, Container, Row } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { BsArrowLeft, BsArrowRight, BsFullscreen, BsGeoAlt } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import { type TinySliderSettings } from 'tiny-slider';
import PriceSummary from './PriceSummary';
import RoomCard from './RoomCard';

import 'tiny-slider/dist/tiny-slider.css';

const roomSlides = [
  '/images/gallery/16.jpg',
  '/images/gallery/13.jpg',
  '/images/gallery/14.jpg',
  '/images/gallery/11.jpg'
];

const RoomGallery = ({ room, hotel }: { room: any; hotel: any }) => {
  if (!room) return null;

  const images = room?.images_url && room.images_url.length > 0 ? room.images_url : [
    '/images/gallery/16.jpg',
    '/images/gallery/13.jpg',
    '/images/gallery/14.jpg',
    '/images/gallery/11.jpg'
  ];

  const mainImage = images[0];
  const secondImage = images[1] || images[0];
  const remainingCount = images.length - 2;

  // Extract active amenities from the boolean object
  const activeAmenities = Object.entries(room.amenities || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

  return (
    <section className="pt-4">
      <Container>
        <Row className="mb-4">
          <Col xs={12}>
            <h1 className="fs-3">
              {room?.business?.name ? `${room.business.name} - ` : ''}{room?.name || 'Room Details'}
            </h1>
            {room?.business && (
              <p className="fw-bold mb-0 opacity-75">
                <BsGeoAlt className=" me-2" />
                {room.business.address}, {room.business.city}, {room.business.state}
              </p>
            )}
          </Col>
        </Row>

        {/* 2-Column Gallery Pattern */}
        <Row className="g-2 mb-5">
          <Col md={6}>
            <GlightBox image={mainImage} data-glightbox="" data-gallery="room-gallery">
              <SkeletonImage
                src={mainImage}
                alt="Room main"
                height="400px"
                containerClassName="card card-grid-lg card-element-hover card-overlay-hover overflow-hidden shadow-sm rounded-3"
              >
                <div className="hover-element position-absolute w-100 h-100">
                  <BsFullscreen
                    size={28}
                    className=" fs-6 text-white position-absolute top-50 start-50 translate-middle bg-dark rounded-1 p-2 lh-1"
                  />
                </div>
              </SkeletonImage>
            </GlightBox>
          </Col>
          <Col md={6}>
            <div className="position-relative h-100">
              <SkeletonImage
                src={secondImage}
                alt="Room more"
                height="400px"
                containerClassName="card card-grid-lg overflow-hidden shadow-sm rounded-3"
              >
                <div className="bg-overlay bg-dark opacity-7" />
                <GlightBox image={secondImage} data-glightbox="" data-gallery="room-gallery" className="stretched-link z-index-9" />

                {/* Hidden gallery triggers for remaining images */}
                {images.slice(2).map((img: string, i: number) => (
                  <GlightBox key={i} image={img} data-glightbox="" data-gallery="room-gallery" />
                ))}

                <div className="card-img-overlay d-flex h-100 w-100">
                  <div className="m-auto text-center">
                    <h6 className="card-title fw-light mb-2">
                      <Link href="#" onClick={(e) => e.preventDefault()} className="text-white fs-5">
                        {remainingCount > 0 ? `+${remainingCount} More Photos` : 'View Photos'}
                      </Link>
                    </h6>
                    <BsFullscreen size={18} className="text-white opacity-75" />
                  </div>
                </div>
              </SkeletonImage>
            </div>
          </Col>
        </Row>

        {/* Description and Amenities below gallery */}
        <Row className="g-4">
          <Col lg={7}>
            <div className="mb-5">
              <h4 className="mb-3">Room Description</h4>
              <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-line' }}>
                {room.description || "No detailed description available for this room type. Experience comfort and elegance in our well-appointed rooms, designed to provide a relaxing stay with all necessary modern conveniences."}
              </p>
            </div>

            <div>
              <h4 className="mb-3">Room Amenities</h4>
              <Row className="g-3">
                {activeAmenities.map((amenity, idx) => (
                  <Col key={idx} md={4} sm={6}>
                    <div className="d-flex align-items-center opacity-75">
                      <FaCheckCircle className="text-success me-2 flex-shrink-0" />
                      <span className="small">{amenity}</span>
                    </div>
                  </Col>
                ))}
                {activeAmenities.length === 0 && (
                  <Col xs={12}>
                    <p className="text-muted small italic">Standard room amenities included.</p>
                  </Col>
                )}
              </Row>
            </div>

            <div className="mt-5 pt-5 border-top">
              <h4 className="mb-4">Confirm Selection</h4>
              <RoomCard
                id={room.id}
                slug={room.slug}
                name={room.name}
                price={room.price}
                images={room.images_url || []}
                sqfeet={room.sqfeet || 250}
                amenities={room.amenities}
                available_rooms={room.available_rooms}
                isSelected={true}
              />

              {room.other_room_types && room.other_room_types.length > 0 && (
                <div className="mt-5">
                  <h4 className="mb-4">Other Available Rooms</h4>
                  <div className="vstack gap-4">
                    {room.other_room_types.map((otherRoom: any, idx: number) => (
                      <RoomCard
                        key={idx}
                        id={otherRoom.id}
                        slug={otherRoom.slug}
                        name={otherRoom.name}
                        price={otherRoom.price}
                        images={otherRoom.images_url || []}
                        sqfeet={otherRoom.sqfeet || 250}
                        amenities={otherRoom.amenities}
                        available_rooms={otherRoom.available_rooms}
                        hotelSlug={hotel?.slug}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>

          <PriceSummary room={room} hotel={hotel} />
        </Row>
      </Container>
    </section>
  );
};

export default RoomGallery;
