'use client';

import { Button, Card, CardBody, CardHeader, Col, Image, Row } from 'react-bootstrap';
import { FaHotel, FaStar } from 'react-icons/fa6';
import Link from 'next/link';
import { BsAlarm, BsBrightnessHigh, BsGeoAlt, BsPatchCheckFill } from 'react-icons/bs';
import { FaStarHalfAlt } from 'react-icons/fa';

const currentYear = new Date().getFullYear();

const HotelInformation = () => {
  return (
    <Card className="shadow">
      <CardHeader className="p-4 border-bottom">
        <h3 className="mb-0 items-center">
          <FaHotel className="me-2" />
          Hotel Information
        </h3>
      </CardHeader>
      <CardBody className="p-4">
        <Card className="mb-4">
          <Row className="align-items-center">
            <Col sm={6} md={3}>
              <Image src="/images/category/hotel/4by3/02.jpg" className="card-img" alt="hotel" />
            </Col>
            <Col sm={6} md={9}>
              <CardBody className="pt-3 pt-sm-0 p-0">
                <h5 className="card-title">
                  <Link href="">Pride moon Village Resort &amp; Spa</Link>
                </h5>
                <p className="small mb-2 items-center">
                  <BsGeoAlt className=" me-2" />
                  5855 W Century Blvd, Los Angeles - 90045
                </p>
                <ul className="list-inline mb-0 items-center">
                  {Array.from(new Array(4)).map((_val, idx) => (
                    <li key={idx} className="list-inline-item me-1 mb-1 small">
                      <FaStar size={16} className="text-warning" />
                    </li>
                  ))}
                  <li className="list-inline-item me-0 mb-1 small">
                    <FaStarHalfAlt size={16} className="text-warning" />
                  </li>
                  <li className="list-inline-item ms-3 h6 small fw-bold mb-0">4.5/5.0</li>
                </ul>
              </CardBody>
            </Col>
          </Row>
        </Card>
        <Row className="g-4">
          <Col lg={4}>
            <div className="bg-light py-3 px-4 rounded-3">
              <h6 className="fw-light small mb-1">Check-in</h6>
              <h5 className="mb-1">4 March {currentYear}</h5>
              <small className="items-center">
                <BsAlarm className=" me-1" />
                12:30 pm
              </small>
            </div>
          </Col>
          <Col lg={4}>
            <div className="bg-light py-3 px-4 rounded-3">
              <h6 className="fw-light small mb-1">Check out</h6>
              <h5 className="mb-1">8 March {currentYear}</h5>
              <small className="items-center">
                <BsAlarm className=" me-1" />
                4:30 pm
              </small>
            </div>
          </Col>
          <Col lg={4}>
            <div className="bg-light py-3 px-4 rounded-3">
              <h6 className="fw-light small mb-1">Rooms &amp; Guests</h6>
              <h5 className="mb-1">2 G - 1 R</h5>
              <small className="items-center">
                <BsBrightnessHigh className=" me-1" />3 Nights - 4 Days
              </small>
            </div>
          </Col>
        </Row>
        <Card className="border mt-4">
          <CardHeader className="border-bottom d-md-flex justify-content-md-between bg-transparent">
            <h5 className="card-title mb-0">Deluxe Pool View with Breakfast</h5>
            <Button variant="link" className="p-0 mb-0">
              View Cancellation Policy
            </Button>
          </CardHeader>
          <CardBody className="card-body">
            <h6>Price Included</h6>
            <ul className="list-group list-group-borderless mb-0">
              <li className="list-group-item h6 fw-light d-flex mb-0 items-center ">
                <BsPatchCheckFill className=" text-success me-2" />
                Free Breakfast and Lunch/Dinner.
              </li>
              <li className="list-group-item h6 fw-light d-flex mb-0 items-center ">
                <BsPatchCheckFill className=" text-success me-2" />
                Great Small Breaks.
              </li>
              <li className="list-group-item h6 fw-light d-flex mb-0 items-center ">
                <BsPatchCheckFill className=" text-success me-2" />
                Free Stay for Kids Below the age of 12 years.
              </li>
              <li className="list-group-item h6 fw-light d-flex mb-0 items-center ">
                <BsPatchCheckFill className=" text-success me-2" />
                On Cancellation, You will not get any refund
              </li>
            </ul>
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  );
};

export default HotelInformation;
