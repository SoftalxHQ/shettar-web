'use client';

import { TinySlider, SkeletonImage } from '@/app/components';
import { useToggle } from '@/app/hooks';
import { currency, useLayoutContext } from '@/app/states';
import { Card, CardBody, CardFooter } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { BsArrowLeft, BsArrowRight, BsBookmark, BsBookmarkFill, BsStarFill } from 'react-icons/bs';
import Link from 'next/link';
import { useMemo } from 'react';
import { type TinySliderSettings } from 'tiny-slider';

import 'tiny-slider/dist/tiny-slider.css';

import { HotelsGridType } from '@/app/types/hotel';

const HotelGridCard = ({ id, slug, feature, images, name, price, rating, sale }: HotelsGridType) => {
  const { isOpen, toggle } = useToggle();
  const { dir } = useLayoutContext();

  const gridSliderSettings: TinySliderSettings = useMemo(() => ({
    mouseDrag: true,
    gutter: 0,
    items: 1,
    autoplay: false,
    controls: true,
    autoplayButton: false,
    autoplayButtonOutput: false,
    controlsText: [renderToString(<BsArrowLeft size={16} />), renderToString(<BsArrowRight size={16} />)],
    arrowKeys: true,
    autoplayDirection: dir === 'ltr' ? 'forward' : 'backward',
    nav: false,
    slideBy: 'page',
    autoWidth: false,
    preventScrollOnTouch: 'auto',
  }), [dir]);

  return (
    <Card className="shadow p-2 pb-0 h-100 border-0">
      {sale && (
        <div className="position-absolute top-0 start-0 z-index-2 m-4">
          <div className="badge bg-danger text-white">{sale}</div>
        </div>
      )}
      <div className="tiny-slider arrow-round arrow-xs arrow-dark rounded-2 overflow-hidden" style={{ height: '200px' }}>
        <TinySlider settings={gridSliderSettings}>
          {images.map((image, idx) => (
            <div key={idx}>
              <SkeletonImage src={image} alt="Card image" className="card-img-top w-100" height="200px" />
            </div>
          ))}
        </TinySlider>
      </div>
      <CardBody className="px-3 pb-0">
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <Link href="#" className="badge bg-dark text-white items-center">
            <BsStarFill size={13} className=" fa-fw me-2 text-warning" />
            {rating}
          </Link>
          <Link href="#" className="h6 mb-0 z-index-2" onClick={(e) => { e.preventDefault(); toggle(); }}>
            {!isOpen ? <BsBookmark className=" fa-fw" /> : <BsBookmarkFill color="red" className=" fa-fw" />}{' '}
          </Link>
        </div>
        <h5 className="card-title">
          <Link href={`/hotel/${slug || id}`}>{name}</Link>
        </h5>
        <ul className="nav nav-divider mb-2 mb-sm-3">
          {feature.map((feat, idx) => (
            <li key={idx} className="nav-item">
              {feat}
            </li>
          ))}
        </ul>
      </CardBody>
      <CardFooter className="pt-0 bg-transparent border-0">
        <div className="d-sm-flex justify-content-sm-between align-items-center">
          <div className="d-flex align-items-center">
            <h5 className="fw-normal text-success mb-0 me-1">
              {currency}
              {price?.toLocaleString()}
            </h5>
            <span className="mb-0 me-2 small">/day</span>

            {sale && <span className="text-decoration-line-through small">{currency}{((price || 0) * 1.25).toLocaleString()}</span>}
          </div>
          <div className="mt-2 mt-sm-0">
            <Link href={`/hotel/${slug || id}`} className="btn btn-sm btn-primary-soft mb-0 w-100 items-center">
              View Detail
              <BsArrowRight className=" ms-2" />
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HotelGridCard;
