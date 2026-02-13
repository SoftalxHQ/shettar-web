'use client';

import React from 'react';
import { Card, CardBody, CardFooter } from 'react-bootstrap';
import Skeleton from './Skeleton';

const HotelGridSkeleton = () => {
  return (
    <Card className="shadow p-2 pb-0 h-100 border-0 mb-4">
      <Skeleton height="200px" className="rounded-2" />
      <CardBody className="px-3 pb-0 pt-3">
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <Skeleton width="60px" height="24px" />
          <Skeleton width="24px" height="24px" variant="circle" />
        </div>
        <Skeleton width="80%" height="1.2rem" className="mb-3" />
        <div className="d-flex gap-2 mb-3">
          <Skeleton width="60px" height="15px" />
          <Skeleton width="60px" height="15px" />
        </div>
      </CardBody>
      <CardFooter className="pt-0 bg-transparent border-0 pb-3">
        <div className="d-sm-flex justify-content-sm-between align-items-center">
          <div className="d-flex align-items-center">
            <Skeleton width="70px" height="1.5rem" className="me-2" />
            <Skeleton width="30px" height="1rem" />
          </div>
          <Skeleton width="100px" height="30px" className="mt-2 mt-sm-0" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default HotelGridSkeleton;
