'use client';

import { Button, Card, CardBody, Col, Image, Row } from 'react-bootstrap';
import { BsArrowRight } from 'react-icons/bs';
import { FaStarHalfAlt } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import Link from 'next/link';
import Sticky from 'react-sticky-el';
import useViewPort from '@/app/hooks/useViewPort';

const currency = '$';

const PriceOverView = () => {
  const { width } = useViewPort();

  return (
    <Sticky
      disabled={width <= 1199}
      topOffset={100}
      bottomOffset={0}
      boundaryElement="aside"
      hideOnBoundaryHit={false}
      stickyStyle={{ transition: '0.2s all linear' }}>
      <Card as={CardBody} className="border">
        <div className="d-sm-flex justify-content-sm-between align-items-center mb-3">
          <div>
            <span>Price Start at</span>
            <h4 className="card-title mb-0">{currency}3,500</h4>
          </div>
          <div>
            <h6 className="fw-normal mb-0">1 room per night</h6>
            <small>+ {currency}285 taxes &amp; fees</small>
          </div>
        </div>
        <ul className="list-inline mb-2 items-center">
          <li className="list-inline-item me-1 h6 fw-light mb-0">
            <BsArrowRight className="  me-2" />
            4.5
          </li>
          {Array.from(new Array(4)).map((_val, idx) => (
            <li className="list-inline-item me-1 small" key={idx}>
              <FaStar size={16} className="text-warning" />
            </li>
          ))}
          <li className="list-inline-item me-0 small">
            <FaStarHalfAlt className="text-warning" />
          </li>
        </ul>
        <p className="h6 fw-light mb-4 items-center">
          <BsArrowRight className=" me-2" />
          Free breakfast available
        </p>
        <div className="d-grid">
          <Button variant="primary-soft" size="lg" className="mb-0">
            View 10 Rooms Options
          </Button>
        </div>
      </Card>
      <div className="mt-4 d-none d-xl-block">
        <h4>Today's Best Deal</h4>
        <Card className="shadow rounded-3 overflow-hidden">
          <Row className="g-0 align-items-center">
            <Col sm={6} md={12} lg={6}>
              <Image src="/images/offer/04.jpg" className="card-img rounded-0" alt="Offer" />
            </Col>
            <Col sm={6} md={12} lg={6}>
              <CardBody className="p-3">
                <h6 className="card-title">
                  <Link href="/offer-detail" className="stretched-link">
                    Travel Plan
                  </Link>
                </h6>
                <p className="mb-0">Get up to {currency}10,000 for lifetime limits</p>
              </CardBody>
            </Col>
          </Row>
        </Card>
      </div>
    </Sticky>
  );
};

export default PriceOverView;
