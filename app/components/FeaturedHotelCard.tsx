'use client';

import { currency } from '@/app/states';
import { useSponsoredListingTracking } from '@/app/hooks/useSponsoredListingTracking';
import SkeletonImage from '@/app/components/SkeletonImage';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { BsGeoAlt } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa6';

export interface FeaturedHotelCardProps {
  id: number;
  slug?: string;
  name: string;
  city?: string;
  state?: string;
  address?: string;
  images: string[];
  price: number;
  rating: number;
  sponsored?: boolean;
  adCampaignId?: number | null;
  adPlacement?: string;
  impressionKey?: string;
}

function locationLabel(city?: string, state?: string, address?: string): string {
  if (city) return city;
  if (state) return state;
  if (address) return address.split(',')[0]?.trim() || address;
  return 'Location';
}

function FeaturedHotelImageSlideshow({
  slides,
  name,
  intervalMs = 3500,
}: {
  slides: string[];
  name: string;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [slides.length, intervalMs]);

  return (
    <div className="featured-hotels__image-slideshow">
      {slides.map((src, slideIndex) => (
        <div
          key={`${src}-${slideIndex}`}
          className={`featured-hotels__slide-image${slideIndex === index ? ' is-active' : ''}`}
        >
          <SkeletonImage
            src={src}
            alt={name}
            className="card-img"
            containerClassName="h-100"
          />
        </div>
      ))}
      {slides.length > 1 && (
        <div className="featured-hotels__slide-dots" aria-hidden="true">
          {slides.slice(0, 8).map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`featured-hotels__slide-dot${dotIndex === index ? ' is-active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const FeaturedHotelCard = ({
  id,
  slug,
  name,
  city,
  state,
  address,
  images,
  price,
  rating,
  sponsored,
  adCampaignId,
  adPlacement,
  impressionKey,
}: FeaturedHotelCardProps) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.toString();
  const hotelDetailLink = `/hotel/${slug || id}${searchQuery ? `?${searchQuery}` : ''}`;
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const slidesKey = slides.join('|');
  const hasRating = rating > 0;
  const displayRating = hasRating ? rating.toFixed(1).replace(/\.0$/, '') : null;

  const { ref, trackClick } = useSponsoredListingTracking(
    sponsored && adCampaignId
      ? {
          ad_campaign_id: adCampaignId,
          business_id: id,
          ad_placement: adPlacement,
          impression_key: impressionKey,
        }
      : null
  );

  return (
    <div ref={ref}>
      <Card className="card-img-scale overflow-hidden bg-transparent">
        <div className="card-img-scale-wrapper rounded-3 position-relative">
        {sponsored && adCampaignId && (
          <span className="badge bg-secondary position-absolute top-0 end-0 m-2 z-1">Sponsored</span>
        )}
        {slides.length > 0 ? (
          <FeaturedHotelImageSlideshow key={slidesKey} slides={slides} name={name} />
        ) : (
          <div className="card-img bg-light d-flex align-items-center justify-content-center featured-hotels__image-fallback">
            <span className="text-secondary small opacity-50">No image</span>
          </div>
        )}
        <div className="position-absolute bottom-0 start-0 p-3">
          <div className="badge text-bg-dark fs-6 rounded-pill stretched-link d-flex">
            <BsGeoAlt className="me-2" />
            {locationLabel(city, state, address)}
          </div>
        </div>
      </div>

      <div className="card-body px-2">
        <h5 className="card-title">
          <Link
            href={hotelDetailLink}
            className="stretched-link"
            onClick={() => {
              if (sponsored && adCampaignId) trackClick();
            }}
          >
            {name}
          </Link>
        </h5>
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="text-success mb-0">
            {currency}
            {price.toLocaleString()} <small className="fw-light">/starting at</small>{' '}
          </h6>
          {hasRating && (
            <h6 className="mb-0 d-flex">
              {displayRating}
              <FaStar size={18} className="text-warning ms-1" />
            </h6>
          )}
        </div>
      </div>
    </Card>
    </div>
  );
};

export default FeaturedHotelCard;
