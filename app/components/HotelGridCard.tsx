'use client';

import { TinySlider } from '@/app/components';
import { useToggle } from '@/app/hooks';
import { currency, useLayoutContext } from '@/app/states';
import { Card, CardBody, CardFooter } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { BsArrowLeft, BsArrowRight, BsBookmark, BsBookmarkFill, BsStarFill } from 'react-icons/bs';
import Link from 'next/link';
import { type TinySliderSettings } from 'tiny-slider';

import 'tiny-slider/dist/tiny-slider.css';

import { HotelsGridType } from '@/app/types/hotel';

const HotelGridCard = ({ feature, images, name, price, rating, sale }: HotelsGridType) => {
  const { isOpen, toggle } = useToggle();
  const { dir } = useLayoutContext();

  const gridSliderSettings: TinySliderSettings = {
    nested: 'inner',
    autoplay: false,
    controls: true,
    autoplayButton: false,
    autoplayButtonOutput: false,
    controlsText: [renderToString(<BsArrowLeft size={16} />), renderToString(<BsArrowRight size={16} />)],
    arrowKeys: true,
    items: 1,
    autoplayDirection: dir === 'ltr' ? 'forward' : 'backward',
    nav: false,
  };

  return (
    <Card className="shadow p-2 pb-0 h-100 border-0">
      {sale && (
        <div className="position-absolute top-0 start-0 z-index-1 m-4">
          <div className="badge bg-danger text-white">{sale}</div>
        </div>
      )}
      <div className="tiny-slider arrow-round arrow-xs arrow-dark rounded-2 overflow-hidden">
        <TinySlider settings={gridSliderSettings}>
          {images.map((image, idx) => (
            <div key={idx}>
              <img src={image} alt="Card image" className="card-img-top" />
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
          <Link href="/hotels/detail">{name}</Link>
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
              {price}
            </h5>
            <span className="mb-0 me-2">/day</span>

            {sale && <span className="text-decoration-line-through">{currency}1000</span>}
          </div>
          <div className="mt-2 mt-sm-0">
            <Link href="/hotels/detail" className="btn btn-sm btn-primary-soft mb-0 w-100 items-center">
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
