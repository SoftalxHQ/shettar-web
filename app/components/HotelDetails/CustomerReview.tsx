'use client';

import TextAreaFormInput from '../form/TextAreaFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { Fragment, useState, useRef } from 'react';
import { Button, Card, Col, ProgressBar, Row, CardHeader, CardBody } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { BsArrowRight, BsStar, BsStarFill, BsStarHalf } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa6';
import { FaStarHalfAlt } from 'react-icons/fa';
import * as yup from 'yup';
import Link from 'next/link';
import { useLayoutContext } from '@/app/states';
import { getStoredToken } from '@/app/helpers/auth';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  reviewer: string;
  rating: number;
  content: string;
  created_at: string;
}

type FormValues = {
  review: string;
};

interface CustomerReviewProps {
  reviews: Review[];
  averageRating: number;
  businessId: string | number;
  onReviewPosted?: () => void;
}

// ── Star Rating Picker ─────────────────────────────────────────────────────────

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="d-flex align-items-center gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="btn p-0 border-0 bg-transparent lh-1"
          style={{ fontSize: '1.75rem', lineHeight: 1 }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          <FaStar
            className={active >= star ? 'text-warning' : 'text-secondary opacity-25'}
            style={{ transition: 'color 0.15s' }}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="small text-secondary ms-2">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const CustomerReview = ({ reviews, averageRating, businessId, onReviewPosted }: CustomerReviewProps) => {
  const { isAuthenticated } = useLayoutContext();
  const [rating, setRating] = useState(5);
  const [ratingError, setRatingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewSchema = yup.object({
    review: yup
      .string()
      .min(10, 'Your review must be at least 10 characters')
      .required('Please enter your review'),
  });

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: yupResolver(reviewSchema),
  });

  const displayRating = averageRating || 0;
  const displayCount = reviews?.length || 0;

  const onSubmit = async (values: FormValues) => {
    if (rating < 1) {
      setRatingError('Please select a star rating');
      return;
    }
    setRatingError('');
    setIsSubmitting(true);

    const token = getStoredToken();
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

    const toastId = toast.loading('Posting your review…');
    try {
      const res = await fetch(`${API_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          review: {
            rating,
            content: values.review,
            business_id: businessId,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Review posted! Thank you for your feedback.', { id: toastId });
        reset();
        setRating(5);
        onReviewPosted?.();
      } else {
        const msg =
          data?.error?.[0]?.message ||
          data?.errors?.[0] ||
          data?.message ||
          'Could not post review. Please try again.';
        toast.error(msg, { id: toastId });
      }
    } catch {
      toast.error('Unable to connect to server. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-transparent border-0">
      <CardHeader className="border-bottom bg-transparent px-0 pt-0">
        <h3 className="card-title mb-0">Customer Review</h3>
      </CardHeader>
      <CardBody className="pt-4 p-0">
        {/* Rating summary */}
        <Card className="bg-body-tertiary p-4 mb-4 border-0">
          <Row className="g-4 align-items-center">
            <Col md={4}>
              <div className="text-center">
                <h2 className="mb-0">{displayRating}</h2>
                <p className="mb-2 opacity-50">Based on {displayCount} review{displayCount !== 1 ? 's' : ''}</p>
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
                  {[85, 75, 60, 35, 15].map((progress, idx) => (
                    <Fragment key={idx}>
                      <Col xs={9} sm={10}>
                        <ProgressBar variant="warning" now={progress} className="progress-sm bg-warning bg-opacity-10" />
                      </Col>
                      <Col xs={3} sm={2} className="text-end">
                        <span className="h6 fw-light mb-0">{progress}%</span>
                      </Col>
                    </Fragment>
                  ))}
                </Row>
              </CardBody>
            </Col>
          </Row>
        </Card>

        {/* Reviews list */}
        <div className="vstack gap-4">
          {reviews?.map((review, idx) => (
            <div key={review.id || idx}>
              <div className="d-md-flex my-4">
                <div className="avatar avatar-lg me-3 flex-shrink-0">
                  <div
                    className="avatar-img rounded-circle bg-primary-soft flex-centered h5 text-primary"
                    style={{ width: '64px', height: '64px' }}
                  >
                    {review.reviewer?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="w-100">
                  <div className="d-flex justify-content-between mt-1 mt-md-0">
                    <div>
                      <h6 className="me-3 mb-0">{review.reviewer || 'Anonymous'}</h6>
                      <ul className="nav nav-divider small mb-2">
                        <li className="nav-item opacity-50">
                          {new Date(review.created_at).toLocaleDateString()}
                        </li>
                      </ul>
                    </div>
                    <div
                      className="icon-md rounded text-bg-warning fs-6 d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px' }}
                    >
                      {review.rating}
                    </div>
                  </div>
                  <p className="mb-2">{review.content}</p>
                </div>
              </div>
              {idx < reviews.length - 1 && <hr />}
            </div>
          ))}

          {(!reviews || reviews.length === 0) && (
            <div className="text-center py-4 bg-body-tertiary rounded-3 mb-4">
              <p className="opacity-50 mb-0">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>

        {/* Review form (authenticated) */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit(onSubmit)} className="mb-5 mt-5">
            <h5 className="mb-1">Leave a Review</h5>
            <p className="text-secondary small mb-3">Share your honest experience with other travelers.</p>

            {/* Star picker */}
            <div className="mb-1">
              <label className="form-label small fw-semibold">Your Rating</label>
              <StarPicker value={rating} onChange={setRating} />
              {ratingError && <div className="text-danger small mt-1">{ratingError}</div>}
            </div>

            <TextAreaFormInput
              name="review"
              containerClass="form-control-bg-light mb-3"
              control={control}
              rows={4}
              placeholder="What did you love (or not love) about your stay? Mention cleanliness, service, location…"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mb-0 d-flex align-items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Posting…
                </>
              ) : (
                <>
                  Post Review <BsArrowRight className="ms-2" />
                </>
              )}
            </Button>
          </form>
        ) : (
          /* Sign-in prompt (unauthenticated) */
          <Card className="bg-primary bg-opacity-10 border border-primary border-opacity-25 p-4 p-sm-5 text-center mt-5 mb-5 rounded-4">
            <h4 className="mb-2">Share Your Experience</h4>
            <p className="mb-4 text-secondary mx-auto" style={{ maxWidth: '400px' }}>
              You must be signed in to leave a review. Join our community to share your feedback with other travelers.
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Link href="/auth/sign-in" className="btn btn-primary px-4 py-2 flex-centered">
                Sign In
              </Link>
              <Link href="/auth/sign-up" className="btn btn-outline-primary px-4 py-2 flex-centered">
                Create Account
              </Link>
            </div>
          </Card>
        )}
      </CardBody>
    </Card>
  );
};

export default CustomerReview;
