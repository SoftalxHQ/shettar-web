'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader, Row, Col, Image, Button, Form, Modal } from 'react-bootstrap';
import { BsStarFill, BsStarHalf, BsStar, BsTrash, BsPencilSquare } from 'react-icons/bs';
import { getStoredToken } from '@/app/helpers/auth';
import { hotelPathFromBusiness } from '@/app/helpers/hotel-path';
import {
  reviewComments,
  shouldTruncateReview,
  truncateReview,
  parseApiError,
  commentsAfterRemoval,
  isReviewDeletable,
  type ReviewComment,
} from '@/app/helpers/review-thread';
import ReviewCommentThread from '@/app/components/ReviewCommentThread';
import { useLayoutContext } from '@/app/states';
import { useApi } from '@/app/hooks/useApi';
import { toast } from 'react-hot-toast';
import { Skeleton } from '../';

type ReviewItem = { id: number; rating: number; content: string; date: string; created_at?: string; hotel_name: string; hotel_image?: string | null; business_id: number; business_slug?: string | null; business_unique_id?: string | null; admin_reply?: string | null; admin_reply_by?: string | null; deletable?: boolean; comments?: ReviewComment[] };
function hotelPathFromReview(review: ReviewItem): string | null {
  return hotelPathFromBusiness(review);
}

const ReviewSkeleton = () => (
  <div className="border-bottom mb-4 pb-4">
    <Row className="g-3 g-lg-4">
      <Col md={3} lg={2}>
        <Skeleton height="100px" className="rounded" />
      </Col>
      <Col md={9} lg={10}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Skeleton width="40%" height="20px" />
          <div className="d-flex gap-2">
            <Skeleton width="30px" height="30px" variant="circle" />
            <Skeleton width="30px" height="30px" variant="circle" />
          </div>
        </div>
        <Skeleton width="20%" height="15px" className="mb-3" />
        <Skeleton width="100%" height="40px" className="mb-2" />
        <Skeleton width="30%" height="15px" />
      </Col>
    </Row>
  </div>
);

