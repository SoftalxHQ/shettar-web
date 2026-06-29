'use client';

import Flatpicker from '../form/Flatpicker';
import { useToggle } from '@/app/hooks';
import { useMemo, useState } from 'react';
import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { Button, Col, Container, Dropdown, DropdownDivider, DropdownMenu, DropdownToggle, Offcanvas, OffcanvasHeader } from 'react-bootstrap';
import { BsDashCircle, BsPencilSquare, BsPlusCircle, BsSearch } from 'react-icons/bs';
import { stayForFromSearchParams } from '@/app/helpers/stay-dates';

type AvailabilityFormType = {
  location: string;
  stayFor: Date | Array<Date>;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
};

export type { AvailabilityFormType };

type AvailabilityFilterHotel = {
  city?: string;
  state?: string;
};

function buildFormValue(
  searchParams: ReadonlyURLSearchParams,
  hotel?: AvailabilityFilterHotel | null,
): AvailabilityFormType {
  const rooms_str = searchParams.get('rooms');
  const adults_str = searchParams.get('adults');
  const children_str = searchParams.get('children');
  const stayFor = stayForFromSearchParams(
    searchParams.get('start_date'),
    searchParams.get('end_date'),
  );

  return {
    location: hotel ? `${hotel.city}, ${hotel.state}` : 'City/Town, State',
    stayFor,
    guests: {
      adults: Math.max(1, adults_str ? parseInt(adults_str, 10) : 2),
      children: children_str ? parseInt(children_str, 10) : 0,
      rooms: rooms_str ? parseInt(rooms_str, 10) : 1,
    },
  };
}

type FilterPanelProps = {
  initial: AvailabilityFormType;
  onSearch?: (data: AvailabilityFormType) => void;
  isLoading?: boolean;
};

