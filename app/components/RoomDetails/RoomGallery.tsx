'use client';

import { GlightBox, TinySlider } from '@/app/components';
import { Col, Container, Image, Row } from 'react-bootstrap';
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

const RoomGallery = () => {
  const roomSliderSettings: TinySliderSettings = {
    nested: 'inner',
    autoplay: true,
    controls: true,
    gutter: 30,
    autoplayButton: false,
    autoplayButtonOutput: false,
    controlsText: [renderToString(<BsArrowLeft size={16} />), renderToString(<BsArrowRight size={16} />)],
    arrowKeys: true,
    items: 2,
    nav: false,
    responsive: {
      0: { items: 1 },
      576: { items: 1 },
      768: { items: 2 },
      992: { items: 2 },
      1200: { items: 2 },
    },
  };

  return (
    <section className="pt-4">
      <Container>
        <Row>
          <Col xs={12} className="mb-4">
            <h1 className="fs-3">Luxury Room with Balcony</h1>
            <p className="fw-bold mb-0">
              <BsGeoAlt className=" me-2" />
              5855 W Century Blvd, Los Angeles - 90045{' '}
            </p>
          </Col>
        </Row>
        <div className="tiny-slider arrow-round arrow-blur overflow-hidden">
          <TinySlider settings={roomSliderSettings}>
            {roomSlides.map((image, idx) => (
              <div key={idx}>
                <GlightBox className="w-100 h-100" data-glightbox="" data-gallery="gallery" image={image}>
                  <div className="card card-element-hover card-overlay-hover overflow-hidden">
                    <Image src={image} className="rounded-3 w-100" alt="Room slide" />
                    <div className="hover-element w-100 h-100">
                      <BsFullscreen
                        size={32}
                        className=" fs-6 text-white position-absolute top-50 start-50 translate-middle bg-dark rounded-1 p-2 lh-1"
                      />
                    </div>
                  </div>
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
