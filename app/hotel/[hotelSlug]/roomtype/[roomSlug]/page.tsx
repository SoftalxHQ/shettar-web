'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import TopNavBar4 from '@/app/components/TopNavBar4';
import RoomGallery from '@/app/components/RoomDetails/RoomGallery';
import Footer from '@/app/components/Footer';
import { Skeleton } from '@/app/components';
import AvailabilityFilter from '@/app/components/HotelDetails/AvailabilityFilter';

export default function RoomDetailPage() {
  const params = useParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [roomType, setRoomType] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomDetail = useCallback(async () => {
    if (!hotelSlug || !roomSlug) return;

    setIsLoading(true);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      let url = `${API_URL}/api/v1/businesses/${hotelSlug}/room_types/${roomSlug}`;

      const query = new URLSearchParams();
      const start_date = searchParams.get('start_date');
      const end_date = searchParams.get('end_date');
      const rooms = searchParams.get('rooms');
      if (start_date) query.append('start_date', start_date);
      if (end_date) query.append('end_date', end_date);
      if (rooms) query.append('number_of_rooms', rooms);

      if (query.toString()) {
        url += `?${query.toString()}`;
      }

      const response = await fetch(url);

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
  }, [hotelSlug, roomSlug, searchParams]);

  useEffect(() => {
    fetchRoomDetail();
  }, [fetchRoomDetail]);

  const handleSearch = (searchData: any) => {
    const query = new URLSearchParams(searchParams.toString());

    if (searchData.stayFor && Array.isArray(searchData.stayFor) && searchData.stayFor.length === 2) {
      query.set('start_date', searchData.stayFor[0].toISOString().split('T')[0]);
      query.set('end_date', searchData.stayFor[1].toISOString().split('T')[0]);
    }

    if (searchData.guests && searchData.guests.rooms) {
      query.set('rooms', searchData.guests.rooms.toString());
    }

    router.push(`${pathname}?${query.toString()}`);
  };

  if (isLoading && !roomType) {
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
        <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
          {roomType.business && (
            <AvailabilityFilter
              hotel={roomType.business}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          )}
          <RoomGallery room={roomType} hotel={roomType.business} />
        </div>
      </main>
      <Footer />
    </>
  );
}
