'use client';

import { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { getStoredToken } from '@/app/helpers/auth';
import { useApi } from '@/app/hooks/useApi';
import { toast } from 'react-hot-toast';

interface FavoriteButtonProps {
  businessId: number;
  className?: string;
}

const FavoriteButton = ({ businessId, className }: FavoriteButtonProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { apiFetch } = useApi();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = getStoredToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        const response = await apiFetch(`${API_URL}/api/v1/wishlists/check?business_id=${businessId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setIsWishlisted(data.is_wishlisted);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [businessId]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getStoredToken();
    if (!token) {
      toast.error('Please sign in to save favorites');
      return;
    }

    setIsProcessing(true);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      if (isWishlisted) {
        // Remove
        const response = await apiFetch(`${API_URL}/api/v1/wishlists/${businessId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setIsWishlisted(false);
          toast.success('Removed from wishlist');
        }
      } else {
        // Add
        const response = await apiFetch(`${API_URL}/api/v1/wishlists`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ business_id: businessId })
        });
        if (response.ok) {
          setIsWishlisted(true);
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return null;

  return (
    <Button
      variant={isWishlisted ? "danger" : "white"}
      size="sm"
      className={`btn-round mb-0 shadow-sm flex-centered ${className}`}
      onClick={toggleWishlist}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <Spinner animation="border" size="sm" style={{ width: '10px', height: '10px' }} />
      ) : isWishlisted ? (
        <FaHeart size={12} />
      ) : (
        <FaRegHeart size={12} />
      )}
    </Button>
  );
};

export default FavoriteButton;
