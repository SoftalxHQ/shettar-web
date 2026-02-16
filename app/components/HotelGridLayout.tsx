'use client';

import { Col, Container, Row, Alert } from 'react-bootstrap';
import HotelGridCard from './HotelGridCard';
import { HotelGridSkeleton } from './index';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Hotel } from '@/app/types/hotel';
import { useLayoutContext } from '@/app/states/useLayoutContext';

const HotelGridLayout = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { updateHotelStats } = useLayoutContext();

  const fetchHotels = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL;
      const baseUrl = (rawUrl && rawUrl !== 'undefined') ? rawUrl : "http://127.0.0.1:3000";
      const API_URL = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      const query = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key === 'rooms') {
          query.append('number_of_rooms', value);
        } else {
          query.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/api/v1/businesses?${query.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const data = await response.json();

      const mappedHotels: Hotel[] = data.map((b: any) => {
        // ... (rest of the mapping logic remains the same)
        const features = Object.entries(b.amenities || {})
          .filter(([_, value]) => value === true)
          .map(([key]) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
          .slice(0, 4);

        const price = parseFloat(b.starting_from) || 0;
        const oldPrice = parseFloat(b.old_price) || 0;
        const sale = (oldPrice > price) ? `${Math.round(((oldPrice - price) / oldPrice) * 100)}% Off` : undefined;

        return {
          id: b.id,
          slug: b.slug,
          name: b.name,
          address: `${b.address}, ${b.city}, ${b.state}`,
          images: b.images_url || [],
          price: price,
          rating: parseFloat(b.average_rating) || 0,
          feature: features.length > 0 ? features : ['Standard Room'],
          features: features.length > 0 ? features : ['Standard Room'],
          sale: sale,
        };
      });

      setHotels(mappedHotels);
      updateHotelStats(mappedHotels.length, searchParams.get('location') || '');
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Unable to load hotels. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, updateHotelStats]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

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
              {hotels.map((hotel, idx) => {
                return (
                  <Col key={idx} md={6} xl={4}>
                    <HotelGridCard
                      id={hotel.id}
                      slug={hotel.slug}
                      name={hotel.name}
                      price={hotel.price}
                      feature={hotel.feature}
                      images={hotel.images}
                      rating={hotel.rating}
                      sale={hotel.sale}
                    />
                  </Col>
                );
              })}
            </Row>
            <Row>
              <Col xs={12}>
                <nav className="mt-4 d-flex justify-content-center" aria-label="navigation">
                  <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                    <li className="page-item mb-0">
                      <Link className="page-link" href="#" tabIndex={-1}>
                        <FaAngleLeft />
                      </Link>
                    </li>
                    <li className="page-item mb-0 active">
                      <Link className="page-link" href="#">
                        1
                      </Link>
                    </li>
                    <li className="page-item mb-0">
                      <Link className="page-link" href="#">
                        <FaAngleRight />
                      </Link>
                    </li>
                  </ul>
                </nav>
              </Col>
            </Row>
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
