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
            // Extract amenities from the boolean flags sent by backend
            const activeAmenities = Object.entries(room_type.amenities || {})
              .filter(([_, value]) => value === true)
              .map(([key]) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));

            // Logic to show 4 features and "+more" if there are more
            const featuresToDisplay = activeAmenities.slice(0, 3);
            if (activeAmenities.length > 3) {
              featuresToDisplay.push(`+${activeAmenities.length - 3} more`);
            }

            // If no amenities are found, use a default fallback
            const finalFeatures = featuresToDisplay.length > 0 ? featuresToDisplay : ['Standard Amenities'];

            const cur_p = parseFloat(room_type.price || 0);
            const old_p = parseFloat(room_type.old_price || 0);
            const sale = (old_p > cur_p && old_p > 0) ? `${Math.round(((old_p - cur_p) / old_p) * 100)}% Off` : undefined;

            return (
              <RoomCard
                key={idx}
                features={finalFeatures}
                allAmenities={activeAmenities}
                images={room_type.images_url || ['/images/category/hotel/4by3/04.jpg']}
                id={room_type.id}
                slug={room_type.slug}
                hotelSlug={hotel?.slug}
                name={room_type.name}
                price={room_type.price}
                available_rooms={room_type.available_rooms}
                daily_availability={room_type.daily_availability}
                sale={sale}
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
