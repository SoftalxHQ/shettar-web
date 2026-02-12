'use client';

import { useState } from 'react';
import { Button, Col, Dropdown, DropdownDivider, DropdownMenu, DropdownToggle, FormLabel, Row } from 'react-bootstrap';
import { BsCalendar, BsDashCircle, BsGeoAlt, BsPerson, BsPlusCircle, BsSearch } from 'react-icons/bs';
import SelectFormInput from './form/SelectFormInput';
import Flatpicker from './form/Flatpicker';

type AvailabilityFormType = {
  location: string;
  stayFor: Date | Array<Date>;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
};

const AvailabilityFilter = () => {
  const initialValue: AvailabilityFormType = {
    location: 'San Jacinto, USA',
    stayFor: [new Date(), new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)],
    guests: {
      adults: 2,
      rooms: 1,
      children: 0,
    },
  };

  const [formValue, setFormValue] = useState<AvailabilityFormType>(initialValue);

  const updateGuests = (type: keyof AvailabilityFormType['guests'], increase: boolean = true) => {
    const val = formValue.guests[type];
    setFormValue({
      ...formValue,
      guests: {
        ...formValue.guests,
        [type]: increase ? val + 1 : val > 1 ? val - 1 : 0,
      },
    });
  };

  const getGuestsValue = (): string => {
    let value = '';
    const guests = formValue.guests;
    if (guests.adults) {
      value += guests.adults + (guests.adults > 1 ? ' Adults ' : ' Adult ');
    }
    if (guests.children) {
      value += guests.children + (guests.children > 1 ? ' Children ' : ' Child ');
    }
    if (guests.rooms) {
      value += guests.rooms + (guests.rooms > 1 ? ' Rooms ' : ' Room ');
    }
    return value;
  };

  return (
    <form className="bg-mode shadow rounded-3 position-relative p-4 pe-md-5 pb-5 pb-md-4 mb-4">
      <Row className="g-4 align-items-center">
        <Col lg={4}>
          <div className="form-control-border form-control-transparent form-fs-md flex-centered gap-2">
            <BsGeoAlt size={37} />

            <div className="flex-grow-1">
              <FormLabel className="form-label">Location</FormLabel>
              <SelectFormInput>
                <option value={-1} disabled>
                  Select location
                </option>
                <option value="1">San Jacinto, USA</option>
                <option value="2">North Dakota, Canada</option>
                <option value="3">West Virginia, Paris</option>
              </SelectFormInput>
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <div className="flex-centered">
            <div>
              <BsCalendar size={37} className=" me-2" />
            </div>

            <div className="form-control-border form-control-transparent form-fs-md">
              <FormLabel className="form-label">Check in - out</FormLabel>
              <Flatpicker
                value={formValue.stayFor}
                getValue={(val) => setFormValue({ ...formValue, stayFor: val })}
                options={{
                  mode: 'range',
                  dateFormat: 'd M',
                }}
                className="form-control flatpickr"
              />
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <div className="form-control-border form-control-transparent form-fs-md flex-centered">
            <div>
              <BsPerson size={37} className=" me-2" />
            </div>

            <div className="w-100">
              <label className="form-label">Guests &amp; rooms</label>
              <Dropdown className="guest-selector me-2">
                <DropdownToggle
                  as="input"
                  className="form-guest-selector form-control selection-result"
                  value={getGuestsValue()}
                  onChange={() => { }}
                  readOnly
                />

                <DropdownMenu className="guest-selector-dropdown">
                  <li className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-0">Adults</h6>
                      <small>Ages 13 or above</small>
                    </div>
                    <div className="hstack gap-1 align-items-center">
                      <Button variant="link" className="adult-remove p-0 mb-0" onClick={() => updateGuests('adults', false)}>
                        <BsDashCircle className=" fs-5 fa-fw" />
                      </Button>
                      <h6 className="guest-selector-count mb-0 adults">{formValue.guests.adults ?? 0}</h6>
                      <Button variant="link" className="adult-add p-0 mb-0" onClick={() => updateGuests('adults')}>
                        <BsPlusCircle className=" fs-5 fa-fw" />
                      </Button>
                    </div>
                  </li>

                  <DropdownDivider />

                  <li className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-0">Children</h6>
                      <small>Ages 13 below</small>
                    </div>
                    <div className="hstack gap-1 align-items-center">
                      <Button
                        variant="link"
                        type="button"
                        className="btn btn-link child-remove p-0 mb-0"
                        onClick={() => updateGuests('children', false)}
                      >
                        <BsDashCircle className="  fs-5 fa-fw" />
                      </Button>
                      <h6 className="guest-selector-count mb-0 child">{formValue.guests.children ?? 0}</h6>
                      <Button variant="link" type="button" className="btn btn-link child-add p-0 mb-0" onClick={() => updateGuests('children')}>
                        <BsPlusCircle className=" fs-5 fa-fw" />
                      </Button>
                    </div>
                  </li>

                  <DropdownDivider />

                  <li className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-0">Rooms</h6>
                      <small>Max room 8</small>
                    </div>
                    <div className="hstack gap-1 align-items-center">
                      <Button variant="link" type="button" className="room-remove p-0 mb-0" onClick={() => updateGuests('rooms', false)}>
                        <BsDashCircle className=" fs-5 fa-fw" />
                      </Button>
                      <h6 className="guest-selector-count mb-0 rooms">{formValue.guests.rooms ?? 0}</h6>
                      <Button variant="link" type="button" className="btn btn-link room-add p-0 mb-0" onClick={() => updateGuests('rooms')}>
                        <BsPlusCircle className=" fs-5 fa-fw" />
                      </Button>
                    </div>
                  </li>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </Col>
      </Row>

      <div className="btn-position-md-middle">
        <button type="submit" className="icon-lg btn btn-round btn-primary mb-0 flex-centered">
          <BsSearch className=" fa-fw" />
        </button>
      </div>
    </form>
  );
};

export default AvailabilityFilter;
