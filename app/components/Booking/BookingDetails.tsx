import { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import GuestDetails from './GuestDetails';
import HotelInformation from './HotelInformation';
import LoginAdvantages from './LoginAdvantages';
import OfferAndDiscounts from './OfferAndDiscounts';
import PaymentOptions from './PaymentOptions';
import { useLayoutContext } from '@/app/states';
import PriceSummary from './PriceSummary';

const BookingDetails = ({
  room,
  hotel,
  startDate,
  endDate,
  roomsCount
}: {
  room: any,
  hotel: any,
  startDate: string | null,
  endDate: string | null,
  roomsCount: string | null
}) => {
  const { account } = useLayoutContext();
  const { control, handleSubmit, setValue, watch } = useForm({
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
                />
              </Col>
              <Col md={6} xl={12}>
                <OfferAndDiscounts />
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
