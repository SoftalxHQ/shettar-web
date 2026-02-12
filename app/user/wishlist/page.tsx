'use client';

import { SelectFormInput, WishCard } from '@/app/components';
import { Button, Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import UserLayout from '@/app/components/layouts/UserLayout';
import { wishListCards } from '@/app/data/wishlist';

const WishlistPage = () => {
  return (
    <UserLayout>
      <Card className="border bg-transparent">
        <CardHeader className="bg-transparent border-bottom">
          <h4 className="card-header-title text-dark">My Wishlist</h4>
        </CardHeader>
        <CardBody className="vstack gap-4">
          <form className="d-flex justify-content-between flex-wrap gap-2 align-items-center">
            <Col xs={6} xl={3}>
              <SelectFormInput className="form-select form-select-sm js-choice border-0 bg-light">
                <option value={-1}>Sort by</option>
                <option>Recently search</option>
                <option>Most popular</option>
                <option>Top rated</option>
              </SelectFormInput>
            </Col>
            <Button variant="danger-soft" className="mb-0 items-center d-flex">
              <FaTrash className="me-2" />
              Remove all
            </Button>
          </form>

          {wishListCards.map((card, idx) => (
            <WishCard key={idx} wishCard={card} />
          ))}

        </CardBody>
      </Card>
    </UserLayout>
  );
};

export default WishlistPage;
