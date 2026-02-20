'use client';

import { useEffect, useState } from 'react';
import { getStoredToken } from '@/app/helpers/auth';
import BookingCard from './BookingCard';
import { Skeleton } from '@/app/components';
import Pagination from '../../Pagination';

const CancelledBooking = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchBookings = async (pageNumber: number) => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await fetch(`${API_URL}/api/v1/reservations?filter=cancelled&page=${pageNumber}&limit=5`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.reservations) {
        setBookings(data.reservations);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching cancelled bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

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
      <h6 className="mb-3">Cancelled booking ({pagination?.count || 0})</h6>

      {bookings.length === 0 ? (
        <div className="bg-light p-4 rounded text-center border border-dashed">
          <p className="mb-0 text-secondary">You have no cancelled bookings.</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))
      )}

      {pagination && pagination.last > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.last}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </>
  );
};

export default CancelledBooking;
