'use client';

import { Card, CardBody, CardHeader, Col, Row, Image, Button } from 'react-bootstrap';
import { BsPencilSquare, BsPerson, BsEnvelope, BsPhone, BsGlobe, BsCalendarDate, BsGenderAmbiguous, BsGeoAlt } from 'react-icons/bs';
import Link from 'next/link';

const UserDetails = () => {
  const user = {
    name: 'Jacqueline Miller',
    email: 'hello@gmail.com',
    mobileNo: '+1 222 555 666',
    nationality: 'United States',
    dob: '29 Aug 1996',
    gender: 'Female',
    address: '2119 N Division Ave, New Hampshire, York, United States',
    avatar: '/images/avatar/01.jpg'
  };

  return (
    <Card className="border">
      <CardHeader className="border-bottom d-flex justify-content-between align-items-center">
        <h4 className="card-header-title text-dark mb-0">Personal Information</h4>
        <Link href="/user/settings" className="btn btn-sm btn-primary-soft">
          <BsPencilSquare className="me-1" /> Edit
        </Link>
      </CardHeader>

      <CardBody>
        <div className="d-flex align-items-center mb-4 pb-4 border-bottom">
          <div className="avatar avatar-xl me-4">
            <Image
              className="avatar-img rounded-circle border border-white border-3 shadow"
              src={user.avatar}
              alt="avatar"
              width={100}
              height={100}
            />
          </div>
          <div>
            <h5 className="mb-1 text-dark">{user.name}</h5>
            <p className="mb-0 text-secondary">Verified Member</p>
          </div>
        </div>

        <Row className="g-4">
          <Col md={6}>
            <div className="d-flex align-items-center mb-3">
              <div className="icon-sm bg-light text-primary rounded-circle me-3 flex-centered">
                <BsEnvelope size={14} />
              </div>
              <div>
                <p className="text-secondary small mb-0">Email address</p>
                <h6 className="text-dark mb-0">{user.email}</h6>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex align-items-center mb-3">
              <div className="icon-sm bg-light text-primary rounded-circle me-3 flex-centered">
                <BsPhone size={14} />
              </div>
              <div>
                <p className="text-secondary small mb-0">Mobile number</p>
                <h6 className="text-dark mb-0">{user.mobileNo}</h6>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex align-items-center mb-3">
              <div className="icon-sm bg-light text-primary rounded-circle me-3 flex-centered">
                <BsGlobe size={14} />
              </div>
              <div>
                <p className="text-secondary small mb-0">Nationality</p>
                <h6 className="text-dark mb-0">{user.nationality}</h6>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex align-items-center mb-3">
              <div className="icon-sm bg-light text-primary rounded-circle me-3 flex-centered">
                <BsCalendarDate size={14} />
              </div>
              <div>
                <p className="text-secondary small mb-0">Date of Birth</p>
                <h6 className="text-dark mb-0">{user.dob}</h6>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex align-items-center mb-3">
              <div className="icon-sm bg-light text-primary rounded-circle me-3 flex-centered">
                <BsGenderAmbiguous size={14} />
              </div>
              <div>
                <p className="text-secondary small mb-0">Gender</p>
                <h6 className="text-dark mb-0">{user.gender}</h6>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex align-items-center mb-3">
              <div className="icon-sm bg-light text-primary rounded-circle me-3 flex-centered">
                <BsGeoAlt size={14} />
              </div>
              <div>
                <p className="text-secondary small mb-0">Address</p>
                <h6 className="text-dark mb-0">{user.address}</h6>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default UserDetails;
