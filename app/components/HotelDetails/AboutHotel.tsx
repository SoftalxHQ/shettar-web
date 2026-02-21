'use client';

import { useToggle } from '@/app/hooks';
import { Fragment } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Collapse, Container, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { BsPatchCheckFill, BsShieldFillCheck } from 'react-icons/bs';
import { FaCheckCircle, FaConciergeBell, FaSwimmingPool, FaVolumeUp } from 'react-icons/fa';
import { FaAngleDown, FaAngleUp, FaSnowflake, FaWifi } from 'react-icons/fa6';
import CustomerReview from './CustomerReview';
import HotelPolicies from './HotelPolicies';
import PriceOverView from './PriceOverView';
import RoomOptions from './RoomOptions';

import clsx from 'clsx';
import { amenities } from '@/app/data/hotel-details';

const AboutHotel = ({ hotel, onRefresh }: { hotel: any; onRefresh?: () => void }) => {
  const { isOpen, toggle } = useToggle();

  if (!hotel) return null;

  const hasWifi = hotel.amenities?.free_wifi;
  const hasPool = hotel.amenities?.swimming_pool;
  const hasAC = hotel.amenities?.air_conditioning;
  const hasRoomService = hotel.amenities?.room_service;

  // Group amenities by category for display
  const activeAmenities = Object.entries(hotel.amenities || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

  return (
    <section className="pt-5 pt-lg-10">
      <Container data-sticky-container>
        <Row className="g-4 g-xl-5">
          <Col lg={7} className="order-1">
            <div className="vstack gap-5">
              <Card className="bg-transparent border-0">
                <CardHeader className="border-bottom bg-transparent px-0 pt-0">
                  <h3 className="mb-0">About This Hotel</h3>
                </CardHeader>
                <CardBody className="pt-4 p-0">
                  <h5 className="fw-light mb-4 opacity-75">Main Highlights</h5>
                  <div className="hstack gap-3 mb-3">
                    {hasWifi && (
                      <OverlayTrigger overlay={<Tooltip>Free Wifi</Tooltip>}>
                        <div className="icon-lg bg-body-tertiary h5 rounded-2 flex-centered border" style={{ width: '50px', height: '50px' }}>
                          <FaWifi size={24} className="text-primary" />
                        </div>
                      </OverlayTrigger>
                    )}
                    {hasPool && (
                      <OverlayTrigger overlay={<Tooltip>Swimming Pool</Tooltip>}>
                        <div className="icon-lg bg-body-tertiary h5 rounded-2 flex-centered border" style={{ width: '50px', height: '50px' }}>
                          <FaSwimmingPool size={24} className="text-primary" />
                        </div>
                      </OverlayTrigger>
                    )}
                    {hasAC && (
                      <OverlayTrigger overlay={<Tooltip>Air Conditioning</Tooltip>}>
                        <div className="icon-lg bg-body-tertiary h5 rounded-2 flex-centered border" style={{ width: '50px', height: '50px' }}>
                          <FaSnowflake size={24} className="text-primary" />
                        </div>
                      </OverlayTrigger>
                    )}
                    {hasRoomService && (
                      <OverlayTrigger overlay={<Tooltip>Room Service</Tooltip>}>
                        <div className="icon-lg bg-body-tertiary h5 rounded-2 flex-centered border" style={{ width: '50px', height: '50px' }}>
                          <FaConciergeBell size={24} className="text-primary" />
                        </div>
                      </OverlayTrigger>
                    )}
                  </div>
                  <div className="mb-3">
                    <p className={clsx("mb-0 opacity-75", { "text-truncate-more": !isOpen })} style={{
                      whiteSpace: 'pre-line',
                      display: '-webkit-box',
                      WebkitLineClamp: isOpen ? 'unset' : 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {hotel.description || "No description available for this hotel."}
                    </p>
                  </div>

                  {hotel.description && hotel.description.length > 150 && (
                    <Button
                      variant="link"
                      onClick={toggle}
                      className="p-0 mb-4 mt-1 d-flex align-items-center text-primary text-decoration-none fw-bold small"
                    >
                      {!isOpen ? (
                        <>
                          See more <FaAngleDown className="ms-1" />
                        </>
                      ) : (
                        <>
                          See less <FaAngleUp className="ms-1" />
                        </>
                      )}
                    </Button>
                  )}

                  <h5 className="fw-light mb-2 mt-4 opacity-75">Advantages</h5>
                  <ul className="list-group list-group-borderless mb-0">
                    <li className="list-group-item h6 fw-light d-flex mb-0 items-center bg-transparent border-0 px-0 opacity-75">
                      <BsPatchCheckFill className=" text-success me-2" />
                      Every hotel staff to have Proper PPT kit
                    </li>
                    <li className="list-group-item h6 fw-light d-flex mb-0 items-center bg-transparent border-0 px-0 opacity-75">
                      <BsPatchCheckFill className=" text-success me-2" />
                      Every staff member wears face masks and gloves.
                    </li>
                    <li className="list-group-item h6 fw-light d-flex mb-0 items-center bg-transparent border-0 px-0 opacity-75">
                      <BsPatchCheckFill className=" text-success me-2" />
                      Hotel staff ensures to maintain social distancing.
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
                    <Col sm={12}>
                      <div className="d-flex flex-wrap gap-2">
                        {activeAmenities.map((amenity, idx) => (
                          <div key={idx} className="badge bg-body-tertiary text-body border p-2 px-3 fw-normal shadow-sm items-center">
                            <FaCheckCircle className="text-success me-2" size={14} />
                            {amenity}
                          </div>
                        ))}
                        {activeAmenities.length === 0 && <span className="text-muted">No specific amenities listed.</span>}
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <RoomOptions availableRoomTypes={hotel.available_room_types} hotel={hotel} />

              <CustomerReview
                reviews={hotel.reviews}
                averageRating={hotel.average_rating}
                ratingDistribution={hotel.rating_distribution}
                businessId={hotel.id}
                onReviewPosted={onRefresh}
              />

              <HotelPolicies checkIn={hotel.check_in} checkOut={hotel.check_out} />
            </div>
          </Col>
          <Col as={'aside'} lg={5} className="order-lg-2">
            <PriceOverView hotel={hotel} />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutHotel;
