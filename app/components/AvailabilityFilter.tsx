'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Button, Col, Dropdown, DropdownDivider, DropdownMenu, DropdownToggle, FormLabel, Row } from 'react-bootstrap';
import { BsCalendar, BsDashCircle, BsGeoAlt, BsPerson, BsPlusCircle, BsSearch } from 'react-icons/bs';
import { useSearchParams, useRouter, usePathname, type ReadonlyURLSearchParams } from 'next/navigation';
import Flatpicker from './form/Flatpicker';
import { persistRecentSearch } from '@/app/helpers/ad-viewer-context';
import { useHomeSearchOptional } from '@/app/contexts/HomeSearchContext';
import { withBrowseCredentials, handleBrowseClearanceResponse } from '@/app/helpers/browse-gate';
import {
  getClientDefaultStayForSnapshot,
  getServerDefaultStayForSnapshot,
  stayForFromSearchParams,
} from '@/app/helpers/stay-dates';

type AvailabilityFormType = {
  location: string;
  stayFor: Date | Array<Date>;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
};

type LocationOption = { display: string; city?: string; state?: string };

const LOCATION_SUGGESTION_LIMIT = 5;
const LOCATION_SUGGESTION_DELAY_MS = 500;

const formatDateToLocalISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptySubscribe = () => () => {};

function useClientDefaultStayFor(): Date[] {
  return useSyncExternalStore(
    emptySubscribe,
    getClientDefaultStayForSnapshot,
    getServerDefaultStayForSnapshot,
  );
}

function buildHomeFormValue(
  searchParams: ReadonlyURLSearchParams,
  defaultStayFor: Date[],
): AvailabilityFormType {
  const rooms_str = searchParams.get('rooms');
  const adults_str = searchParams.get('adults');
  const children_str = searchParams.get('children');
  const location_str = searchParams.get('location') || '';
  const stayFor = stayForFromSearchParams(
    searchParams.get('start_date'),
    searchParams.get('end_date'),
  );

  return {
    location: location_str,
    stayFor: stayFor.length > 0 ? stayFor : defaultStayFor,
    guests: {
      adults: Math.max(1, adults_str ? parseInt(adults_str, 10) : 2),
      children: children_str ? parseInt(children_str, 10) : 0,
      rooms: rooms_str ? parseInt(rooms_str, 10) : 1,
    },
  };
}

type HomeFilterPanelProps = {
  initial: AvailabilityFormType;
  onSubmitSearch: (formValue: AvailabilityFormType) => void;
};

function HomeAvailabilityFilterPanel({
  initial,
  onSubmitSearch,
}: HomeFilterPanelProps) {
  const [formValue, setFormValue] = useState(initial);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const locationBlurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiUrl = useMemo(() => {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  }, []);

  useEffect(() => {
    const query = formValue.location.trim();
    if (query.length === 0) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await handleBrowseClearanceResponse(
          await fetch(
            `${apiUrl}/api/v1/businesses/locations?q=${encodeURIComponent(query)}&suggestions=1`,
            withBrowseCredentials({
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache',
              },
            }),
          ),
        );
        if (response.ok) {
          const data = await response.json();
          setLocationSuggestions(Array.isArray(data) ? data.slice(0, LOCATION_SUGGESTION_LIMIT) : []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocationSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, LOCATION_SUGGESTION_DELAY_MS);

    return () => clearTimeout(timer);
  }, [apiUrl, formValue.location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSearch(formValue);
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

  const flatpickrOptions = useMemo(
    () => ({
      mode: 'range' as const,
      dateFormat: 'd M',
      minDate: 'today',
    }),
    [],
  );

  return (
    <form className="bg-mode shadow rounded-3 position-relative p-4 pe-md-5 pb-5 pb-md-4 mb-4" onSubmit={handleSubmit}>
      <Row className="g-4 align-items-center">
        <Col lg={4}>
          <div className="form-control-border form-control-transparent form-fs-md items-center gap-2">
            <BsGeoAlt size={37} />
            <div className="flex-grow-1 position-relative">
              <FormLabel className="form-label">Location</FormLabel>
              <input
                type="text"
                className="form-control"
                name="shettar_location_query"
                placeholder="City/Town, State"
                value={formValue.location}
                autoComplete="new-password"
                onChange={(event) => setFormValue({ ...formValue, location: event.target.value })}
                onFocus={() => {
                  if (formValue.location.trim()) setShowSuggestions(true);
                }}
                onBlur={() => {
                  locationBlurTimer.current = setTimeout(() => setShowSuggestions(false), 150);
                }}
              />
              {showSuggestions && formValue.location.trim() && (
                <div
                  className="list-group position-absolute w-100 shadow border rounded-bottom bg-body"
                  style={{ zIndex: 1050, top: '100%' }}
                >
                  {loadingSuggestions && (
                    <div className="list-group-item small text-secondary bg-body">Searching...</div>
                  )}
                  {!loadingSuggestions &&
                    locationSuggestions.map((loc) => (
                      <button
                        key={loc.display}
                        type="button"
                        className="list-group-item list-group-item-action text-start bg-body"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setFormValue({ ...formValue, location: loc.display });
                          setShowSuggestions(false);
                        }}
                      >
                        {loc.display}
                      </button>
                    ))}
                  {!loadingSuggestions && locationSuggestions.length === 0 && (
                    <div className="list-group-item small text-secondary bg-body">No verified locations found</div>
                  )}
                </div>
              )}
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
                  onChange={() => {}}
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
                      <Button variant="link" type="button" className="btn btn-link child-remove p-0 mb-0" onClick={() => updateGuests('children', false)}>
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
}

const AvailabilityFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const homeSearch = useHomeSearchOptional();
  const defaultStayFor = useClientDefaultStayFor();

  const formKey = searchParams.toString();
  const initial = buildHomeFormValue(searchParams, defaultStayFor);

  const onSubmitSearch = useCallback(
    (formValue: AvailabilityFormType) => {
      const query = new URLSearchParams();

      if (Array.isArray(formValue.stayFor) && formValue.stayFor.length === 2) {
        query.set('start_date', formatDateToLocalISO(formValue.stayFor[0]));
        query.set('end_date', formatDateToLocalISO(formValue.stayFor[1]));
      }

      if (formValue.guests.rooms) {
        query.set('rooms', formValue.guests.rooms.toString());
      }

      if (formValue.guests.adults) {
        query.set('adults', formValue.guests.adults.toString());
      }

      if (formValue.guests.children !== undefined) {
        query.set('children', formValue.guests.children.toString());
      }

      if (formValue.location) {
        query.set('location', formValue.location);
        persistRecentSearch(formValue.location);
      }

      const targetPage =
        pathname === '/'
          ? '/'
          : pathname.includes('/hotel/list')
            ? '/hotel/list'
            : '/hotel/grid';
      router.push(`${targetPage}?${query.toString()}`);
      homeSearch?.markSearched();
    },
    [homeSearch, pathname, router],
  );

  return (
    <HomeAvailabilityFilterPanel
      key={formKey}
      initial={initial}
      onSubmitSearch={onSubmitSearch}
    />
  );
};

export default AvailabilityFilter;
