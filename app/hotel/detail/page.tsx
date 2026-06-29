'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Header, Footer, Skeleton } from '@/app/components';
import AvailabilityFilter, {
  type AvailabilityFormType,
} from '@/app/components/HotelDetails/AvailabilityFilter';
import HotelGallery from '@/app/components/HotelDetails/HotelGallery';
import AboutHotel from '@/app/components/HotelDetails/AboutHotel';
import { withBrowseCredentials } from '@/app/helpers/browse-gate';
import type { HotelDetail } from '@/app/types/hotel';

const formatDateToLocalISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function HotelDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const hotelSlug = (params?.hotelSlug as string) || searchParams.get('slug');

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotelDetail = useCallback(async () => {
    if (!hotelSlug) {
      setIsLoading(false);
      return;
    }

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

      const response = await fetch(url, withBrowseCredentials());
      if (!response.ok) {
        throw new Error('Hotel not found');
      }

      const data = (await response.json()) as HotelDetail;
      setHotel(data);
    } catch (err) {
      console.error('Error fetching hotel details:', err);
      setError('Unable to load hotel details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [hotelSlug, searchParams]);

  useEffect(() => {
    fetchHotelDetail();
  }, [fetchHotelDetail]);

  const handleSearch = (searchData: AvailabilityFormType) => {
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

  if (error || (!hotel && !isLoading)) {
    return (
      <>
        <Header />
        <div className="container mt-5 pt-5 text-center py-5 my-5">
          <h2 className="text-danger mb-3">Hotel Not Found</h2>
          <p className="mb-4">{error || 'Please select a hotel from our list.'}</p>
          <Link href="/hotel/list" className="btn btn-primary px-4">
            Back to Hotels
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (!hotel) {
    return null;
  }

  return (
    <>
      <Header />

      <main>
        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          <AvailabilityFilter hotel={hotel} onSearch={handleSearch} isLoading={isLoading} />
          <HotelGallery hotel={hotel} />
          <AboutHotel hotel={hotel} onRefresh={fetchHotelDetail} />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function HotelDetailPage() {
  return (
    <Suspense fallback={<div>Loading hotel details...</div>}>
      <HotelDetailContent />
    </Suspense>
  );
}
