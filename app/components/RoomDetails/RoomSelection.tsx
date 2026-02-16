'use client';

import SelectFormInput from '../form/SelectFormInput';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'react-bootstrap';
import { roomDetails } from '@/app/data/room-details';
import RoomCard from './RoomCard';

const RoomSelection = ({ room, hotel }: { room: any, hotel: any }) => {
  return (
    <section className="pt-0">
      <Container>
        <Row>
          <Col xl={8}>
            <Card className="bg-transparent p-0 border-0">
              <CardHeader className="bg-transparent border-bottom d-sm-flex justify-content-sm-between align-items-center p-0 pb-3">
                <h4 className="mb-2 mb-sm-0">Confirm Selection</h4>
              </CardHeader>
              <CardBody className="p-0 pt-3">
                <div className="vstack gap-5">
                  <RoomCard
                    id={room.id}
                    slug={room.slug}
                    name={room.name}
                    price={room.price}
                    images={room.images_url || []}
                    sqfeet={room.sqfeet || 250}
                    amenities={room.amenities}
                    available_rooms={room.available_rooms}
                    isSelected={true}
                  />

                  {room.other_room_types && room.other_room_types.length > 0 && (
                    <div className="mt-5">
                      <h4 className="mb-4">Other Available Rooms</h4>
                      <div className="vstack gap-4">
                        {room.other_room_types.map((otherRoom: any, idx: number) => (
                          <RoomCard
                            key={idx}
                            id={otherRoom.id}
                            slug={otherRoom.slug}
                            name={otherRoom.name}
                            price={otherRoom.price}
                            images={otherRoom.images_url || []}
                            sqfeet={otherRoom.sqfeet || 250}
                            amenities={otherRoom.amenities}
                            available_rooms={otherRoom.available_rooms}
                            hotelSlug={hotel?.slug}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default RoomSelection;
