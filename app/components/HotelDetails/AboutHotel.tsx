'use client';

import { useToggle } from '@/app/hooks';
import { Fragment } from 'react';
import { Card, CardBody, CardHeader, Col, Collapse, Container, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { BsPatchCheckFill, BsShieldFillCheck } from 'react-icons/bs';
import { FaCheckCircle, FaConciergeBell, FaSwimmingPool, FaVolumeUp } from 'react-icons/fa';
import { FaAngleDown, FaAngleUp, FaSnowflake, FaWifi } from 'react-icons/fa6';
import CustomerReview from './CustomerReview';
import HotelPolicies from './HotelPolicies';
import PriceOverView from './PriceOverView';
import RoomOptions from './RoomOptions';

import { amenities } from '@/app/data/hotel-details';

const AboutHotel = () => {
  const { isOpen, toggle } = useToggle();

  return (
    <section className="pt-0">
      <Container data-sticky-container>
        <Row className="g-4 g-xl-5">
          <Col xl={7} className="order-1">
            <div className="vstack gap-5">
              <Card className="bg-transparent border-0">
                <CardHeader className="border-bottom bg-transparent px-0 pt-0">
                  <h3 className="mb-0">About This Hotel</h3>
                </CardHeader>
                <CardBody className="pt-4 p-0">
                  <h5 className="fw-light mb-4">Main Highlights</h5>
                  <div className="hstack gap-3 mb-3">
                    <OverlayTrigger overlay={<Tooltip>Free Wifi</Tooltip>}>
                      <div className="icon-lg bg-light h5 rounded-2 flex-centered" style={{ width: '50px', height: '50px' }}>
                        <FaWifi size={24} />
                      </div>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Swimming Pool</Tooltip>}>
                      <div className="icon-lg bg-light h5 rounded-2 flex-centered" style={{ width: '50px', height: '50px' }}>
                        <FaSwimmingPool size={24} />
                      </div>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Central AC</Tooltip>}>
                      <div className="icon-lg bg-light h5 rounded-2 flex-centered" style={{ width: '50px', height: '50px' }}>
                        <FaSnowflake size={24} />
                      </div>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Free Service</Tooltip>}>
                      <div className="icon-lg bg-light h5 rounded-2 flex-centered" style={{ width: '50px', height: '50px' }}>
                        <FaConciergeBell size={24} />
                      </div>
                    </OverlayTrigger>
                  </div>
                  <p className="mb-3">
                    Demesne far-hearted suppose venture excited see had has. Dependent on so extremely delivered by. Yet no jokes worse her why.{' '}
                    <b>Bed one supposing breakfast day fulfilled off depending questions.</b>
                  </p>
                  <p className="mb-0">
                    Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do. Water timed folly right aware if
                    oh truth. Large above be to means. Dashwood does provide stronger is.
                  </p>
                  <Collapse in={isOpen}>
                    <div>
                      <p className="my-3">
                        We focus a great deal on the understanding of behavioral psychology and influence triggers which are crucial for becoming a
                        well rounded Digital Marketer. We understand that theory is important to build a solid foundation, we understand that theory
                        alone isn't going to get the job done so that's why this rickets is packed with practical hands-on examples that you can
                        follow step by step.
                      </p>
                      <p className="mb-0">
                        Behavioral psychology and influence triggers which are crucial for becoming a well rounded Digital Marketer. We understand
                        that theory is important to build a solid foundation, we understand that theory alone isn't going to get the job done so
                        that's why this tickets is packed with practical hands-on examples that you can follow step by step.
                      </p>
                    </div>
                  </Collapse>
                  <a onClick={(e) => { e.preventDefault(); toggle(); }} className="p-0 mb-4 mt-2 btn-more d-flex align-items-center collapsed" href="#">
                    {!isOpen ? (
                      <Fragment>
                        <span className="see-more" role="button">
                          See more
                        </span>
                        <FaAngleDown className="ms-2" />
                      </Fragment>
                    ) : (
                      <Fragment>
                        <span role="button">See less</span>
                        <FaAngleUp className="ms-2" />
                      </Fragment>
                    )}
                  </a>
                  <h5 className="fw-light mb-2">Advantages</h5>
                  <ul className="list-group list-group-borderless mb-0">
                    <li className="list-group-item h6 fw-light d-flex mb-0 items-center">
                      <BsPatchCheckFill className=" text-success me-2" />
                      Every hotel staff to have Proper PPT kit for COVID-19
                    </li>
                    <li className="list-group-item h6 fw-light d-flex mb-0 items-center">
                      <BsPatchCheckFill className=" text-success me-2" />
                      Every staff member wears face masks and gloves at all service times.
                    </li>
                    <li className="list-group-item h6 fw-light d-flex mb-0 items-center">
                      <BsPatchCheckFill className=" text-success me-2" />
                      Hotel staff ensures to maintain social distancing at all times.
                    </li>
                    <li className="list-group-item h6 fw-light d-flex mb-0 items-center">
                      <BsPatchCheckFill className=" text-success me-2" />
                      The hotel has In-Room Dining options available{' '}
                    </li>
                  </ul>
                </CardBody>
              </Card>
              <Card className="bg-transparent border-0">
                <CardHeader className="border-bottom bg-transparent px-0 pt-0">
                  <h3 className="card-title mb-0">Amenities</h3>
                </CardHeader>
                <CardBody className="pt-4 p-0">
                  <Row className="g-4">
                    {amenities.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <Col sm={6} key={idx}>
                          <h6>
                            <Icon size={18} className="me-2" />
                            {item.label}
                          </h6>
                          <ul className="list-group list-group-borderless mt-2 mb-0">
                            {item.name.map((subItem, subIdx) => (
                              <li key={subIdx} className="list-group-item pb-0 items-center">
                                <FaCheckCircle className="text-success me-2" />
                                {subItem}
                              </li>
                            ))}
                          </ul>
                        </Col>
                      );
                    })}
                    <div className="col-sm-6">
                      <h6 className="items-center">
                        <BsShieldFillCheck className=" me-2" />
                        Safety &amp; Security
                      </h6>
                      <ul className="list-group list-group-borderless mt-2 mb-4 mb-sm-5">
                        <li className="list-group-item pb-0 items-center">
                          <FaCheckCircle className="text-success me-2" />
                          Doctor on Call
                        </li>
                      </ul>
                      <h6>
                        <FaVolumeUp className="me-2" />
                        Staff Language
                      </h6>
                      <ul className="list-group list-group-borderless mt-2 mb-0">
                        <li className="list-group-item pb-0 items-center">
                          <FaCheckCircle className="text-success me-2" />
                          English
                        </li>
                        <li className="list-group-item pb-0 items-center">
                          <FaCheckCircle className="text-success me-2" />
                          Spanish
                        </li>
                        <li className="list-group-item pb-0 items-center">
                          <FaCheckCircle className="text-success me-2" />
                          Hindi
                        </li>
                      </ul>
                    </div>
                  </Row>
                </CardBody>
              </Card>

              <RoomOptions />

              <CustomerReview />

              <HotelPolicies />
            </div>
          </Col>
          <Col as={'aside'} xl={5} className="order-xl-2">
            <PriceOverView />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutHotel;
