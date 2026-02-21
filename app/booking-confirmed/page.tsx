'use client';

import { Header, Footer } from '@/app/components';
import ConfirmTicket from '@/app/components/BookingConfirmed/ConfirmTicket';

export default function BookingConfirmedPage() {
  return (
    <>
      <Header />
      <main>
        <ConfirmTicket />
      </main>
      <Footer />
    </>
  );
}
