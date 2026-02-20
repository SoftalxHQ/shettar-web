'use client';

import React from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import Skeleton from '../../Skeleton';

const WishlistSkeleton = () => {
  return (
    <Card className="shadow p-2 border-0 mb-3">
      <Row className="g-0">
        <Col md={3}>
          <Skeleton height="150px" className="rounded-2" />
        </Col>
        <Col md={9}>
          <CardBody className="py-md-2 d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Skeleton width="100px" height="15px" />
              <div className="hstack gap-2">
                <Skeleton width="30px" height="30px" variant="circle" />
                <Skeleton width="30px" height="30px" variant="circle" />
              </div>
            </div>
            <Skeleton width="60%" height="1.5rem" className="mb-2" />
            <Skeleton width="40%" height="1rem" className="mb-3" />

            <div className="mt-auto d-sm-flex justify-content-sm-between align-items-center">
              <div className="d-flex align-items-center">
                <Skeleton width="80px" height="1.5rem" className="me-2" />
                <Skeleton width="40px" height="1rem" />
              </div>
              <Skeleton width="120px" height="35px" className="mt-3 mt-sm-0 shadow-sm" />
            </div>
          </CardBody>
        </Col>
      </Row>
    </Card>
  );
};

export default WishlistSkeleton;
