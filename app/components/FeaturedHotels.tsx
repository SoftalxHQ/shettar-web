'use client';

import FeaturedHotelCard from '@/app/components/FeaturedHotelCard';
import Skeleton from '@/app/components/Skeleton';
import { fetchSponsoredListings, type SponsoredHotel } from '@/app/helpers/sponsored-listings';
import { resolveAdViewerContext } from '@/app/helpers/ad-viewer-context';
import { AD_VIEWER_CONTEXT_UPDATED_EVENT } from '@/app/helpers/ad-location-prompt';
import { getStoredToken } from '@/app/helpers/auth';
import { useHomeSearch } from '@/app/contexts/HomeSearchContext';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';

const FEATURED_LIMIT = 12;

function FeaturedHotelCardSkeleton() {
  return (
    <Card className="card-img-scale overflow-hidden bg-transparent">
      <div className="card-img-scale-wrapper rounded-3 position-relative overflow-hidden">
        <Skeleton height="100%" width="100%" text="Shettar" />
      </div>
      <div className="card-body px-2">
        <div className="placeholder col-8 rounded mb-2 bg-body-secondary opacity-50" style={{ height: 24 }} />
        <div className="placeholder col-10 rounded bg-body-secondary opacity-50" style={{ height: 20 }} />
      </div>
    </Card>
  );
}

const FeaturedHotels = () => {
  const { hasSearched } = useHomeSearch();
  const [hotels, setHotels] = useState<SponsoredHotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adContextVersion, setAdContextVersion] = useState(0);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 575.98px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 575.98px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const useCarousel = hotels.length > 4 || (isMobile && hotels.length > 0);
  const canScroll = hotels.length > (isMobile ? 1 : 4);

  const emblaOptions = useMemo(
    () => ({
      align: 'start' as const,
      containScroll: 'trimSnaps' as const,
      dragFree: false,
      watchDrag: useCarousel,
    }),
    [useCarousel],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  const [prevEnabled, setPrevEnabled] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const updateScrollButtons = () => {
      setPrevEnabled(emblaApi.canScrollPrev());
      setNextEnabled(emblaApi.canScrollNext());
    };

    updateScrollButtons();
    emblaApi.on('select', updateScrollButtons);
    emblaApi.on('reInit', updateScrollButtons);

    return () => {
      emblaApi.off('select', updateScrollButtons);
      emblaApi.off('reInit', updateScrollButtons);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (hasSearched) {
      setHotels([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const token = getStoredToken();
        await resolveAdViewerContext({ token });
        const rows = await fetchSponsoredListings({
          placement: 'homepage_featured',
          limit: FEATURED_LIMIT,
        });
        if (cancelled) return;
        setHotels(rows);
      } catch (e) {
        if (!cancelled) {
          console.error('Error fetching featured hotels:', e);
          setHotels([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasSearched, adContextVersion]);

  useEffect(() => {
    if (hasSearched || typeof window === 'undefined') return;

    const onContextUpdated = () => setAdContextVersion((v) => v + 1);
    window.addEventListener(AD_VIEWER_CONTEXT_UPDATED_EVENT, onContextUpdated);
    return () => window.removeEventListener(AD_VIEWER_CONTEXT_UPDATED_EVENT, onContextUpdated);
  }, [hasSearched]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  if (hasSearched || (!isLoading && hotels.length === 0)) {
    return null;
  }

  const showArrows = useCarousel && !isMobile && canScroll;

  return (
    <section className="featured-hotels">
      <Container>
        <Row className="mb-4">
          <Col xs={12} className="text-center">
            <h2 className="mb-0">Featured Hotels</h2>
          </Col>
        </Row>

        {isLoading ? (
          <Row className="g-4">
            {[...Array(4)].map((_, i) => (
              <Col key={i} sm={6} xl={3}>
                <FeaturedHotelCardSkeleton />
              </Col>
            ))}
          </Row>
        ) : useCarousel ? (
          <div className="featured-hotels__carousel position-relative">
            {showArrows && (
              <>
                <button
                  type="button"
                  className="featured-hotels__arrow featured-hotels__arrow--prev"
                  onClick={scrollPrev}
                  disabled={!prevEnabled}
                  aria-label="Previous featured hotels"
                >
                  <BsArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  className="featured-hotels__arrow featured-hotels__arrow--next"
                  onClick={scrollNext}
                  disabled={!nextEnabled}
                  aria-label="Next featured hotels"
                >
                  <BsArrowRight size={16} />
                </button>
              </>
            )}

            <div className="featured-hotels__viewport" ref={emblaRef}>
              <div className="featured-hotels__track">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="featured-hotels__slide">
                    <FeaturedHotelCard
                      id={hotel.id}
                      slug={hotel.slug}
                      name={hotel.name}
                      city={hotel.city}
                      state={hotel.state}
                      address={hotel.address}
                      images={hotel.images}
                      price={hotel.price}
                      rating={hotel.rating}
                      sponsored={hotel.sponsored}
                      adCampaignId={hotel.ad_campaign_id}
                      adPlacement={hotel.ad_placement}
                      impressionKey={hotel.impression_key}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Row className="g-4">
            {hotels.map((hotel) => (
              <Col key={hotel.id} sm={6} xl={3}>
                <FeaturedHotelCard
                  id={hotel.id}
                  slug={hotel.slug}
                  name={hotel.name}
                  city={hotel.city}
                  state={hotel.state}
                  address={hotel.address}
                  images={hotel.images}
                  price={hotel.price}
                  rating={hotel.rating}
                  sponsored={hotel.sponsored}
                  adCampaignId={hotel.ad_campaign_id}
                  adPlacement={hotel.ad_placement}
                  impressionKey={hotel.impression_key}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default FeaturedHotels;
