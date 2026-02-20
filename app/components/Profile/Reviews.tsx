'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Row, Col, Image, Button, Spinner } from 'react-bootstrap';
import { BsStarFill, BsStarHalf, BsStar, BsTrash, BsPencilSquare } from 'react-icons/bs';
import { getStoredToken } from '@/app/helpers/auth';
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

  const fetchReviews = async () => {
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await fetch(`${API_URL}/api/v1/reviews`, {
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await fetch(`${API_URL}/api/v1/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        toast.success('Review deleted');
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('An error occurred');
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
                <Col md={3} lg={2}>
                  <Image
                    src={review.hotel_image || '/assets/images/category_luxury.jpg'}
                    className="rounded shadow-sm"
                    alt={review.hotel_name}
                    fluid
                  />
                </Col>

                <Col md={9} lg={10}>
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
                        onClick={() => toast.success('Editing coming soon!')}
                      >
                        <BsPencilSquare />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="btn-round mb-0 text-danger"
                        onClick={() => handleDelete(review.id)}
                      >
                        <BsTrash />
                      </Button>
                    </div>
                  </div>

                  <p className="mb-2 text-dark">"{review.content}"</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-secondary">Posted on {review.date}</span>
                  </div>
                </Col>
              </Row>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
};

export default Reviews;