const Reviews = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ rating: 0, content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedReviewIds, setExpandedReviewIds] = useState<Set<number>>(new Set());
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { apiFetch } = useApi();
  const { account } = useLayoutContext();
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
  const accountId = account?.id as number | undefined;

  const fetchReviews = async () => {
    try {
      const token = getStoredToken();
      const response = await apiFetch(`${API_URL}/api/v1/reviews`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handlePreDelete = (id: number) => {
    const review = reviews.find((r) => r.id === id);
    if (review && !isReviewDeletable(review)) {
      toast.error('Reviews can only be deleted within 24 hours of posting.');
      return;
    }
    setReviewToDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDeleteId) return;
    const review = reviews.find((r) => r.id === reviewToDeleteId);
    if (review && !isReviewDeletable(review)) {
      toast.error('Reviews can only be deleted within 24 hours of posting.');
      setShowDeleteModal(false);
      setReviewToDeleteId(null);
      return;
    }

    setIsDeleting(true);
    try {
      const token = getStoredToken();
      const response = await apiFetch(`${API_URL}/api/v1/reviews/${reviewToDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setReviews((prev: any[]) => prev.filter((r) => r.id !== reviewToDeleteId));
        toast.success('Review deleted successfully');
        setShowDeleteModal(false);
      } else {
        const delData = await response.json().catch(() => ({}));
        toast.error(delData.error?.[0]?.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
      setReviewToDeleteId(null);
    }
  };

  const handleEditClick = (review: any) => {
    setEditingReviewId(review.id);
    setEditForm({ rating: review.rating, content: review.content });
  };

  const submitEdit = async (id: number) => {
    if (!editForm.content.trim() || editForm.rating === 0) {
      toast.error('Please provide a rating and review text.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getStoredToken();
      const response = await apiFetch(`${API_URL}/api/v1/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review: editForm })
      });

      if (response.ok) {
        setReviews((prev: any[]) =>
          prev.map((r) =>
            r.id === id ? { ...r, rating: editForm.rating, content: editForm.content } : r
          )
        );
        setEditingReviewId(null);
        toast.success('Review updated successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.errors?.[0] || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('An error occurred while updating.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleReply = async (reviewId: number, body: string, parentId?: number | null) => {
    const token = getStoredToken();
    const response = await apiFetch(`${API_URL}/api/v1/reviews/${reviewId}/comments`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, ...(parentId ? { parent_id: parentId } : {}) }),
    });
    const data = await response.json();
    if (!response.ok || !data.comment) throw new Error(parseApiError(data, 'Failed to post reply'));
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, comments: [...(r.comments || reviewComments(r)), data.comment] } : r));
    toast.success('Reply posted');
  };

  const handleUpdateComment = async (reviewId: number, commentId: number, body: string) => {
    const token = getStoredToken();
    const response = await apiFetch(`${API_URL}/api/v1/reviews/${reviewId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    const data = await response.json();
    if (!response.ok || !data.comment) throw new Error(parseApiError(data, 'Failed to update reply'));
    setReviews((prev) => prev.map((r) => r.id === reviewId
      ? { ...r, comments: (r.comments || reviewComments(r)).map((c) => (c.id === commentId ? data.comment : c)) }
      : r));
    toast.success('Reply updated');
  };

  const handleDeleteComment = async (reviewId: number, commentId: number) => {
    const token = getStoredToken();
    const response = await apiFetch(`${API_URL}/api/v1/reviews/${reviewId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(parseApiError(data, 'Failed to delete reply'));
    setReviews((prev) => prev.map((r) => r.id === reviewId
      ? { ...r, comments: commentsAfterRemoval(r.comments || reviewComments(r), commentId) }
      : r));
    toast.success('Reply deleted');
  };

  const handleVoteComment = async (reviewId: number, commentId: number, value: 1 | -1) => {
    const token = getStoredToken();
    const response = await apiFetch(`${API_URL}/api/v1/reviews/${reviewId}/comments/${commentId}/vote`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    const data = await response.json();
    if (!response.ok || !data.comment) throw new Error(parseApiError(data, 'Failed to save vote'));
    setReviews((prev) => prev.map((r) => r.id === reviewId
      ? { ...r, comments: (r.comments || reviewComments(r)).map((c) => (c.id === commentId ? data.comment : c)) }
      : r));
  };

  const toggleReviewExpanded = (reviewId: number) => {
    setExpandedReviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 1);
  const shouldShowViewAll = !showAllReviews && reviews.length > 0 && (
    reviews.length > 1 || reviewComments(reviews[0]).length > 0
  );

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<BsStarFill key={i} className="text-warning me-1" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<BsStarHalf key={i} className="text-warning me-1" />);
      } else {
        stars.push(<BsStar key={i} className="text-warning me-1" />);
      }
    }
    return stars;
  };

  return (
    <Card className="border">
      <CardHeader className="border-bottom">
        <h4 className="card-header-title mb-0">My Reviews</h4>
      </CardHeader>

      <CardBody>
        {loading ? (
          <>
            <ReviewSkeleton />
            <ReviewSkeleton />
            <ReviewSkeleton />
          </>
        ) : reviews.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <BsStar size={50} className="text-muted opacity-25" />
            </div>
            <h5>No reviews yet</h5>
            <p className="text-secondary small">You haven't reviewed any hotels yet. Reviews help others make better choices!</p>
          </div>
        ) : (
          <>
          {visibleReviews.map((review, idx) => {
            const hotelPath = hotelPathFromReview(review);
            const isFirst = idx === 0;
            return (
            <div key={review.id} className={idx !== visibleReviews.length - 1 || shouldShowViewAll ? 'border-bottom mb-4 pb-4' : ''}>
              <Row className="g-3 g-lg-4">
                <Col md={3}>
                  {hotelPath ? (
                    <Link href={hotelPath}>
                      <Image
                        src={review.hotel_image || '/assets/images/category_luxury.jpg'}
                        className="card-img rounded-2 shadow-sm"
                        style={{ objectFit: 'cover' }}
                        alt={review.hotel_name}
                      />
                    </Link>
                  ) : (
                    <Image
                      src={review.hotel_image || '/assets/images/category_luxury.jpg'}
                      className="card-img rounded-2 shadow-sm"
                      style={{ objectFit: 'cover' }}
                      alt={review.hotel_name}
                    />
                  )}
                </Col>

                <Col md={9}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      {hotelPath ? (
                        <Link href={hotelPath} className="text-decoration-none"><h5 className="mb-1 text-body">{review.hotel_name}</h5></Link>
                      ) : (
                        <h5 className="mb-1 text-body">{review.hotel_name}</h5>
                      )}
                      <div className="d-flex align-items-center mb-2">
                        <div className="me-2">{renderStars(review.rating)}</div>
                        <span className="small">({review.rating})</span>
                        <span className="badge bg-success-soft ms-2 small">Verified Stay</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="light"
                        size="sm"
                        className="btn-round mb-0"
                        onClick={() => handleEditClick(review)}
                      >
                        <BsPencilSquare />
                      </Button>
                      {isReviewDeletable(review) ? (
                        <Button variant="light" size="sm" className="btn-round mb-0 text-danger" onClick={() => handlePreDelete(review.id)}>
                          <BsTrash />
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {editingReviewId === review.id ? (
                    <div className="mt-3 bg-light p-3 rounded rounded-3">
                      <h6 className="mb-2">Edit Review</h6>
                      <div className="d-flex mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setEditForm((prev) => ({ ...prev, rating: star }))}
                          >
                            {star <= editForm.rating ? (
                              <BsStarFill className="text-warning me-1 fs-5" />
                            ) : (
                              <BsStar className="text-warning me-1 fs-5" />
                            )}
                          </div>
                        ))}
                      </div>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editForm.content}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                        className="mb-3"
                      />
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => submitEdit(review.id)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingReviewId(null)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mb-1 text-body lh-base">
                        &ldquo;{expandedReviewIds.has(review.id) || !shouldTruncateReview(review.content)
                          ? review.content
                          : truncateReview(review.content)}&rdquo;
                      </p>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <span className="small text-secondary">Posted on {review.date}</span>
                        {shouldTruncateReview(review.content) && (
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                            onClick={() => toggleReviewExpanded(review.id)}
                          >
                            {expandedReviewIds.has(review.id) ? 'View less' : 'View more'}
                          </button>
                        )}
                      </div>
                      <ReviewCommentThread
                        review={review}
                        accountId={accountId}
                        isAuthenticated
                        showThread={showAllReviews}
                        reviewRoot={{ reviewId: review.id }}
                        onReply={handleReply}
                        onUpdateComment={handleUpdateComment}
                        onDeleteComment={handleDeleteComment}
                        onVoteComment={handleVoteComment}
                      />
                      {isFirst && shouldShowViewAll && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                          onClick={() => setShowAllReviews(true)}
                        >
                          View all
                        </button>
                      )}
                    </>
                  )}
                </Col>
              </Row>
            </div>
          );
          })}
          {showAllReviews && reviews.length > 1 && (
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
              onClick={() => setShowAllReviews(false)}
            >
              Show less
            </button>
          )}
          </>
        )}
      </CardBody>

      {/* Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
        </Modal.Header>
        <Modal.Body className="text-center pb-4 px-4">
          <div className="bg-danger bg-opacity-10 text-danger rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
            <BsTrash className="fs-3" />
          </div>
          <h4 className="mb-2">Delete this review?</h4>
          <p className="text-secondary mb-0">
            Are you sure you want to delete this review? Reviews can only be removed within 24 hours of posting.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 justify-content-center pb-4">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
            Keep Review
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Yes, delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Reviews;
