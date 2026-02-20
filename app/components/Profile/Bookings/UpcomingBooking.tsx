'use client';

import { useEffect, useState } from 'react';
import { getStoredToken } from '@/app/helpers/auth';
import BookingCard from './BookingCard';
import { Skeleton } from '@/app/components';
import Link from 'next/link';

const UpcomingBooking = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = getStoredToken();
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        const response = await fetch(`${API_URL}/api/v1/reservations?filter=upcoming`, {
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
        console.error('Error fetching upcoming bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <>
        <h6 className="mb-3">Upcoming booking</h6>
        <Skeleton height="150px" className="mb-4" />
        <Skeleton height="150px" className="mb-4" />
      </>
    );
  }

  return (
    <>
      <h6 className="mb-3">Upcoming booking ({bookings.length})</h6>

      {bookings.length === 0 ? (
        <div className="bg-light p-4 rounded text-center border border-dashed">
          <p className="mb-2 text-secondary">No upcoming trips found.</p>
          <Link href="/" className="btn btn-primary-soft btn-sm mb-0">Discover Hotels</Link>
        </div>
      ) : (
        bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))
      )}
    </>
  );
};

export default UpcomingBooking;
