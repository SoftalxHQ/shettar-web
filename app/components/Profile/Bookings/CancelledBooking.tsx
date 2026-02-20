'use client';

import { useEffect, useState } from 'react';
import { getStoredToken } from '@/app/helpers/auth';
import BookingCard from './BookingCard';
import { Skeleton } from '@/app/components';

const CancelledBooking = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = getStoredToken();
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        const response = await fetch(`${API_URL}/api/v1/reservations?filter=cancelled`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching cancelled bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <>
        <h6 className="mb-3">Cancelled booking</h6>
        <Skeleton height="150px" className="mb-4" />
      </>
    );
  }

  return (
    <>
      <h6 className="mb-3">Cancelled booking ({bookings.length})</h6>

      {bookings.length === 0 ? (
        <div className="bg-light p-4 rounded text-center border border-dashed">
          <p className="mb-0 text-secondary">You have no cancelled bookings.</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))
      )}
    </>
  );
};

export default CancelledBooking;
