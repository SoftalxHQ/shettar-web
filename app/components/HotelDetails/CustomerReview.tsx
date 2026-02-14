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

const CustomerReview = ({ reviews, averageRating }: { reviews: any[], averageRating: number }) => {
  const reviewSchema = yup.object({
    review: yup.string().required('Please enter your review'),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(reviewSchema),
  });

  const displayRating = averageRating || 0;
  const displayCount = reviews?.length || 0;

  return (
    <Card className="bg-transparent border-0">
      <CardHeader className="border-bottom bg-transparent px-0 pt-0">
        <h3 className="card-title mb-0">Customer Review</h3>
      </CardHeader>
      <CardBody className="pt-4 p-0">
        <Card className="bg-body-tertiary p-4 mb-4 border-0">
          <Row className="g-4 align-items-center">
            <Col md={4}>
              <div className="text-center">
                <h2 className="mb-0">{displayRating}</h2>
                <p className="mb-2 opacity-50">Based on {displayCount} Reviews</p>
                <ul className="list-inline mb-0 text-center justify-content-center d-flex">
                  {Array.from(new Array(Math.floor(displayRating))).map((_val, idx) => (
                    <li className="list-inline-item me-1" key={idx}>
                      <FaStar size={18} className="text-warning" />
                    </li>
                  ))}
                  {displayRating % 1 !== 0 && (
                    <li className="list-inline-item me-0">
                      <FaStarHalfAlt size={18} className="text-warning" />
                    </li>
                  )}
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
                          <ProgressBar variant="warning" now={progress} className="progress-sm bg-warning bg-opacity-10" />
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

        {/* Real Reviews List */}
        <div className="vstack gap-4">
          {reviews?.map((review, idx) => (
            <div key={review.id || idx}>
              <div className="d-md-flex my-4">
                <div className="avatar avatar-lg me-3 flex-shrink-0">
                  <div className="avatar-img rounded-circle bg-primary-soft flex-centered h5 text-primary" style={{ width: '64px', height: '64px' }}>
                    {review.reviewer?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="w-100">
                  <div className="d-flex justify-content-between mt-1 mt-md-0">
                    <div>
                      <h6 className="me-3 mb-0">{review.reviewer || 'Anonymous'}</h6>
                      <ul className="nav nav-divider small mb-2">
                        <li className="nav-item opacity-50">{new Date(review.created_at).toLocaleDateString()}</li>
                      </ul>
                    </div>
                    <div className="icon-md rounded text-bg-warning fs-6 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>{review.rating}</div>
                  </div>
                  <p className="mb-2">
                    {review.content}
                  </p>
                </div>
              </div>
              {idx < reviews.length - 1 && <hr />}
            </div>
          ))}

          {(!reviews || reviews.length === 0) && (
            <div className="text-center py-4 bg-body-tertiary rounded-3 mb-4">
              <p className="opacity-50 mb-0">No reviews yet for this hotel.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(() => { })} className="mb-5 mt-5">
          <h5 className="mb-3">Leave a Review</h5>
          <div className="mb-3">
            <SelectFormInput className="form-select js-choice">
              <option value="5">★★★★★ (5/5)</option>
              <option value="4">★★★★☆ (4/5)</option>
              <option value="3">★★★☆☆ (3/5)</option>
              <option value="2">★★☆☆☆ (2/5)</option>
              <option value="1">★☆☆☆☆ (1/5)</option>
            </SelectFormInput>
          </div>
          <TextAreaFormInput name="review" containerClass="form-control-bg-light mb-3" control={control} rows={3} placeholder="Share your experience..." />

          <Button type="submit" variant="primary" size="lg" className="mb-0 items-center">
            Post review <BsArrowRight className="ms-2" />
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default CustomerReview;
