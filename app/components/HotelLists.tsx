'use client';

import { useToggle } from '@/app/hooks';
import { Alert, Button, Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { BsExclamationOctagonFill, BsGridFill, BsListUl, BsXLg } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaSliders } from 'react-icons/fa6';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

// Components
import HotelListCard from './HotelListCard';
import HotelListFilter from './HotelListFilter';
import { HotelListSkeleton } from './index';

// Types
import { Hotel } from '@/app/types/hotel';

const HotelLists = () => {
  const { isOpen, toggle } = useToggle();
  const { isOpen: alertVisible, hide: hideAlert } = useToggle(true);
  const searchParams = useSearchParams();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";
      const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

      const query = new URLSearchParams();
      const start_date = searchParams.get('start_date');
      const end_date = searchParams.get('end_date');
      const rooms = searchParams.get('rooms');
      const location = searchParams.get('location');

      if (start_date) query.append('start_date', start_date);
      if (end_date) query.append('end_date', end_date);
      if (rooms) query.append('number_of_rooms', rooms);
      if (location) query.append('location', location);

      const response = await fetch(`${API_URL}/api/v1/businesses?${query.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const data = await response.json();

      // Map API data to Hotel interface
      const mappedHotels: Hotel[] = data.map((b: any) => {
        // Convert amenities object to features array
        const features = Object.entries(b.amenities || {})
          .filter(([_, value]) => value === true)
          .map(([key]) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
          .slice(0, 4); // Limit to 4 features for UI

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
          schemes: ['Free Cancellation', 'Instant Confirmation']
        };
      });

      setHotels(mappedHotels);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Unable to load hotels. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return (
    <section className="pt-0">
      <Container>
        <Row className="mb-4">
          <Col xs={12}>
            <Alert
              show={alertVisible}
              variant="danger"
              className="d-flex justify-content-between align-items-center rounded-3 fade show mb-4 mb-0 pe-2 py-3"
              role="alert"
            >
              <div className="d-flex align-items-center">
                <span className="alert-heading h5 mb-0 me-2">
                  <BsExclamationOctagonFill />
                </span>
                <span>
                  <strong className="alert-heading me-2">Covid Policy:</strong>You may require to present an RT-PCR negative test report at the hotel
                </span>
              </div>
              <Button variant="link" onClick={hideAlert} type="button" className="pb-0 pt-1 text-end" data-bs-dismiss="alert" aria-label="Close">
                <BsXLg className="text-inherit" />
              </Button>
            </Alert>

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
            <Offcanvas
              placement="end"
              show={isOpen}
              onHide={toggle}
              className="offcanvas-xl"
              tabIndex={-1}
            >
              <OffcanvasHeader className="offcanvas-header" closeButton>
                <h5 className="offcanvas-title">
                  Advance Filters
                </h5>
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
              ) : hotels.length > 0 ? (
                hotels.map((hotel, idx) => (
                  <HotelListCard key={idx} hotel={hotel} />
                ))
              ) : (
                <div className="text-center py-5">
                  <h4>No hotels found</h4>
                  <p className="opacity-50">Try adjusting your filters or search criteria</p>
                </div>
              )}

              {hotels.length > 0 && (
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
