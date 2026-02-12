'use client';

import TopNavBar4 from '@/app/components/TopNavBar4';
import Footer from '@/app/components/Footer';
import AvailabilityFilter from '@/app/components/HotelDetails/AvailabilityFilter';
import HotelGallery from '@/app/components/HotelDetails/HotelGallery';
import AboutHotel from '@/app/components/HotelDetails/AboutHotel';

export default function HotelDetailPage() {
  return (
    <>
      <TopNavBar4 />

      <main>
        <AvailabilityFilter />
        <HotelGallery />
        <AboutHotel />
      </main>

      <Footer />
    </>
  );
}
