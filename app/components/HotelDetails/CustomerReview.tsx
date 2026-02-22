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
  first_name?: string;
  last_name?: string;
  reviewer_avatar?: string;
  review_count?: number;
  stay_date?: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at?: string;
  verified?: boolean;
}

type FormValues = {
  review: string;
};

interface CustomerReviewProps {
  reviews: Review[];
  averageRating: number;
  ratingDistribution?: { rating: number; count: number; percentage: number }[];
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

const CustomerReview = ({ reviews, averageRating, ratingDistribution, businessId, onReviewPosted }: CustomerReviewProps) => {
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

  const getFormatName = (review: Review) => {
    const firstName = review.first_name || '';
    const lastName = review.last_name || '';
    if (!firstName && !lastName) return review.reviewer || 'Anonymous';
    return `${firstName} ${lastName ? lastName.charAt(0) + '.' : ''}`;
  }

  const getInitials = (review: Review) => {
    return (review.first_name?.charAt(0) || review.reviewer?.charAt(0) || 'U').toUpperCase();
  }

  return (
    <Card className="bg-transparent border-0">
      <CardHeader className="border-bottom bg-transparent px-0 pt-0">
        <h3 className="card-title mb-0 fw-bold" style={{ color: '#000' }}>Customer Review</h3>
      </CardHeader>
      <CardBody className="pt-4 p-0">
        {/* Rating summary */}
        <Card className="bg-body-tertiary p-4 mb-5 border-0 rounded-4">
          <Row className="g-4 align-items-center">
            <Col md={4} className="position-relative">
              <div className="text-center">
                <h1 className="display-4 fw-bold mb-0" style={{ color: '#000', fontSize: '4.5rem' }}>{displayRating}</h1>
                <p className="mb-2 text-secondary fw-medium fs-6">Based on {displayCount} review{displayCount !== 1 ? 's' : ''}</p>
                <div className="d-flex justify-content-center gap-1 mb-0">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const diff = displayRating - idx;
                    if (diff >= 1) return <FaStar key={idx} className="text-warning" size={24} />;
                    if (diff >= 0.5) return <FaStarHalfAlt key={idx} className="text-warning" size={24} />;
                    return <FaStar key={idx} className="text-secondary opacity-25" size={24} />;
                  })}
                </div>
              </div>
              {/* Vertical divider for md+ screens */}
              <div className="d-none d-md-block position-absolute end-0 top-50 translate-middle-y bg-secondary opacity-25" style={{ width: '1px', height: '80%' }}></div>
            </Col>
            <Col md={8}>
              <div className="ps-md-4">
                <div className="vstack gap-3">
                  {(ratingDistribution || [
                    { rating: 5, percentage: 85 },
                    { rating: 4, percentage: 75 },
                    { rating: 3, percentage: 60 },
                    { rating: 2, percentage: 35 },
                    { rating: 1, percentage: 15 },
                  ]).map((item, idx) => (
                    <Row key={idx} className="align-items-center g-3">
                      <Col style={{ minWidth: '0' }}>
                        <div className="progress rounded-pill bg-secondary bg-opacity-10" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-warning rounded-pill"
                            role="progressbar"
                            style={{ width: `${item.percentage}%` }}
                            aria-valuenow={item.percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </Col>
                      <Col xs="auto" style={{ width: '50px' }} className="text-end">
                        <span className="small fw-bold text-dark">{item.percentage}%</span>
                      </Col>
                    </Row>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Reviews list */}
        <div className="vstack gap-5">
          {reviews?.map((review, idx) => (
            <div key={review.id || idx}>
              <div className="d-flex gap-4 mb-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.reviewer_avatar ? (
                    <img
                      src={review.reviewer_avatar}
                      className="rounded-circle shadow-sm"
                      style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                      alt={review.reviewer}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm"
                      style={{ width: '56px', height: '56px' }}
                    >
                      {getInitials(review)}
                    </div>
                  )}
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-0 fw-bold fs-5 text-dark">{getFormatName(review)}</h6>
                      <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                        <span className="small text-secondary">
                          {review.stay_date ? `Stayed ${new Date(review.stay_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="small text-secondary">•</span>
                        <span className="small text-secondary">{review.review_count || 1} Review{review.review_count !== 1 ? 's' : ''} written</span>
                        {review.updated_at && new Date(review.updated_at).getTime() - new Date(review.created_at).getTime() > 1000 && (
                          <>
                            <span className="small text-secondary">•</span>
                            <span className="small text-secondary fst-italic">Edited</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3 bg-warning px-3 py-2 fw-bold text-dark d-flex align-items-center justify-content-center shadow-sm" style={{ minWidth: '45px' }}>
                      {review.rating}
                    </div>
                  </div>

                  <p className="mt-3 text-secondary lh-base fs-6 mb-0" style={{ maxWidth: '800px' }}>
                    {review.content}
                  </p>
                </div>
              </div>
              {idx < reviews.length - 1 && <hr className="my-4 opacity-50" />}
            </div>
          ))}

          {(!reviews || reviews.length === 0) && (
            <div className="text-center py-5 bg-body-tertiary rounded-4 mb-4">
              <p className="text-secondary mb-0">No reviews yet. Be the first to share your experience!</p>
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
