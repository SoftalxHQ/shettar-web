'use client';

import { useToggle } from '@/app/hooks';
import { Alert, Button, Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { BsGridFill, BsListUl } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaSliders } from 'react-icons/fa6';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLayoutContext } from '@/app/states';

import HotelListCard from './HotelListCard';
import HotelListFilter from './HotelListFilter';
import { HotelListSkeleton } from './index';
import {
  fetchBusinesses,
  hasActiveBusinessSearch,
  mapBusinessToHotel,
} from '@/app/helpers/businesses';
import {
  fetchSponsoredListings,
  searchStayParamsFromSearchParams,
  viewerContextToFetchParams,
} from '@/app/helpers/sponsored-listings';
import { resolveAdViewerContext } from '@/app/helpers/ad-viewer-context';
import { getStoredToken } from '@/app/helpers/auth';
import type { SponsoredHotel } from '@/app/helpers/sponsored-listings';

import { Hotel } from '@/app/types/hotel';

const PAGE_LIMIT = 20;

function mapSponsoredToHotel(s: SponsoredHotel): Hotel {
  return {
    ...s,
    sponsored: true,
    feature: ['Sponsored'],
    features: ['Sponsored'],
    schemes: s.schemes ?? ['Free Cancellation', 'Instant Confirmation'],
    is_favorite: s.is_favorite ?? false,
  };
}

const HotelLists = () => {
  const { isOpen, toggle } = useToggle();
  const { updateHotelStats } = useLayoutContext();
  const searchParams = useSearchParams();
  const hasSearch = hasActiveBusinessSearch(searchParams);

  const updateHotelStatsRef = useRef(updateHotelStats);
  useEffect(() => {
    updateHotelStatsRef.current = updateHotelStats;
  }, [updateHotelStats]);

  const [sponsoredHotels, setSponsoredHotels] = useState<Hotel[]>([]);
  const [organicHotels, setOrganicHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = useCallback(async () => {
    if (!hasSearch) {
      setSponsoredHotels([]);
      setOrganicHotels([]);
      setError(null);
      setIsLoading(false);
      updateHotelStatsRef.current(0, '');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { rows } = await fetchBusinesses({
        searchParams,
        page: 1,
        limit: PAGE_LIMIT,
      });

      const organic = rows.map(mapBusinessToHotel);
      const location = searchParams.get('location');
      let sponsored: Hotel[] = [];

      if (location) {
        const token = getStoredToken();
        const viewer = await resolveAdViewerContext({ activeLocation: location, token });
        try {
          const sponsoredRows = await fetchSponsoredListings({
            placement: 'search_results',
            ...viewerContextToFetchParams(viewer),
            ...searchStayParamsFromSearchParams(searchParams),
          });
          const organicIds = new Set(organic.map((h) => h.id));
          sponsored = sponsoredRows
            .filter((s) => !organicIds.has(s.id))
            .map(mapSponsoredToHotel);
        } catch {
          /* sponsored is best-effort */
        }
      }

      setSponsoredHotels(sponsored);
      setOrganicHotels(organic);
      updateHotelStatsRef.current(
        sponsored.length + organic.length,
        searchParams.get('location') || ''
      );
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Unable to load hotels. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [hasSearch, searchParams]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const displayHotels = [...sponsoredHotels, ...organicHotels];
  const hasSponsored = sponsoredHotels.length > 0;
  const hasOrganic = organicHotels.length > 0;

  if (!hasSearch) {
    return null;
  }

  return (
    <section className="pt-0">
      <Container>
        <Row className="mb-4">
          <Col xs={12}>
            <div className="hstack gap-3 justify-content-between justify-content-md-end">
              <Button
                onClick={toggle}
                variant="primary-soft"
                className="btn-primary-check mb-0 d-xl-none"
                type="button"
              >
                <FaSliders className="me-1" /> Show filters
              </Button>
              <ul className="nav nav-pills nav-pills-dark" id="tour-pills-tab" role="tablist">
                <li className="nav-item">
                  <Link className="nav-link rounded-start rounded-0 mb-0 active " href="/hotel/list">
                    <BsListUl className=" fa-fw mb-1" />
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link rounded-end rounded-0 mb-0 " href="/hotel/grid">
                    <BsGridFill className=" fa-fw mb-1" />
                  </Link>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xl={4} xxl={3}>
            <div className="d-none d-xl-block">
              <HotelListFilter />
              <div className="d-flex justify-content-between p-2 p-xl-0 mt-xl-4">
                <button className="btn btn-link p-0 mb-0">Clear all</button>
                <button className="btn btn-primary mb-0">Filter Result</button>
              </div>
            </div>
            <Offcanvas placement="end" show={isOpen} onHide={toggle} className="offcanvas-xl" tabIndex={-1}>
              <OffcanvasHeader className="offcanvas-header" closeButton>
                <h5 className="offcanvas-title">Advance Filters</h5>
              </OffcanvasHeader>
              <OffcanvasBody className="offcanvas-body flex-column p-3 p-xl-0">
                <HotelListFilter />
              </OffcanvasBody>
              <div className="d-flex justify-content-between p-2 p-xl-0 mt-xl-4">
                <button className="btn btn-link p-0 mb-0">Clear all</button>
                <button className="btn btn-primary mb-0">Filter Result</button>
              </div>
            </Offcanvas>
          </Col>
          <Col xl={8} xxl={9}>
            <div className="vstack gap-4">
              {isLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <HotelListSkeleton key={i} />
                  ))}
                </>
              ) : error ? (
                <Alert variant="info" className="text-center">
                  {error}
                </Alert>
              ) : displayHotels.length > 0 ? (
                <>
                  {hasSponsored && (
                    <div>
                      <p className="text-uppercase text-secondary small fw-bold mb-3" style={{ letterSpacing: '0.08em' }}>
                        Sponsored
                      </p>
                      {sponsoredHotels.map((hotel) => (
                        <HotelListCard key={hotel.id} hotel={hotel} />
                      ))}
                    </div>
                  )}
                  {hasOrganic && (
                    <div className={hasSponsored ? 'mt-4' : undefined}>
                      {hasSponsored && (
                        <p className="text-uppercase text-secondary small fw-bold mb-3" style={{ letterSpacing: '0.08em' }}>
                          All results
                        </p>
                      )}
                      {organicHotels.map((hotel) => (
                        <HotelListCard key={hotel.id} hotel={hotel} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <h4>No hotels found</h4>
                  <p className="opacity-50">Try adjusting your filters or search criteria</p>
                </div>
              )}

              {displayHotels.length > 0 && (
                <nav className="d-flex justify-content-center" aria-label="navigation">
                  <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                    <li className="page-item mb-0">
                      <Link className="page-link" href="" tabIndex={-1}>
                        <FaAngleLeft />
                      </Link>
                    </li>
                    <li className="page-item mb-0 active">
                      <Link className="page-link" href="">
                        1
                      </Link>
                    </li>
                    <li className="page-item mb-0">
                      <Link className="page-link" href="">
                        <FaAngleRight />
                      </Link>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HotelLists;
