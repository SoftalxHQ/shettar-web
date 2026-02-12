'use client';

import SelectFormInput from '../form/SelectFormInput';
import TextAreaFormInput from '../form/TextAreaFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { Fragment } from 'react';
import { Button, Card, Col, Image, ProgressBar, Row, CardHeader, CardBody } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { BsArrowRight } from 'react-icons/bs';
import { FaStarHalfAlt } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import * as yup from 'yup';

const CustomerReview = () => {
  const reviewSchema = yup.object({
    review: yup.string().required('Please enter your review'),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(reviewSchema),
  });

  return (
    <Card className="bg-transparent border-0">
      <CardHeader className="border-bottom bg-transparent px-0 pt-0">
        <h3 className="card-title mb-0">Customer Review</h3>
      </CardHeader>
      <CardBody className="pt-4 p-0">
        <Card className="bg-light p-4 mb-4 border-0">
          <Row className="g-4 align-items-center">
            <Col md={4}>
              <div className="text-center">
                <h2 className="mb-0">4.5</h2>
                <p className="mb-2">Based on 120 Reviews</p>
                <ul className="list-inline mb-0">
                  {Array.from(new Array(4)).map((_val, idx) => (
                    <li className="list-inline-item me-1" key={idx}>
                      <FaStar size={18} className="text-warning" />
                    </li>
                  ))}
                  <li className="list-inline-item me-0">
                    <FaStarHalfAlt size={18} className="text-warning" />
                  </li>
                </ul>
              </div>
            </Col>
            <Col md={8}>
              <CardBody className="p-0">
                <Row className="gx-3 g-2 align-items-center">
                  {[85, 75, 60, 35, 15].map((progress, idx) => {
                    return (
                      <Fragment key={idx}>
                        <Col xs={9} sm={10}>
                          <ProgressBar variant="warning" now={progress} className="progress-sm bg-warning bg-opacity-15" />
                        </Col>
                        <Col xs={3} sm={2} className="text-end">
                          <span className="h6 fw-light mb-0">{progress}%</span>
                        </Col>
                      </Fragment>
                    );
                  })}
                </Row>
              </CardBody>
            </Col>
          </Row>
        </Card>
        <form onSubmit={handleSubmit(() => { })} className="mb-5">
          <div className="form-control-bg-light mb-3">
            <SelectFormInput className="form-select js-choice">
              <option>★★★★★ (5/5)</option>
              <option>★★★★☆ (4/5)</option>
              <option>★★★☆☆ (3/5)</option>
              <option>★★☆☆☆ (2/5)</option>
              <option>★☆☆☆☆ (1/5)</option>
            </SelectFormInput>
          </div>
          <TextAreaFormInput name="review" containerClass="form-control-bg-light mb-3" control={control} rows={3} />

          <Button type="submit" variant="primary" size="lg" className="mb-0 items-center">
            Post review <BsArrowRight className="ms-2" />
          </Button>
        </form>
        <div className="d-md-flex my-4">
          <div className="avatar avatar-lg me-3 flex-shrink-0">
            <Image className="avatar-img rounded-circle" src="/images/avatar/09.jpg" style={{ width: '64px', height: '64px' }} alt="avatar" />
          </div>
          <div>
            <div className="d-flex justify-content-between mt-1 mt-md-0">
              <div>
                <h6 className="me-3 mb-0">Jacqueline Miller</h6>
                <ul className="nav nav-divider small mb-2">
                  <li className="nav-item">Stayed 13 Nov 2022</li>
                  <li className="nav-item">4 Reviews written</li>
                </ul>
              </div>
              <div className="icon-md rounded text-bg-warning fs-6 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>4.5</div>
            </div>
            <p className="mb-2">
              Handsome met debating sir dwelling age material. As style lived he worse dried. Offered related so visitors we private removed. Moderate
              do subjects to distance.{' '}
            </p>
            <Row className="g-4">
              <Col xs={4} sm={3} lg={2}>
                <Image src="/images/category/hotel/4by3/07.jpg" className="rounded" alt="hotel" />
              </Col>
              <Col xs={4} sm={3} lg={2}>
                <Image src="/images/category/hotel/4by3/08.jpg" className="rounded" alt="hotel" />
              </Col>
              <Col xs={4} sm={3} lg={2}>
                <Image src="/images/category/hotel/4by3/05.jpg" className="rounded" alt="hotel" />
              </Col>
            </Row>
          </div>
        </div>
        <div className="my-4 ps-2 ps-md-3">
          <div className="d-md-flex p-3 bg-light rounded-3">
            <Image className="avatar avatar-sm rounded-circle me-3" src="/images/avatar/02.jpg" style={{ width: '40px', height: '40px' }} alt="avatar" />
            <div className="mt-2 mt-md-0">
              <h6 className="mb-1">Manager</h6>
              <p className="mb-0">But discretion frequently sir she instruments unaffected admiration everything. </p>
            </div>
          </div>
        </div>
        <hr />
        <div className="d-md-flex my-4">
          <div className="avatar avatar-lg me-3 flex-shrink-0">
            <Image className="avatar-img rounded-circle" src="/images/avatar/08.jpg" style={{ width: '64px', height: '64px' }} alt="avatar" />
          </div>
          <div>
            <div className="d-flex justify-content-between mt-1 mt-md-0">
              <div>
                <h6 className="me-3 mb-0">Dennis Barrett</h6>
                <ul className="nav nav-divider small mb-2">
                  <li className="nav-item">Stayed 02 Nov 2022</li>
                  <li className="nav-item">2 Reviews written</li>
                </ul>
              </div>
              <div className="icon-md rounded text-bg-warning fs-6 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>4.0</div>
            </div>
            <p className="mb-0">
              Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do. Water timed folly right aware if oh
              truth. Large above be to means. Dashwood does provide stronger is.
            </p>
          </div>
        </div>
        <hr />
        <div className="text-center">
          <Button variant="primary-soft" className="mb-0">
            Load more
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default CustomerReview;
