'use client';

import TopNavBar4 from '@/app/components/TopNavBar4';
import Hero from '@/app/components/Booking/Hero';
import BookingDetails from '@/app/components/Booking/BookingDetails';
import Footer from '@/app/components/Footer';

export default function HotelBookingPage() {
  return (
    <>
      <TopNavBar4 />
      <main>
        <Hero />
        <BookingDetails />
      </main>
      <Footer />
    </>
  );
}
