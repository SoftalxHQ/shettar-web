'use client';

import { Card, CardBody, CardHeader, Row, Col, Image, Button } from 'react-bootstrap';
import { BsStarFill, BsStarHalf, BsStar, BsTrash, BsPencilSquare } from 'react-icons/bs';
import { reviewsData } from '@/app/data/reviews';

const Reviews = () => {
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
        {reviewsData.map((review, idx) => (
          <div key={review.id} className={idx !== reviewsData.length - 1 ? 'border-bottom mb-4 pb-4' : ''}>
            <Row className="g-3 g-lg-4">
              <Col md={3} lg={2}>
                <Image
                  src={review.hotelImage}
                  className="rounded"
                  alt={review.hotelName}
                  fluid
                />
              </Col>

              <Col md={9} lg={10}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">{review.hotelName}</h5>
                    <div className="d-flex align-items-center mb-2">
                      <div className="me-2">{renderStars(review.rating)}</div>
                      <span className="small">({review.rating})</span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="light" size="sm" className="btn-round mb-0">
                      <BsPencilSquare />
                    </Button>
                    <Button variant="light" size="sm" className="btn-round mb-0 text-danger">
                      <BsTrash />
                    </Button>
                  </div>
                </div>

                <p className="mb-2">"{review.content}"</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small">{review.stayDate}</span>
                  <span className="small">Posted on {review.date}</span>
                </div>
              </Col>
            </Row>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};

export default Reviews;