function AvailabilityFilterPanel({ initial, onSearch, isLoading }: FilterPanelProps) {
  const { isOpen, toggle } = useToggle();
  const [formValue, setFormValue] = useState(initial);

  const flatpickrOptions = useMemo(
    () => ({
      mode: 'range' as const,
      dateFormat: 'd M',
      minDate: 'today',
    }),
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(formValue);
  };

  const updateGuests = (type: keyof AvailabilityFormType['guests'], increase = true) => {
    const val = formValue.guests[type];
    const minValue = type === 'adults' ? 1 : 0;
    const newVal = increase ? val + 1 : val > minValue ? val - 1 : minValue;

    setFormValue({
      ...formValue,
      guests: {
        ...formValue.guests,
        [type]: newVal,
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

  const formFields = (
    <form className="row g-4" onSubmit={handleSubmit}>
      <Col md={6} lg={4}>
        <div className="form-size-lg form-fs-md">
          <label className="form-label">Location</label>
          <div className="form-control-lg form-control selection-result d-flex align-items-center">
            {formValue.location}
          </div>
        </div>
      </Col>
      <Col md={6} lg={3}>
        <div className="form-fs-md w-100">
          <label className="form-label">Check in - out</label>
          <Flatpicker
            value={formValue.stayFor}
            getValue={(val) => setFormValue({ ...formValue, stayFor: val })}
            options={flatpickrOptions}
            className="form-control-lg"
          />
        </div>
      </Col>
      <Col md={6} lg={3}>
        <div className="form-fs-md">
          <div className="w-100">
            <label className="form-label">Guests &amp; rooms</label>
            <Dropdown className="guest-selector me-2">
              <DropdownToggle
                as="input"
                className="form-guest-selector form-control-lg form-control selection-result cursor-pointer"
                value={getGuestsValue()}
                onChange={() => {}}
                readOnly
              />
              <DropdownMenu className="guest-selector-dropdown shadow border">
                <li className="d-flex justify-content-between px-3 py-1">
                  <div>
                    <h6 className="mb-0">Adults</h6>
                    <small className="opacity-50">Ages 13 or above</small>
                  </div>
                  <div className="hstack gap-1 align-items-center">
                    <Button variant="link" className="adult-remove p-0 mb-0 text-inherit opacity-75" onClick={() => updateGuests('adults', false)}>
                      <BsDashCircle className=" fs-5 fa-fw" />
                    </Button>
                    <h6 className="guest-selector-count mb-0 adults" style={{ width: '20px', textAlign: 'center' }}>{formValue.guests.adults ?? 0}</h6>
                    <Button variant="link" className="adult-add p-0 mb-0 text-inherit opacity-75" onClick={() => updateGuests('adults')}>
                      <BsPlusCircle className=" fs-5 fa-fw" />
                    </Button>
                  </div>
                </li>
                <DropdownDivider />
                <li className="d-flex justify-content-between px-3 py-1">
                  <div>
                    <h6 className="mb-0">Children</h6>
                    <small className="opacity-50">Ages 13 below</small>
                  </div>
                  <div className="hstack gap-1 align-items-center">
                    <Button variant="link" type="button" className="btn btn-link child-remove p-0 mb-0 text-inherit opacity-75" onClick={() => updateGuests('children', false)}>
                      <BsDashCircle className="fs-5 fa-fw" />
                    </Button>
                    <h6 className="guest-selector-count mb-0 child" style={{ width: '20px', textAlign: 'center' }}>{formValue.guests.children ?? 0}</h6>
                    <Button variant="link" type="button" className="btn btn-link child-add p-0 mb-0 text-inherit opacity-75" onClick={() => updateGuests('children')}>
                      <BsPlusCircle className=" fs-5 fa-fw" />
                    </Button>
                  </div>
                </li>
                <DropdownDivider />
                <li className="d-flex justify-content-between px-3 py-1">
                  <div>
                    <h6 className="mb-0">Rooms</h6>
                    <small className="opacity-50">Max room 8</small>
                  </div>
                  <div className="hstack gap-1 align-items-center">
                    <Button variant="link" type="button" className="room-remove p-0 mb-0 text-inherit opacity-75" onClick={() => updateGuests('rooms', false)}>
                      <BsDashCircle className=" fs-5 fa-fw" />
                    </Button>
                    <h6 className="guest-selector-count mb-0 rooms" style={{ width: '20px', textAlign: 'center' }}>{formValue.guests.rooms ?? 0}</h6>
                    <Button variant="link" type="button" className="btn btn-link room-add p-0 mb-0 text-inherit opacity-75" onClick={() => updateGuests('rooms')}>
                      <BsPlusCircle className=" fs-5 fa-fw" />
                    </Button>
                  </div>
                </li>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </Col>
      <Col md={6} lg={2} className="mt-md-auto">
        <Button variant="primary" size="lg" className="w-100 mb-0 flex-centered" type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          ) : (
            <BsSearch className="fa-fw me-1" />
          )}
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </Col>
    </form>
  );

  return (
    <div className="py-3 py-sm-0">
      <Container>
        <div className="d-none d-sm-block">
          <div className="bg-body-tertiary p-4 rounded w-100 shadow-sm border">
            {formFields}
          </div>
        </div>
        <Button variant="primary" onClick={toggle} className="d-sm-none w-100 mb-0" type="button">
          <BsPencilSquare className=" me-2" />
          Edit Search
        </Button>
        <Offcanvas show={isOpen} onHide={toggle} placement="top" className="offcanvas-sm" tabIndex={-1}>
          <OffcanvasHeader closeButton>
            <h5 className="offcanvas-title">Edit search</h5>
          </OffcanvasHeader>
          <div className="offcanvas-body p-2">
            <div className="bg-body-tertiary p-4 rounded w-100 shadow-sm border">
              {formFields}
            </div>
          </div>
        </Offcanvas>
      </Container>
    </div>
  );
}

const AvailabilityFilter = ({
  hotel,
  onSearch,
  isLoading,
}: {
  hotel?: AvailabilityFilterHotel | null;
  onSearch?: (data: AvailabilityFormType) => void;
  isLoading?: boolean;
}) => {
  const searchParams = useSearchParams();
  const formKey = `${searchParams.toString()}|${hotel?.city ?? ''}|${hotel?.state ?? ''}`;
  const initial = buildFormValue(searchParams, hotel);

  return (
    <AvailabilityFilterPanel
      key={formKey}
      initial={initial}
      onSearch={onSearch}
      isLoading={isLoading}
    />
  );
};

export default AvailabilityFilter;
