'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TopNavBar4 from '@/app/components/TopNavBar4';
import RoomGallery from '@/app/components/RoomDetails/RoomGallery';
import RoomSelection from '@/app/components/RoomDetails/RoomSelection';
import Footer from '@/app/components/Footer';
import { Skeleton } from '@/app/components';

export default function RoomDetailPage() {
  const params = useParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;

  const [roomType, setRoomType] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomDetail = async () => {
      if (!hotelSlug || !roomSlug) return;

      setIsLoading(true);
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        // API is nested: /api/v1/businesses/:hotelSlug/room_types/:roomSlug
        const response = await fetch(`${API_URL}/api/v1/businesses/${hotelSlug}/room_types/${roomSlug}`);

        if (!response.ok) {
          throw new Error('Room details not found');
        }

        const data = await response.json();
        setRoomType(data);
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Unable to load room details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetail();
  }, [hotelSlug, roomSlug]);

  if (isLoading) {
    return (
      <>
        <TopNavBar4 />
        <div className="container mt-5 pt-5">
          <Skeleton height="400px" className="mb-4 rounded-3" />
          <div className="row">
            <div className="col-md-7">
              <Skeleton height="30px" width="60%" className="mb-3" />
              <Skeleton height="200px" className="mb-4" />
            </div>
            <div className="col-md-5">
              <Skeleton height="300px" className="rounded-3" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !roomType) {
    return (
      <>
        <TopNavBar4 />
        <div className="container mt-5 pt-5 text-center py-5">
          <h2 className="text-danger">Error</h2>
          <p>{error || 'Something went wrong.'}</p>
          <a href="/hotel/list" className="btn btn-primary">Back to Hotels</a>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopNavBar4 />
      <main>
        <RoomGallery room={roomType} hotel={roomType.business} />
      </main>
      <Footer />
    </>
  );
}
