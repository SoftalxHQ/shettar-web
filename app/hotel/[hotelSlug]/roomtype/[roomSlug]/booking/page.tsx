'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Header } from '@/app/components';
import Hero from '@/app/components/Booking/Hero';
import BookingDetails from '@/app/components/Booking/BookingDetails';
import Footer from '@/app/components/Footer';
import { Skeleton } from '@/app/components';

function BookingPageContent() {
  const params = useParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;
  const searchParams = useSearchParams();

  const getDefaultStartDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultEndDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const startDate = searchParams.get('start_date') || getDefaultStartDate();
  const endDate = searchParams.get('end_date') || getDefaultEndDate();
  const rooms = searchParams.get('rooms');

  const [roomType, setRoomType] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomDetail = async () => {
      if (!hotelSlug || !roomSlug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        const response = await fetch(`${API_URL}/api/v1/businesses/${hotelSlug}/room_types/${roomSlug}`);

        if (!response.ok) {
          throw new Error('Booking details not found');
        }

        const data = await response.json();
        setRoomType(data);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Unable to load booking details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetail();
  }, [hotelSlug, roomSlug]);

  if (isLoading) {
    return (
      <div className="container mt-5 pt-5">
        <Skeleton height="300px" className="mb-4 rounded-3" />
        <div className="row">
          <div className="col-md-8">
            <Skeleton height="200px" className="mb-4" />
            <Skeleton height="400px" className="mb-4" />
          </div>
          <div className="col-md-4">
            <Skeleton height="300px" className="rounded-3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !roomType) {
    return (
      <div className="container mt-5 pt-5 text-center py-5">
        <h2 className="text-danger">Error</h2>
        <p>{error || 'Missing booking information.'}</p>
        <a href="/hotel/list" className="btn btn-primary">Back to Hotels</a>
      </div>
    );
  }

  return (
    <>
      <Hero room={roomType} />
      <BookingDetails
        room={roomType}
        hotel={roomType.business}
        startDate={startDate}
        endDate={endDate}
        roomsCount={rooms}
      />
    </>
  );
}

export default function HotelBookingPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="container mt-5 pt-5 text-center"><Skeleton height="500px" /></div>}>
          <BookingPageContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
