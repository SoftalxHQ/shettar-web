'use client';

import { FavoriteButton } from '@/app/components';
import { ImageSlider } from '@/app/components/ImageSlider';
import { currency } from '@/app/states';
import { useSponsoredListingTracking } from '@/app/hooks/useSponsoredListingTracking';
import { Button, Card, CardBody, CardFooter } from 'react-bootstrap';
import { BsArrowRight, BsStarFill } from 'react-icons/bs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { HotelsGridType } from '@/app/types/hotel';

const HotelGridCard = ({
  id,
  slug,
  feature,
  images,
  name,
  price,
  rating,
  sale,
  is_favorite,
  old_price,
  sponsored,
  ad_campaign_id,
  ad_placement,
  impression_key,
}: HotelsGridType) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.toString();
  const hotelDetailLink = `/hotel/${slug || id}${searchQuery ? `?${searchQuery}` : ''}`;

  const { ref, trackClick } = useSponsoredListingTracking(
    sponsored && ad_campaign_id
      ? {
          ad_campaign_id,
          business_id: id,
          ad_placement: ad_placement || 'search_results',
          impression_key: impression_key,
        }
      : null
  );

  const handleViewDetail = () => {
    if (sponsored && ad_campaign_id) {
      trackClick();
    }
    router.push(hotelDetailLink);
  };

  return (
    <div ref={ref}>
      <Card className="shadow p-2 pb-0 h-100 border-0">
        <div className="position-relative">
          {sale && (
            <div className="position-absolute top-0 start-0 z-index-2 m-3" style={{ zIndex: 5 }}>
              <div className="badge bg-danger text-white">{sale}</div>
            </div>
          )}

          {sponsored && ad_campaign_id && (
            <div className="position-absolute top-0 start-0 z-index-2 m-3" style={{ zIndex: 6 }}>
              <div className="badge bg-secondary text-white">Sponsored</div>
            </div>
          )}

          <div className="position-absolute top-0 end-0 z-index-2 m-3" style={{ zIndex: 5 }}>
            <FavoriteButton businessId={Number(id)} initialIsWishlisted={is_favorite} />
          </div>

          <ImageSlider images={images} height="200px" alt={name} />
        </div>

        <CardBody className="px-3 pb-0">
          <div className="d-flex justify-content-between mb-3 align-items-center">
            <Link href="#" className="badge bg-dark text-white items-center">
              <BsStarFill size={13} className=" fa-fw me-2 text-warning" />
              {rating}
            </Link>
          </div>
          <h5 className="card-title">
            <Link href={hotelDetailLink} className="text-inherit">
              {name}
            </Link>
          </h5>
          <ul className="nav nav-divider mb-2 mb-sm-3">
            {feature
              .filter((feat) => feat !== 'Sponsored')
              .map((feat, idx) => (
                <li key={idx} className="nav-item opacity-75">
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
              <span className="mb-0 me-2 small opacity-50">/night</span>

              {sale && old_price && (
                <span className="text-decoration-line-through small opacity-50">
                  {currency}
                  {old_price.toLocaleString()}
                </span>
              )}
            </div>
            <div className="mt-2 mt-sm-0">
              <Button
                variant="primary"
                size="sm"
                className="btn-primary-soft mb-0 w-100 items-center shadow-sm"
                onClick={handleViewDetail}
              >
                View Detail
                <BsArrowRight className=" ms-2" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HotelGridCard;
