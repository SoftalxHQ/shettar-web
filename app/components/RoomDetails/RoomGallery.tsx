'use client';

import { GlightBox, SkeletonImage, TinySlider } from '@/app/components';
import { Col, Container, Row } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { BsArrowLeft, BsArrowRight, BsFullscreen, BsGeoAlt } from 'react-icons/bs';
import { type TinySliderSettings } from 'tiny-slider';

import 'tiny-slider/dist/tiny-slider.css';

const roomSlides = [
  '/images/gallery/16.jpg',
  '/images/gallery/13.jpg',
  '/images/gallery/14.jpg',
  '/images/gallery/11.jpg'
];

const RoomGallery = ({ room }: { room: any }) => {
  const roomSliderSettings: TinySliderSettings = {
    autoplay: true,
    controls: true,
    gutter: 30,
    autoplayButton: false,
    autoplayButtonOutput: false,
    controlsText: [renderToString(<BsArrowLeft size={16} />), renderToString(<BsArrowRight size={16} />)],
    arrowKeys: true,
    items: 2,
    nav: false,
    mouseDrag: true,
    responsive: {
      0: { items: 1 },
      576: { items: 1 },
      768: { items: 2 },
      992: { items: 2 },
      1200: { items: 2 },
    },
  };

  const images = room?.images_url && room.images_url.length > 0 ? room.images_url : [
    '/images/gallery/16.jpg',
    '/images/gallery/13.jpg',
    '/images/gallery/14.jpg',
    '/images/gallery/11.jpg'
  ];

  return (
    <section className="pt-4">
      <Container>
        <Row>
          <Col xs={12} className="mb-4">
            <h1 className="fs-3">
              {room?.business?.name ? `${room.business.name} - ` : ''}{room?.name || 'Room Details'}
            </h1>
            {room?.business && (
              <p className="fw-bold mb-2">
                <BsGeoAlt className=" me-2" />
                {room.business.address}, {room.business.city}, {room.business.state}
              </p>
            )}
            {room?.description && (
              <p className="mb-0 text-muted">
                {room.description}
              </p>
            )}
          </Col>
        </Row>
        <div className="tiny-slider arrow-round arrow-blur overflow-hidden">
          <TinySlider settings={roomSliderSettings} style={{ height: '400px' }} className="rounded-3 overflow-hidden">
            {images.map((image: string, idx: number) => (
              <div key={idx}>
                <GlightBox className="w-100 h-100" data-glightbox="" data-gallery="room-gallery" image={image}>
                  <SkeletonImage
                    src={image}
                    alt="Room slide"
                    height="400px"
                    className="card-element-hover card-overlay-hover overflow-hidden rounded-3"
                  >
                    <div className="hover-element position-absolute w-100 h-100">
                      <BsFullscreen
                        size={32}
                        className=" fs-6 text-white position-absolute top-50 start-50 translate-middle bg-dark rounded-1 p-2 lh-1"
                      />
                    </div>
                  </SkeletonImage>
                </GlightBox>
              </div>
            ))}
          </TinySlider>
        </div>
      </Container>
    </section>
  );
};

export default RoomGallery;
