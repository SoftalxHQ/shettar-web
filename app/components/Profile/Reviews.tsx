'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Row, Col, Image, Button, Form, Modal } from 'react-bootstrap';
import { BsStarFill, BsStarHalf, BsStar, BsTrash, BsPencilSquare } from 'react-icons/bs';
import { getStoredToken } from '@/app/helpers/auth';
import { useApi } from '@/app/hooks/useApi';
import { toast } from 'react-hot-toast';
import { Skeleton } from '../';

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
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ rating: 0, content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { apiFetch } = useApi();

  const fetchReviews = async () => {
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
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
    setReviewToDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDeleteId) return;

    setIsDeleting(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
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
        toast.error('Failed to delete review');
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
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
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
          reviews.map((review, idx) => (
            <div key={review.id} className={idx !== reviews.length - 1 ? 'border-bottom mb-4 pb-4' : ''}>
              <Row className="g-3 g-lg-4">
                <Col md={3}>
                  <Image
                    src={review.hotel_image || '/assets/images/category_luxury.jpg'}
                    className="card-img rounded-2 shadow-sm"
                    style={{ objectFit: 'cover' }}
                    alt={review.hotel_name}
                  />
                </Col>

                <Col md={9}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-1">{review.hotel_name}</h5>
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
                      <Button
                        variant="light"
                        size="sm"
                        className="btn-round mb-0 text-danger"
                        onClick={() => handlePreDelete(review.id)}
                      >
                        <BsTrash />
                      </Button>
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
                      <p className="mb-2 text-dark">"{review.content}"</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-secondary">Posted on {review.date}</span>
                      </div>
                    </>
                  )}
                </Col>
              </Row>
            </div>
          ))
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
            Are you sure you want to permanently delete this review? This action cannot be undone.
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
