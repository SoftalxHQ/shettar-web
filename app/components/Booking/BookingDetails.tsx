"use client";

import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import GuestDetails from './GuestDetails';
import HotelInformation from './HotelInformation';
import LoginAdvantages from './LoginAdvantages';
import OfferAndDiscounts from './OfferAndDiscounts';
import PaymentOptions, { type BookingFormValues } from './PaymentOptions';
import { useLayoutContext } from '@/app/states';
import PriceSummary from './PriceSummary';
import type { AppliedPromo } from '@/app/helpers/promo';
import type { RoomTypeBusinessSummary, RoomTypeDetail } from '@/app/types/hotel';

const BookingDetails = ({
  room,
  hotel,
  startDate,
  endDate,
  roomsCount
}: {
  room: Pick<RoomTypeDetail, 'id' | 'price'> & Partial<RoomTypeDetail>;
  hotel?: RoomTypeBusinessSummary | null;
  startDate: string | null,
  endDate: string | null,
  roomsCount: string | null
}) => {
  const { account } = useLayoutContext();
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const { control, handleSubmit, setValue, watch } = useForm<BookingFormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email_address: '',
      phone_number: '',
      emer_first_name: '',
      emer_last_name: '',
      emer_phone_number: '',
      payment_method: account ? 'wallet' : 'card',
      option: 'self'
    }
  });

  useEffect(() => {
    if (account && watch('option') === 'self') {
      setValue('first_name', account.first_name || '');
      setValue('last_name', account.last_name || '');
      setValue('email_address', account.email || '');
      setValue('phone_number', account.phone_number || '');
      setValue('emer_first_name', account.emer_first_name || '');
      setValue('emer_last_name', account.emer_last_name || '');
      setValue('emer_phone_number', account.emer_phone_number || '');
    }
  }, [account, setValue, watch('option')]);

  // Calculate Subtotal for promo validation
  const calculateSubtotal = () => {
    const price = parseFloat(String(room?.price || '0'));
    const actualRoomsCount = parseInt(roomsCount || '1', 10);
    
    const calculateNights = () => {
      if (!startDate || !endDate) return 1;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    };

    const nights = calculateNights();
    const result = price * nights * actualRoomsCount;
    return isNaN(result) ? 0 : result;
  };

  const subtotal = calculateSubtotal();

  return (
    <section className="pt-4">
      <Container>
        <Row className="g-4 g-lg-5">
          <Col xl={8}>
            <div className="vstack gap-5">
              <HotelInformation
                room={room}
                hotel={hotel}
                startDate={startDate}
                endDate={endDate}
                roomsCount={roomsCount}
              />

              <GuestDetails
                control={control}
                watch={watch}
                setValue={setValue}
              />

              <PaymentOptions
                room={room}
                hotel={hotel}
                control={control}
                handleSubmit={handleSubmit}
                watch={watch}
                setValue={setValue}
                startDate={startDate}
                endDate={endDate}
                roomsCount={roomsCount}
                appliedPromo={appliedPromo}
              />
            </div>
          </Col>
          <Col as="aside" xl={4}>
            <Row className="g-4">
              <Col md={6} xl={12}>
                <PriceSummary
                  room={room}
                  hotel={hotel}
                  startDate={startDate}
                  endDate={endDate}
                  roomsCount={roomsCount}
                  appliedPromo={appliedPromo}
                />
              </Col>
              <Col md={6} xl={12}>
                {hotel?.id != null ? (
                  <OfferAndDiscounts
                    businessId={hotel.id}
                    subtotal={subtotal}
                    appliedPromo={appliedPromo}
                    onApply={setAppliedPromo}
                    onRemove={() => setAppliedPromo(null)}
                  />
                ) : null}
              </Col>
              <Col md={6} xl={12}>
                <LoginAdvantages />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default BookingDetails;
