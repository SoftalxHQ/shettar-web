'use client';

import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import SelectFormInput from '../form/SelectFormInput';
import RoomCard from './RoomCard';
import { hotelRooms } from '@/app/data/hotel-details';

const RoomOptions = () => {
  return (
    <Card className="bg-transparent" id="room-options">
      <CardHeader className="border-bottom bg-transparent px-0 pt-0">
        <div className="d-sm-flex justify-content-sm-between align-items-center">
          <h3 className="mb-2 mb-sm-0">Room Options</h3>
          <Col sm={4}>
            <form className="form-control-bg-light">
              <SelectFormInput className="form-select form-select-sm js-choice border-0">
                <option value={-1}>Select Option</option>
                <option>Recently search</option>
                <option>Most popular</option>
                <option>Top rated</option>
              </SelectFormInput>
            </form>
          </Col>
        </div>
      </CardHeader>
      <CardBody className="pt-4 p-0">
        <div className="vstack gap-4">
          {hotelRooms.map((room, idx) => {
            return (
              <RoomCard
                key={idx}
                features={room.features}
                images={room.images}
                id={room.id}
                name={room.name}
                price={room.price}
                sale={room.sale}
                schemes={room.schemes}
              />
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default RoomOptions;
