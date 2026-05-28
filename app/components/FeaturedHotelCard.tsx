'use client';

import { currency } from '@/app/states';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
}

function locationLabel(city?: string, state?: string, address?: string): string {
  if (city) return city;
  if (state) return state;
  if (address) return address.split(',')[0]?.trim() || address;
  return 'Location';
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
}: FeaturedHotelCardProps) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.toString();
  const hotelDetailLink = `/hotel/${slug || id}${searchQuery ? `?${searchQuery}` : ''}`;
  const imageSrc = images[0];
  const displayRating = rating > 0 ? rating.toFixed(1).replace(/\.0$/, '') : '—';

  return (
    <Card className="card-img-scale overflow-hidden bg-transparent">
      <div className="card-img-scale-wrapper rounded-3">
        {imageSrc ? (
          <img src={imageSrc} className="card-img" alt={name} />
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
          <Link href={hotelDetailLink} className="stretched-link">
            {name}
          </Link>
        </h5>
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="text-success mb-0">
            {currency}
            {price.toLocaleString()} <small className="fw-light">/starting at</small>{' '}
          </h6>
          <h6 className="mb-0 d-flex">
            {displayRating}
            <FaStar size={18} className="text-warning ms-1" />
          </h6>
        </div>
      </div>
    </Card>
  );
};

export default FeaturedHotelCard;
