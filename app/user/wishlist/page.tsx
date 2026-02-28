'use client';

import { useEffect, useState } from 'react';
import { SelectFormInput, WishCard, WishlistSkeleton } from '@/app/components';
import { Button, Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import UserLayout from '@/app/components/layouts/UserLayout';
import { getStoredToken } from '@/app/helpers/auth';
import { useApi } from '@/app/hooks/useApi';
import { toast } from 'react-hot-toast';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { apiFetch } = useApi();

  const fetchWishlist = async () => {
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await apiFetch(`${API_URL}/api/v1/wishlists`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (businessId: number) => {
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await apiFetch(`${API_URL}/api/v1/wishlists/${businessId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.business.id !== businessId));
        toast.success('Removed from wishlist');
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('An error occurred');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) return;

    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await apiFetch(`${API_URL}/api/v1/wishlists/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setWishlist([]);
        toast.success('Wishlist cleared successfully');
      } else {
        toast.error('Failed to clear wishlist');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('An error occurred');
    }
  };

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
            {wishlist.length > 0 && (
              <Button variant="danger-soft" className="mb-0 items-center d-flex" onClick={handleClearAll}>
                <FaTrash className="me-2" />
                Remove all
              </Button>
            )}
          </form>

          {loading ? (
            <div className="vstack gap-4">
              {[1, 2, 3].map((n) => (
                <WishlistSkeleton key={n} />
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">Your wishlist is empty</h5>
              <p className="small text-secondary">Save hotels you like to find them easily later.</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <WishCard
                key={item.id}
                wishCard={{
                  id: item.business.id,
                  name: item.business.name,
                  address: item.business.address,
                  price: item.business.starting_from || 0,
                  rating: item.business.star_rating || 0,
                  slug: item.business.slug,
                  image: item.business.image_url || '/assets/images/category_luxury.jpg'
                }}
                onRemove={() => handleRemove(item.business.id)}
              />
            ))
          )}

        </CardBody>
      </Card>
    </UserLayout>
  );
};

export default WishlistPage;

