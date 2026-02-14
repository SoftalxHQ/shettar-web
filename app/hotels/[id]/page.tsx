'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TopNavBar4 from '@/app/components/TopNavBar4';
import Footer from '@/app/components/Footer';
import AvailabilityFilter from '@/app/components/HotelDetails/AvailabilityFilter';
import HotelGallery from '@/app/components/HotelDetails/HotelGallery';
import AboutHotel from '@/app/components/HotelDetails/AboutHotel';
import { Hotel } from '@/app/types/hotel';
import { Skeleton } from '@/app/components';

export default function HotelDetailPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotelDetail = async (searchParams?: any) => {
    setIsLoading(true);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      let url = `${API_URL}/api/v1/businesses/${id}`;

      if (searchParams) {
        const query = new URLSearchParams();
        if (searchParams.start_date) query.append('start_date', searchParams.start_date);
        if (searchParams.end_date) query.append('end_date', searchParams.end_date);
        if (searchParams.number_of_rooms) query.append('number_of_rooms', searchParams.number_of_rooms);
        url += `?${query.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Hotel not found');
      }

      const data = await response.json();
      setHotel(data);
    } catch (err) {
      console.error('Error fetching hotel details:', err);
      setError('Unable to load hotel details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHotelDetail();
    }
  }, [id]);

  const handleSearch = (searchData: any) => {
    const params = {
      start_date: searchData.stayFor[0]?.toISOString().split('T')[0],
      end_date: searchData.stayFor[1]?.toISOString().split('T')[0],
      number_of_rooms: searchData.guests.rooms
    };
    fetchHotelDetail(params);
  };

  if (isLoading && !hotel) {
    return (
      <>
        <TopNavBar4 />
        <div className="container mt-5 pt-5">
          <Skeleton height="400px" className="mb-4 rounded-3" />
          <div className="row">
            <div className="col-md-7">
              <Skeleton height="30px" width="60%" className="mb-3" />
              <Skeleton height="20px" width="40%" className="mb-4" />
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

  if (error || !hotel) {
    return (
      <>
        <TopNavBar4 />
        <div className="container mt-5 pt-5 text-center py-5 my-5">
          <h2 className="text-danger mb-3">Error</h2>
          <p className="mb-4">{error || 'Something went wrong.'}</p>
          <a href="/hotels/list" className="btn btn-primary px-4">Back to Hotels</a>
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
          <AvailabilityFilter hotel={hotel} onSearch={handleSearch} isLoading={isLoading} />
          <HotelGallery hotel={hotel} />
          <AboutHotel hotel={hotel} />
        </div>
      </main>

      <Footer />
    </>
  );
}
