'use client';

import { bookingCards } from '@/app/data/bookings';
import BookingCard from './BookingCard';

const UpcomingBooking = () => {
  return (
    <>
      <h6 className="text-dark mb-3">Completed booking (2)</h6>

      {bookingCards.map((booking, idx) => {
        return <BookingCard key={idx} booking={booking} />;
      })}
    </>
  );
};

export default UpcomingBooking;
