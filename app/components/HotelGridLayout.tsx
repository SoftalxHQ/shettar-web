'use client';

import { Col, Container, Row, Alert, Button } from 'react-bootstrap';
import HotelGridCard from './HotelGridCard';
import { HotelGridSkeleton } from './index';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Hotel } from '@/app/types/hotel';
import { useLayoutContext } from '@/app/states/useLayoutContext';
import { getStoredToken } from '@/app/helpers/auth';

const PAGE_LIMIT = 20;

function mapBusinessToHotel(b: Record<string, unknown>): Hotel {
  const features = Object.entries((b.amenities as Record<string, boolean>) || {})
    .filter(([, value]) => value === true)
    .map(([key]) =>
      key.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    )
    .slice(0, 4);

  const price = parseFloat(String(b.starting_from)) || 0;
  const oldPrice = parseFloat(String(b.old_price)) || 0;
  const sale =
    oldPrice > price ? `${Math.round(((oldPrice - price) / oldPrice) * 100)}% Off` : undefined;

  return {
    id: b.id as number,
    slug: b.slug as string,
    name: b.name as string,
    address: `${b.address}, ${b.city}, ${b.state}`,
    images: (b.images_url as string[]) || [],
    price,
    old_price: oldPrice,
    rating: parseFloat(String(b.average_rating)) || 0,
    feature: features.length > 0 ? features : ['Standard Room'],
    features: features.length > 0 ? features : ['Standard Room'],
    sale,
    is_favorite: Boolean(b.is_favorite),
  };
}

function parseListPayload(json: unknown): {
  rows: Record<string, unknown>[];
  meta: { current_page: number; total_pages: number; total_count: number; per_page: number } | null;
} {
  if (Array.isArray(json)) {
    return { rows: json as Record<string, unknown>[], meta: null };
  }
  if (json && typeof json === 'object' && 'businesses' in json) {
    const o = json as {
      businesses: Record<string, unknown>[];
      meta?: { current_page: number; total_pages: number; total_count: number; per_page: number };
    };
    return { rows: o.businesses || [], meta: o.meta ?? null };
  }
  return { rows: [], meta: null };
}

const HotelGridLayout = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ current_page: number; total_pages: number; total_count: number; per_page: number } | null>(null);
  const searchParams = useSearchParams();
  const { updateHotelStats } = useLayoutContext();

  const updateHotelStatsRef = useRef(updateHotelStats);
  useEffect(() => {
    updateHotelStatsRef.current = updateHotelStats;
  }, [updateHotelStats]);

  const buildQueryString = useCallback(
    (pageNum: number, limit: number) => {
      const query = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (['page', 'limit', 'featured', 'exclude_featured'].includes(key)) return;
        if (key === 'rooms') {
          query.append('number_of_rooms', value);
        } else {
          query.append(key, value);
        }
      });
      query.set('page', String(pageNum));
      query.set('limit', String(limit));
      return query.toString();
    },
    [searchParams]
  );

  const fetchBusinessPage = useCallback(
    async (pageNum: number, limit: number) => {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL;
      const baseUrl = rawUrl && rawUrl !== 'undefined' ? rawUrl : 'http://127.0.0.1:3000';
      const API_URL = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const token = getStoredToken();
      const qs = buildQueryString(pageNum, limit);
      const response = await fetch(`${API_URL}/api/v1/businesses?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      const json = await response.json();
      return parseListPayload(json);
    },
    [buildQueryString]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { rows, meta: m } = await fetchBusinessPage(1, PAGE_LIMIT);
        if (cancelled) return;
        setHotels(rows.map(mapBusinessToHotel));
        setMeta(m);
        updateHotelStatsRef.current(rows.length, searchParams.get('location') || '');
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
  }, [fetchBusinessPage, searchParams]);

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
