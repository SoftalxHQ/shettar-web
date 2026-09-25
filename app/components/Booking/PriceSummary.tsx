"use client";

import { Card, CardBody, CardFooter, CardHeader, CardTitle } from 'react-bootstrap';
import { guestCheckout } from '@/app/helpers/booking-commission';

const currency = '₦';

const PriceSummary = ({
  room,
  hotel,
  startDate,
  endDate,
  roomsCount,
  appliedPromo
}: {
  room: any,
  hotel: any,
  startDate: string | null,
  endDate: string | null,
  roomsCount: string | null,
  appliedPromo?: any
}) => {
  const price = Number(room?.price || 0);
  const actualRoomsCount = parseInt(roomsCount || '1', 10) || 1;

  const calculateNights = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const promoDiscount = appliedPromo?.discount_amount || 0;
  const taxes = 0; // No tax applied
  const checkout = guestCheckout({
    roomPrice: price,
    nights,
    rooms: actualRoomsCount,
    promoDiscount,
    fundedBy: appliedPromo?.funded_by,
    commissionRate: room?.commission_rate,
    commissionMode: room?.commission_collection_mode,
  });
  const roomWithFee = checkout.roomCharges + checkout.platformFee;
  const stayUnits = nights * actualRoomsCount;
  const nightlyWithFee = stayUnits > 0 ? roomWithFee / stayUnits : roomWithFee;
  const total = checkout.payable + taxes;

  return (
    <Card className="shadow rounded-2 border-0">
      <CardHeader className="border-bottom bg-transparent p-4">
        <CardTitle as="h5" className="mb-0">
          Price Summary
        </CardTitle>
      </CardHeader>
      <CardBody className="p-4">
        <ul className="list-group list-group-borderless">
          <li className="list-group-item d-flex justify-content-between align-items-center px-0">
            <span className="h6 fw-light mb-0">
              Room Charges ({currency}{nightlyWithFee.toLocaleString()} x {nights} {nights > 1 ? 'nights' : 'night'}{actualRoomsCount > 1 ? ` x ${actualRoomsCount} rooms` : ''})
            </span>
            <span className="h6 mb-0">{currency}{roomWithFee.toLocaleString()}</span>
          </li>
          {promoDiscount > 0 && (
            <li className="list-group-item d-flex justify-content-between align-items-center px-0">
              <div className="flex flex-col">
                <span className="h6 fw-light mb-0">Coupon Discount</span>
                <span className="text-[10px] uppercase font-bold text-success tracking-tighter">{appliedPromo?.code} Applied</span>
              </div>
              <span className="h6 mb-0 text-success">-{currency}{promoDiscount.toLocaleString()}</span>
            </li>
          )}
          <li className="list-group-item d-flex justify-content-between align-items-center px-0">
            <span className="h6 fw-light mb-0">Taxes &amp; Fees</span>
            <span className="h6 mb-0">{currency}{taxes.toLocaleString()}</span>
          </li>
        </ul>
      </CardBody>
      <CardFooter className="border-top bg-light bg-opacity-10 p-4">
        <div className="d-flex justify-content-between align-items-center">
          <span className="h5 mb-0 fw-bold">Payable Now</span>
          <span className="h5 mb-0 text-primary fw-bold">{currency}{total.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PriceSummary;
