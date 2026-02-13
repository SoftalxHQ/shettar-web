'use client';

import TopNavBar4 from '@/app/components/TopNavBar4';
import Footer from '@/app/components/Footer';
import ConfirmTicket from '@/app/components/BookingConfirmed/ConfirmTicket';

export default function BookingConfirmedPage() {
  return (
    <>
      <TopNavBar4 />
      <main>
        <ConfirmTicket />
      </main>
      <Footer />
    </>
  );
}
