'use client';

import { cancelBooking } from '@/app/data/bookings';
import BookingCard from './BookingCard';

const CancelledBooking = () => {
  return (
    <>
      <h6 className="mb-3">Cancelled booking (1)</h6>
      <BookingCard booking={cancelBooking} />
    </>
  );
};

export default CancelledBooking;
