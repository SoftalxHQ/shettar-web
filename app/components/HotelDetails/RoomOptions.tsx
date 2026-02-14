'use client';

import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import SelectFormInput from '../form/SelectFormInput';
import RoomCard from './RoomCard';
import { hotelRooms } from '@/app/data/hotel-details';

const RoomOptions = ({ availableRoomTypes, hotel }: { availableRoomTypes: any[], hotel: any }) => {
  if (!availableRoomTypes || availableRoomTypes.length === 0) {
    return (
      <Card className="bg-transparent" id="room-options">
        <CardBody className="pt-4 p-0 text-center py-5">
          <h5 className="text-muted">No rooms currently available for the selected dates.</h5>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent" id="room-options">
      <CardHeader className="border-bottom bg-transparent px-0 pt-0">
        <div className="d-sm-flex justify-content-sm-between align-items-center">
          <h3 className="mb-2 mb-sm-0">Room Options</h3>
        </div>
      </CardHeader>
      <CardBody className="pt-4 p-0">
        <div className="vstack gap-4">
          {availableRoomTypes.map((room_type, idx) => {
            return (
              <RoomCard
                key={idx}
                features={['Air Conditioning', 'Wifi', 'Kitchen', 'pool']} // Fallback features until API provides them per room type
                images={room_type.images_url || ['/images/category/hotel/4by3/04.jpg']}
                id={room_type.id}
                slug={room_type.slug}
                hotelSlug={hotel?.slug}
                name={room_type.name}
                price={room_type.price}
                sale={room_type.old_price ? `${Math.round(((room_type.old_price - room_type.price) / room_type.old_price) * 100)}% Off` : undefined}
                schemes={['Free Cancellation', 'Free Breakfast']}
              />
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default RoomOptions;
