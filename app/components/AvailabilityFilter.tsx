'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button, Col, Dropdown, DropdownDivider, DropdownMenu, DropdownToggle, FormLabel, Row } from 'react-bootstrap';
import { BsCalendar, BsDashCircle, BsGeoAlt, BsPerson, BsPlusCircle, BsSearch } from 'react-icons/bs';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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

let locationsCache: any[] | null = null;

const formatDateToLocalISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateFromLocalISO = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const AvailabilityFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getInitialValue = (): AvailabilityFormType => {
    const start_date_str = searchParams.get('start_date');
    const end_date_str = searchParams.get('end_date');
    const rooms_str = searchParams.get('rooms');
    const location_str = searchParams.get('location') || '';

    let stayFor: Date | Array<Date> = [new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)];

    if (start_date_str && end_date_str) {
      const s = parseDateFromLocalISO(start_date_str);
      const e = parseDateFromLocalISO(end_date_str);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        stayFor = [s, e];
      }
    }

    return {
      location: location_str,
      stayFor: stayFor,
      guests: {
        adults: 2,
        rooms: rooms_str ? parseInt(rooms_str) : 1,
        children: 0,
      },
    };
  };

  const [formValue, setFormValue] = useState<AvailabilityFormType>(getInitialValue());
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);

  useEffect(() => {
    setFormValue(getInitialValue());
  }, [searchParams]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (locationsCache) {
        setAvailableLocations(locationsCache);
        return;
      }

      try {
        const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";
        const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
        const response = await fetch(`${API_URL}/api/v1/businesses/locations`);
        if (response.ok) {
          const data = await response.json();
          locationsCache = data;
          setAvailableLocations(data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();

    if (Array.isArray(formValue.stayFor) && formValue.stayFor.length === 2) {
      query.set('start_date', formatDateToLocalISO(formValue.stayFor[0]));
      query.set('end_date', formatDateToLocalISO(formValue.stayFor[1]));
    }

    if (formValue.guests.rooms) {
      query.set('rooms', formValue.guests.rooms.toString());
    }

    if (formValue.location) {
      query.set('location', formValue.location);
    }

    // Determine target page: keep grid if already on grid or if on the root page (which is grid by default)
    const targetPage = (pathname.includes('/hotel/grid') || pathname === '/') ? '/hotel/grid' : '/hotel/list';
    console.log(`Searching: ${targetPage}?${query.toString()}`);
    router.push(`${targetPage}?${query.toString()}`);
  };

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

  const flatpickrOptions = useMemo(() => ({
    mode: 'range' as const,
    dateFormat: 'd M',
    minDate: 'today',
  }), []);

  return (
    <form className="bg-mode shadow rounded-3 position-relative p-4 pe-md-5 pb-5 pb-md-4 mb-4" onSubmit={handleSubmit}>
      <Row className="g-4 align-items-center">
        <Col lg={4}>
          <div className="form-control-border form-control-transparent form-fs-md items-center gap-2">
            <BsGeoAlt size={37} />

            <div className="flex-grow-1">
              <FormLabel className="form-label">Location</FormLabel>
              <SelectFormInput
                value={formValue.location}
                onChange={(val) => setFormValue({ ...formValue, location: val })}
              >
                <option value="" disabled hidden>
                  City/Town, State
                </option>
                {availableLocations.map((loc, idx) => (
                  <option key={idx} value={loc.display}>{loc.display}</option>
                ))}
              </SelectFormInput>
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <div className="form-control-border form-control-transparent form-fs-md items-center gap-2">
            <BsCalendar size={37} />

            <div className="flex-grow-1">
              <FormLabel className="form-label">Check in - out</FormLabel>
              <Flatpicker
                value={formValue.stayFor}
                getValue={(val) => setFormValue({ ...formValue, stayFor: val })}
                options={flatpickrOptions}
                className="form-control flatpickr"
              />
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <div className="form-control-border form-control-transparent form-fs-md items-center gap-2">
            <BsPerson size={37} />

            <div className="flex-grow-1">
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
