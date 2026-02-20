'use client';

import { TinySlider, SkeletonImage, FavoriteButton } from '@/app/components';
import { currency, useLayoutContext } from '@/app/states';
import { Fragment, useMemo } from 'react';
import { Button, Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Image, Row } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { BsArrowLeft, BsArrowRight, BsGeoAlt, BsPatchCheckFill } from 'react-icons/bs';
import { FaFacebookSquare, FaLinkedin, FaShareAlt, FaStarHalfAlt, FaRegStar, FaTwitterSquare } from 'react-icons/fa';
import { FaCopy, FaHeart, FaStar } from 'react-icons/fa6';
import { type TinySliderSettings } from 'tiny-slider';
import { type Hotel } from '@/app/types/hotel';

import 'tiny-slider/dist/tiny-slider.css';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const HotelListCard = ({ hotel }: { hotel: Hotel }) => {
  const { address, features, images, name, price, rating, sale, schemes } = hotel;
  const { isAuthenticated } = useLayoutContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Create the search query string once
  const searchQuery = searchParams.toString();
  const hotelDetailLink = `/hotel/${hotel.slug || hotel.id}${searchQuery ? `?${searchQuery}` : ''}`;

  // Assuming LTR as default since context is client-side only and might not be hydrated yet
  const dir = 'ltr';

  const listSliderSettings: TinySliderSettings = useMemo(() => ({
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
    <Card className="shadow p-2">
      <Row className="g-0">
        <Col md={5} className="position-relative">
          {sale && (
            <div className="position-absolute top-0 start-0 z-index-2 m-2">
              <div className="badge text-bg-danger">{sale}</div>
            </div>
          )}

          <div className="tiny-slider arrow-round arrow-xs arrow-dark overflow-hidden rounded-2" style={{ height: '250px' }}>
            <TinySlider settings={listSliderSettings}>
              {images.map((image, idx) => (
                <div key={idx} className="position-relative">
                  <SkeletonImage src={image} alt="Card image" className="card-img-top w-100" height="250px" />
                </div>
              ))}
            </TinySlider>
          </div>
        </Col>
        <Col md={7}>
          <CardBody className="py-md-2 d-flex flex-column h-100 position-relative">
            <div className="d-flex justify-content-between align-items-center">
              <ul className="list-inline mb-1">
                {Array.from(new Array(Math.floor(rating))).map((_star, idx) => (
                  <li key={idx} className="list-inline-item me-1 small">
                    <FaStar size={15} className="text-warning" />
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
                      <FaRegStar size={15} />
                    </li>
                  ))}
              </ul>
              <ul className="list-inline mb-0 z-index-2">
                <li className="list-inline-item">
                  <FavoriteButton businessId={Number(hotel.id)} />
                </li>
                <Dropdown className="list-inline-item dropdown">
                  <DropdownToggle
                    className="arrow-none btn btn-sm btn-light btn-round"
                    role="button"
                    id="dropdownShare"
                  >
                    <FaShareAlt className="fa-fw" />
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-end min-w-auto shadow rounded" aria-labelledby="dropdownShare">
                    <DropdownItem onClick={() => {
                      const url = `${window.location.origin}/hotel/${hotel.slug || hotel.id}`;
                      const text = `Check out ${hotel.name} on Abri!`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                    }}>
                      <FaTwitterSquare className="me-2 text-info" />
                      Twitter
                    </DropdownItem>

                    <DropdownItem onClick={() => {
                      const url = `${window.location.origin}/hotel/${hotel.slug || hotel.id}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}>
                      <FaFacebookSquare className="me-2 text-primary" />
                      Facebook
                    </DropdownItem>

                    <DropdownItem onClick={() => {
                      const url = `${window.location.origin}/hotel/${hotel.slug || hotel.id}`;
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                    }}>
                      <FaLinkedin className="me-2 text-primary" />
                      LinkedIn
                    </DropdownItem>

                    <DropdownItem onClick={() => {
                      const url = `${window.location.origin}/hotel/${hotel.slug || hotel.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Link copied to clipboard!');
                    }}>
                      <FaCopy className="me-2" />
                      Copy link
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </ul>
            </div>
            <h5 className="card-title mb-1">
              <Link href={hotelDetailLink} className="text-inherit">{name}</Link>
            </h5>
            <small className="d-flex align-items-center opacity-75">
              <BsGeoAlt className="me-2 text-primary" />
              {address}
            </small>
            <ul className="nav nav-divider mt-3">
              {features?.map((feature, idx) => (
                <li key={idx} className="nav-item opacity-75">
                  {feature}
                </li>
              ))}
            </ul>
            <ul className="list-group list-group-borderless small mb-0 mt-2">
              {schemes ? (
                <Fragment>
                  {schemes.map((scheme, idx) => {
                    return (
                      <li key={idx} className="list-group-item d-flex text-success p-0 align-items-center bg-transparent border-0">
                        <BsPatchCheckFill className="me-2" />
                        {scheme}
                      </li>
                    )
                  })}
                </Fragment>
              ) : (
                <li className="list-group-item d-flex text-danger p-0 align-items-center bg-transparent border-0">
                  <BsPatchCheckFill className="me-2" />
                  Non Refundable
                </li>
              )}
            </ul>
            <div className="d-sm-flex justify-content-sm-between align-items-center mt-3 mt-md-auto">
              <div className="d-flex align-items-center">
                <h5 className="fw-bold mb-0 me-1">
                  {currency}
                  {price?.toLocaleString()}
                </h5>
                <span className="mb-0 me-2 small opacity-50">/day</span>
                {sale && <span className="text-decoration-line-through mb-0 small opacity-50">{currency}{((price || 0) * 1.25).toLocaleString()}</span>}
              </div>
              <div className="mt-3 mt-sm-0">
                <Link href={hotelDetailLink} className="btn btn-sm btn-dark mb-0 w-100 shadow-sm">
                  Select Room
                </Link>
              </div>
            </div>
          </CardBody>
        </Col>
      </Row>
    </Card>
  )
}

export default HotelListCard
