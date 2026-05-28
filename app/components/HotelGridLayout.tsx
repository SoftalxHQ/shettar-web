'use client';

import { Col, Container, Row, Alert, Button } from 'react-bootstrap';
import HotelGridCard from './HotelGridCard';
import { HotelGridSkeleton } from './index';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Hotel } from '@/app/types/hotel';
import { useLayoutContext } from '@/app/states/useLayoutContext';
import {
  fetchBusinesses,
  hasActiveBusinessSearch,
  mapBusinessToHotel,
} from '@/app/helpers/businesses';
import { fetchSponsoredListings, viewerContextToFetchParams } from '@/app/helpers/sponsored-listings';
import { resolveAdViewerContext } from '@/app/helpers/ad-viewer-context';
import { getStoredToken } from '@/app/helpers/auth';
import { useHomeSearchOptional } from '@/app/contexts/HomeSearchContext';

const PAGE_LIMIT = 20;

const HotelGridLayout = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ current_page: number; total_pages: number; total_count: number; per_page: number } | null>(null);
  const searchParams = useSearchParams();
  const homeSearch = useHomeSearchOptional();
  const hasSearch = homeSearch ? homeSearch.hasSearched : hasActiveBusinessSearch(searchParams);
  const { updateHotelStats } = useLayoutContext();

  const updateHotelStatsRef = useRef(updateHotelStats);
  useEffect(() => {
    updateHotelStatsRef.current = updateHotelStats;
  }, [updateHotelStats]);

  const fetchBusinessPage = useCallback(
    async (pageNum: number, limit: number) => {
      return fetchBusinesses({
        searchParams,
        page: pageNum,
        limit,
      });
    },
    [searchParams]
  );

  useEffect(() => {
    if (!hasSearch) {
      setHotels([]);
      setMeta(null);
      setError(null);
      setIsLoading(false);
      updateHotelStatsRef.current(0, '');
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { rows, meta: m } = await fetchBusinessPage(1, PAGE_LIMIT);
        if (cancelled) return;

        let merged = rows.map(mapBusinessToHotel);
        const location = searchParams.get('location');
        if (location) {
          const token = getStoredToken();
          const viewer = await resolveAdViewerContext({ activeLocation: location, token });
          try {
            const sponsored = await fetchSponsoredListings({
              placement: 'search_results',
              limit: 4,
              ...viewerContextToFetchParams(viewer),
            });
            const organicIds = new Set(merged.map((h) => h.id));
            const sponsoredRows = sponsored
              .filter((s) => !organicIds.has(s.id))
              .map((s) => ({
                ...s,
                feature: ['Sponsored'],
              }));
            merged = [...sponsoredRows, ...merged];
          } catch {
            /* sponsored blend is best-effort */
          }
        }

        setHotels(merged);
        setMeta(m);
        updateHotelStatsRef.current(merged.length, searchParams.get('location') || '');
      } catch (e) {
        if (!cancelled) {
          console.error('Error fetching hotels:', e);
          setError('Unable to load hotels. Please try again later.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchBusinessPage, hasSearch, searchParams]);

  const hasMore = meta ? meta.current_page < meta.total_pages : false;

  const handleLoadMore = async () => {
    if (!meta || meta.current_page >= meta.total_pages || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = meta.current_page + 1;
      const { rows, meta: newMeta } = await fetchBusinessPage(nextPage, meta.per_page || PAGE_LIMIT);
      setHotels((prev) => {
        const seen = new Set(prev.map((h) => h.id));
        const out = [...prev];
        for (const raw of rows) {
          const h = mapBusinessToHotel(raw);
          if (!seen.has(h.id)) {
            seen.add(h.id);
            out.push(h);
          }
        }
        return out;
      });
      setMeta(newMeta);
    } catch (e) {
      console.error(e);
      setError('Could not load more properties.');
    } finally {
      setLoadingMore(false);
    }
  };

  if (!hasSearch) {
    return null;
  }

  return (
    <section className="pt-0">
      <Container>
        {isLoading ? (
          <Row className="g-4">
            {[...Array(6)].map((_, i) => (
              <Col key={i} md={6} xl={4}>
                <HotelGridSkeleton />
              </Col>
            ))}
          </Row>
        ) : error ? (
          <Alert variant="info" className="text-center my-5">
            {error}
          </Alert>
        ) : hotels.length > 0 ? (
          <>
            <Row className="g-4">
              {hotels.map((hotel) => {
                return (
                  <Col key={hotel.id} md={6} xl={4}>
                    <HotelGridCard
                      id={hotel.id}
                      slug={hotel.slug}
                      name={hotel.name}
                      price={hotel.price}
                      feature={hotel.feature}
                      images={hotel.images}
                      rating={hotel.rating}
                      sale={hotel.sale}
                      is_favorite={hotel.is_favorite}
                    />
                  </Col>
                );
              })}
            </Row>
            {hasMore && (
              <Row className="mt-4">
                <Col xs={12} className="text-center">
                  <Button variant="primary" size="lg" disabled={loadingMore} onClick={handleLoadMore}>
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </Button>
                </Col>
              </Row>
            )}
          </>
        ) : (
          <div className="text-center py-5">
            <h4>No hotels found</h4>
            <p className="opacity-50">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </Container>
    </section>
  );
};

export default HotelGridLayout;
