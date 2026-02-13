'use client';

import React from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import Skeleton from './Skeleton';

const HotelListSkeleton = () => {
  return (
    <Card className="shadow p-2 mb-4">
      <Row className="g-0">
        <Col md={5}>
          <Skeleton height="250px" className="rounded-2" />
        </Col>
        <Col md={7}>
          <CardBody className="py-md-2 d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Skeleton width="100px" height="20px" />
              <div className="hstack gap-2">
                <Skeleton width="32px" height="32px" variant="circle" />
                <Skeleton width="32px" height="32px" variant="circle" />
              </div>
            </div>
            <Skeleton width="60%" height="1.5rem" className="mb-2" />
            <Skeleton width="40%" height="1rem" className="mb-3" />

            <div className="d-flex gap-2 mb-3">
              <Skeleton width="80px" height="20px" />
              <Skeleton width="80px" height="20px" />
            </div>

            <div className="vstack gap-2 mb-3">
              <Skeleton width="50%" height="15px" />
              <Skeleton width="45%" height="15px" />
            </div>

            <div className="mt-auto d-sm-flex justify-content-sm-between align-items-center">
              <div className="d-flex align-items-center">
                <Skeleton width="80px" height="1.5rem" className="me-2" />
                <Skeleton width="40px" height="1rem" />
              </div>
              <Skeleton width="120px" height="35px" className="mt-3 mt-sm-0" />
            </div>
          </CardBody>
        </Col>
      </Row>
    </Card>
  );
};

export default HotelListSkeleton;
