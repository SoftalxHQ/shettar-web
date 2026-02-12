'use client';

import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { hotels } from '../data/hotels';
import HotelGridCard from './HotelGridCard';

export default function HotelGridLayout() {
  return (
    <section className="pt-0">
      <Container>
        <Row className="g-4">
          {hotels.map((hotel, idx) => (
            <Col key={idx} md={6} xl={4}>
              <HotelGridCard
                id={hotel.id}
                name={hotel.name}
                price={hotel.price}
                feature={hotel.feature}
                images={hotel.images}
                rating={hotel.rating}
                sale={hotel.sale}
              />
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        <Row>
          <Col xs={12}>
            <nav className="mt-4 d-flex justify-content-center" aria-label="navigation">
              <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                <li className="page-item mb-0">
                  <Link className="page-link" href="#" tabIndex={-1}>
                    <FaAngleLeft />
                  </Link>
                </li>
                <li className="page-item mb-0">
                  <Link className="page-link" href="#">
                    1
                  </Link>
                </li>
                <li className="page-item mb-0 active">
                  <Link className="page-link" href="#">
                    2
                  </Link>
                </li>
                <li className="page-item mb-0">
                  <Link className="page-link" href="#">
                    ..
                  </Link>
                </li>
                <li className="page-item mb-0">
                  <Link className="page-link" href="#">
                    6
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
      </Container>
    </section>
  );
}
