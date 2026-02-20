'use client';

import { useEffect, useState } from 'react';
import { getStoredToken } from '@/app/helpers/auth';
import BookingCard from './BookingCard';
import { Skeleton } from '@/app/components';
import { Col, Image, Row } from 'react-bootstrap';
import Link from 'next/link';

const CompletedBooking = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = getStoredToken();
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        const response = await fetch(`${API_URL}/api/v1/reservations?filter=past`, {
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
        console.error('Error fetching past bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <>
        <h6 className="mb-3">Completed booking</h6>
        <Skeleton height="150px" className="mb-4" />
      </>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-mode shadow p-4 rounded overflow-hidden border">
        <Row className="g-4 align-items-center">
          <Col md={9}>
            <h6>Looks like you have never stayed with us</h6>
            <h4 className="mb-2">When you stay, your past trips will be shown here.</h4>
            <Link href="/" className="btn btn-primary-soft mb-0">
              Start booking now
            </Link>
          </Col>

          <Col md={3} className="text-end">
            <Image src="/images/element/17.svg" className="mb-n5" alt="element" width={100} height={100} />
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <>
      <h6 className="mb-3">Completed booking ({bookings.length})</h6>
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </>
  );
};

export default CompletedBooking;
