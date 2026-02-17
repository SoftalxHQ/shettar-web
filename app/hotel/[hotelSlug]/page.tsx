'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/app/components';
import Footer from '@/app/components/Footer';
import AvailabilityFilter from '@/app/components/HotelDetails/AvailabilityFilter';
import HotelGallery from '@/app/components/HotelDetails/HotelGallery';
import AboutHotel from '@/app/components/HotelDetails/AboutHotel';
import { Hotel } from '@/app/types/hotel';
import { Skeleton } from '@/app/components';

const formatDateToLocalISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HotelDetailPage() {
  const { hotelSlug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [hotel, setHotel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotelDetail = async () => {
    setIsLoading(true);
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      let url = `${API_URL}/api/v1/businesses/${hotelSlug}`;

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
    if (hotelSlug) {
      fetchHotelDetail();
    }
  }, [hotelSlug, searchParams]);

  const handleSearch = (searchData: any) => {
    const query = new URLSearchParams(searchParams.toString());

    if (searchData.stayFor && Array.isArray(searchData.stayFor) && searchData.stayFor.length === 2) {
      query.set('start_date', formatDateToLocalISO(searchData.stayFor[0]));
      query.set('end_date', formatDateToLocalISO(searchData.stayFor[1]));
    }

    if (searchData.guests) {
      if (searchData.guests.rooms) {
        query.set('rooms', searchData.guests.rooms.toString());
      }
      if (searchData.guests.adults) {
        query.set('adults', searchData.guests.adults.toString());
      }
      if (searchData.guests.children !== undefined) {
        query.set('children', searchData.guests.children.toString());
      }
    }

    router.push(`${pathname}?${query.toString()}`);
  };

  if (isLoading && !hotel) {
    return (
      <>
        <Header />
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
        <Header />
        <div className="container mt-5 pt-5 text-center py-5 my-5">
          <h2 className="text-danger mb-3">Error</h2>
          <p className="mb-4">{error || 'Something went wrong.'}</p>
          <a href="/hotel/list" className="btn btn-primary px-4">Back to Hotels</a>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

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
