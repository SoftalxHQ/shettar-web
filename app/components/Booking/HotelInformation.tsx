'use client';

import { Button, Card, CardBody, CardHeader, Col, Image, Row } from 'react-bootstrap';
import { FaHotel, FaStar } from 'react-icons/fa6';
import Link from 'next/link';
import { BsAlarm, BsBrightnessHigh, BsGeoAlt, BsPatchCheckFill } from 'react-icons/bs';
import { FaStarHalfAlt } from 'react-icons/fa';

const currentYear = new Date().getFullYear();

const HotelInformation = ({
  room,
  hotel,
  startDate,
  endDate,
  roomsCount
}: {
  room: any,
  hotel: any,
  startDate: string | null,
  endDate: string | null,
  roomsCount: string | null
}) => {
  const images = room?.images_url || [];
  const mainImage = images[0] || '/images/category/hotel/4by3/02.jpg';

  const formatDate = (dateStr: string | null, defaultDate: string) => {
    if (!dateStr) return defaultDate;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return defaultDate;
    }
  };

  const displayCheckIn = formatDate(startDate, `4 March ${currentYear}`);
  const displayCheckOut = formatDate(endDate, `8 March ${currentYear}`);

  const formatTime = (timeStr: string | null, defaultTime: string) => {
    if (!timeStr) return defaultTime;
    try {
      // If already in 12h format with AM/PM, return it
      if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;

      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return timeStr;

      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch {
      return defaultTime;
    }
  };

  return (
    <Card className="shadow">
      <CardHeader className="p-4 border-bottom">
        <h3 className="mb-0 items-center">
          <FaHotel className="me-2" />
          {hotel?.name} - {room?.name}
        </h3>
      </CardHeader>
      <CardBody className="p-4">
        <Card className="mb-4 shadow-none border p-3">
          <Row className="align-items-center text-center text-md-start">
            <Col sm={6} md={3}>
              <Image src={mainImage} className="card-img rounded-2" alt="hotel" style={{ height: '100px', objectFit: 'cover' }} />
            </Col>
            <Col sm={6} md={9}>
              <CardBody className="pt-3 pt-sm-0 p-0 ps-md-3">
                <h5 className="card-title mb-1">
                  <Link href={`/hotel/${hotel?.slug}`} className="text-decoration-none">{hotel?.name || 'Hotel Name'}</Link>
                </h5>
                <p className="small mb-2 items-center opacity-75">
                  <BsGeoAlt className=" me-2 text-primary" />
                  {hotel?.address}, {hotel?.city}, {hotel?.state}
                </p>
                <ul className="list-inline mb-0 items-center">
                  {Array.from(new Array(5)).map((_val, idx) => (
                    <li key={idx} className="list-inline-item me-1 mb-1 small">
                      <FaStar size={14} className="text-warning" />
                    </li>
                  ))}
                  <li className="list-inline-item ms-2 h6 small fw-bold mb-0">5.0/5.0</li>
                </ul>
              </CardBody>
            </Col>
          </Row>
        </Card>
        <Row className="g-4">
          <Col lg={4}>
            <div className="bg-light py-3 px-4 rounded-3 h-100 border">
              <h6 className="fw-light small mb-1 opacity-50">Check-in</h6>
              <h5 className="mb-1 h6">{displayCheckIn}</h5>
              <small className="items-center opacity-75">
                <BsAlarm className=" me-1" />
                {formatTime(hotel?.check_in, '2:00 PM')}
              </small>
            </div>
          </Col>
          <Col lg={4}>
            <div className="bg-light py-3 px-4 rounded-3 h-100 border">
              <h6 className="fw-light small mb-1 opacity-50">Check out</h6>
              <h5 className="mb-1 h6">{displayCheckOut}</h5>
              <small className="items-center opacity-75">
                <BsAlarm className=" me-1" />
                {formatTime(hotel?.check_out, '11:00 AM')}
              </small>
            </div>
          </Col>
          <Col lg={4}>
            <div className="bg-light py-3 px-4 rounded-3 h-100 border">
              <h6 className="fw-light small mb-1 opacity-50">Rooms &amp; Guests</h6>
              <h5 className="mb-1 h6">2 Guests - {roomsCount || 1} {parseInt(roomsCount || '1') > 1 ? 'Rooms' : 'Room'}</h5>
              <small className="items-center opacity-75">
                <BsBrightnessHigh className=" me-1" />{room?.name}
              </small>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default HotelInformation;
