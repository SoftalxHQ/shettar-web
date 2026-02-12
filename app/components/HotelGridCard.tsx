'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, CardFooter } from 'react-bootstrap';
import { BsBookmark, BsBookmarkFill, BsStarFill, BsArrowRight } from 'react-icons/bs';
import { Hotel } from '../types/hotel';

interface HotelGridCardProps extends Hotel { }

export default function HotelGridCard({ feature, images, name, price, rating, sale }: HotelGridCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <Card className="shadow p-2 pb-0 h-100">
      {sale && (
        <div className="position-absolute top-0 start-0 z-index-1 m-4">
          <div className="badge bg-danger text-white">{sale}</div>
        </div>
      )}

      {/* Image Carousel */}
      <div className="position-relative rounded-2 overflow-hidden">
        <div className="position-relative" style={{ aspectRatio: '4/3' }}>
          <Image
            src={images[currentImageIndex]}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="position-absolute top-50 start-0 translate-middle-y btn btn-white btn-sm rounded-circle ms-2"
              style={{ width: '32px', height: '32px', padding: '0' }}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              onClick={nextImage}
              className="position-absolute top-50 end-0 translate-middle-y btn btn-white btn-sm rounded-circle me-2"
              style={{ width: '32px', height: '32px', padding: '0' }}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </>
        )}
      </div>

      <CardBody className="px-3 pb-0">
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <Link href="#" className="badge bg-dark text-white items-center">
            <BsStarFill size={13} className="fa-fw me-2 text-warning" />
            {rating}
          </Link>
          <Link href="#" className="h6 mb-0 z-index-2" onClick={(e) => {
            e.preventDefault();
            setIsBookmarked(!isBookmarked);
          }}>
            {!isBookmarked ? (
              <BsBookmark className="fa-fw" />
            ) : (
              <BsBookmarkFill color="red" className="fa-fw" />
            )}
          </Link>
        </div>

        <h5 className="card-title">
          <Link href={`/hotels/${name.toLowerCase().replace(/\s+/g, '-')}`}>{name}</Link>
        </h5>

        <ul className="nav nav-divider mb-2 mb-sm-3">
          {feature.map((feat, idx) => (
            <li key={idx} className="nav-item">
              {feat}
            </li>
          ))}
        </ul>
      </CardBody>

      <CardFooter className="pt-0">
        <div className="d-sm-flex justify-content-sm-between align-items-center">
          <div className="d-flex align-items-center">
            <h5 className="fw-normal text-success mb-0 me-1">
              ${price}
            </h5>
            <span className="mb-0 me-2">/day</span>
            {sale && <span className="text-decoration-line-through">$1000</span>}
          </div>
          <div className="mt-2 mt-sm-0">
            <Link
              href={`/hotels/${name.toLowerCase().replace(/\s+/g, '-')}`}
              className="btn btn-sm btn-primary-soft mb-0 w-100 items-center"
            >
              View Detail
              <BsArrowRight className="ms-2" />
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
