import { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import GuestDetails from './GuestDetails';
import HotelInformation from './HotelInformation';
import LoginAdvantages from './LoginAdvantages';
import OfferAndDiscounts from './OfferAndDiscounts';
import PaymentOptions from './PaymentOptions';
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
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email_address: '',
      phone_number: '',
      emer_first_name: '',
      emer_last_name: '',
      emer_phone_number: '',
      payment_method: 'card',
      option: 'self'
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        // Only prefill if option is 'self'
        if (watch('option') === 'self') {
          setValue('first_name', user.first_name || '');
          setValue('last_name', user.last_name || '');
          setValue('email_address', user.email || '');
          setValue('phone_number', user.phone_number || '');
          setValue('emer_first_name', user.emer_first_name || '');
          setValue('emer_last_name', user.emer_last_name || '');
          setValue('emer_phone_number', user.emer_phone_number || '');
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [setValue, watch('option')]);

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
