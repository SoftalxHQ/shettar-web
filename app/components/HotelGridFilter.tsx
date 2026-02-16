'use client';

import { useToggle } from '@/app/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import Nouislider from 'nouislider-react';
import { useState, useEffect } from 'react';
import { Button, Card, Col, Collapse, Container, FormCheck, Row, CardBody } from 'react-bootstrap';
import FormCheckInput from 'react-bootstrap/esm/FormCheckInput';
import FormCheckLabel from 'react-bootstrap/esm/FormCheckLabel';
import { useForm } from 'react-hook-form';
import { BsGridFill, BsListUl, BsSliders, BsStarFill } from 'react-icons/bs';
import Link from 'next/link';
import * as yup from 'yup';
import SelectFormInput from './form/SelectFormInput';
import TextFormInput from './form/TextFormInput';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const filterAmenities = [
  { label: 'Air Conditioning', value: 'ac' },
  { label: 'WiFi', value: 'wifi' },
  { label: 'Swimming Pool', value: 'swimming_pool' },
  { label: 'Gym', value: 'gym' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Bar', value: 'bar' },
  { label: 'Spa', value: 'spa' },
  { label: 'Parking', value: 'parking' },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Room Service', value: 'room_service' },
];

const HotelGridFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { isOpen, toggle } = useToggle();
  const [priceRange, setPriceRange] = useState<string[]>(['0', '500000']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedHotelType, setSelectedHotelType] = useState<string>('-1');
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('-1');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync with URL after mounting to avoid hydration mismatch
    setPriceRange([
      searchParams.get('min_price') || '0',
      searchParams.get('max_price') || '500000'
    ]);
    setSelectedAmenities(searchParams.get('amenities')?.split(',') || []);
    setSelectedStars(searchParams.get('stars')?.split(',').filter(Boolean).map(s => parseInt(s)) || []);
    setSelectedHotelType(searchParams.get('hotel_types') || '-1');
    setMinRating(parseFloat(searchParams.get('min_rating') || '0'));
    setSortBy(searchParams.get('sort_by') || '-1');
  }, [searchParams]);

  useEffect(() => {
    // Fetch categories dynamically once on mount
    const fetchCategories = async () => {
      try {
        const rawUrl = process.env.NEXT_PUBLIC_API_URL;
        const baseUrl = (rawUrl && rawUrl !== 'undefined') ? rawUrl : "http://127.0.0.1:3000";
        const API_URL = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const res = await fetch(`${API_URL}/api/v1/businesses/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const filterSchema = yup.object({
    hotelName: yup.string(),
  });

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(filterSchema),
    defaultValues: {
      hotelName: '',
    }
  });

  // Sync hotelName specifically after mount
  useEffect(() => {
    if (mounted) {
      setValue('hotelName', searchParams.get('name') || '');
    }
  }, [mounted, searchParams, setValue]);

  const onApplyFilter = (data: any) => {
    const params = new URLSearchParams(searchParams.toString());

    if (data.hotelName) params.set('name', data.hotelName);
    else params.delete('name');

    params.set('min_price', priceRange[0]);
    params.set('max_price', priceRange[1]);

    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
    else params.delete('amenities');

    if (selectedStars.length > 0) params.set('stars', selectedStars.join(','));
    else params.delete('stars');

    if (selectedHotelType !== '-1') params.set('hotel_types', selectedHotelType);
    else params.delete('hotel_types');

    if (minRating > 0) params.set('min_rating', minRating.toString());
    else params.delete('min_rating');

    if (sortBy !== '-1') params.set('sort_by', sortBy);
    else params.delete('sort_by');

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAmenityChange = (value: string) => {
    if (selectedAmenities.includes(value)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== value));
    } else {
      setSelectedAmenities([...selectedAmenities, value]);
    }
  };

  const handleStarChange = (value: number) => {
    if (selectedStars.includes(value)) {
      setSelectedStars(selectedStars.filter(s => s !== value));
    } else {
      setSelectedStars([...selectedStars, value]);
    }
  };

  const handleHotelTypeChange = (value: string) => {
    setSelectedHotelType(value);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    // Preserve core search params if any (like start_date, end_date, rooms, location)
    const preserve = ['start_date', 'end_date', 'rooms', 'location'];
    preserve.forEach(key => {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    });

    setPriceRange(['0', '500000']);
    setSelectedAmenities([]);
    setSelectedStars([]);
    setSelectedHotelType('-1');
    setMinRating(0);
    setSortBy('-1');
    setValue('hotelName', '');

    router.push(`${pathname}?${params.toString()}`);
  };

  if (!mounted) {
    return (
      <section className="pt-0 pb-4">
        <Container className="position-relative">
          <Row>
            <Col xs={12}>
              <div className="d-flex justify-content-between">
                <input type="checkbox" className="btn-check" id="btn-check-soft" key="skeleton-check" readOnly />
                <label className="btn btn-primary-soft btn-primary-check mb-0 items-center" htmlFor="btn-check-soft">
                  <BsSliders className=" fa-fe me-2" />
                  Show Filters
                </label>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }

  return (
    <section className="pt-0 pb-4">
      <Container className="position-relative">
        <Row>
          <Col xs={12}>
            <div className="d-flex justify-content-between gap-2 flex-wrap">
              <input type="checkbox" className="btn-check" id="btn-check-soft" key="actual-check" checked={isOpen} readOnly />
              <label
                onClick={toggle}
                className="btn btn-primary-soft btn-primary-check mb-0 items-center"
                htmlFor="btn-check-soft"
              >
                <BsSliders className=" fa-fe me-2" />
                {isOpen ? 'Hide Filters' : 'Show Filters'}
              </label>

              <div className="d-flex gap-2 align-items-center">
                <ul className="nav nav nav-pills nav-pills-dark" id="tour-pills-tab" role="tablist">
                  <li className="nav-item">
                    <Link className={`nav-link rounded-start rounded-0 mb-0 ${pathname.includes('/hotel/list') ? 'active' : ''}`} href={`/hotel/list?${searchParams.toString()}`} passHref>
                      <BsListUl size={16} className=" fa-fw" />
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link rounded-end rounded-0 mb-0 ${pathname.includes('/hotel/grid') ? 'active' : ''}`} href={`/hotel/grid?${searchParams.toString()}`} passHref>
                      <BsGridFill size={16} className=" fa-fw" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>
        <Collapse in={isOpen}>
          <div>
            <Card className="bg-light p-4 mt-4 z-index-9 border-0">
              <CardBody className="p-0">
                <form onSubmit={handleSubmit(onApplyFilter)} className="row g-4">
                  {/* Hotel Name */}
                  <Col md={6} lg={4}>
                    <TextFormInput
                      name="hotelName"
                      className="form-control-lg"
                      control={control as any}
                      label="Hotel Name"
                      placeholder="e.g. Black Tower"
                      containerClass="form-control-borderless"
                    />
                  </Col>

                  {/* Price Range */}
                  <Col md={6} lg={4}>
                    <div className="form-control-borderless">
                      <label className="form-label">Price Range (₦)</label>
                      <div className="position-relative">
                        <div className="noui-wrapper">
                          <div className="d-flex justify-content-between flex-wrap mb-2">
                            <input type="text" className="text-body input-with-range-min" value={`₦${parseInt(priceRange[0]).toLocaleString()}`} readOnly />
                            <input type="text" className="text-body input-with-range-max text-end" value={`₦${parseInt(priceRange[1]).toLocaleString()}`} readOnly />
                          </div>
                          <Nouislider
                            start={[parseInt(priceRange[0]), parseInt(priceRange[1])]}
                            range={{
                              min: 0,
                              max: 500000,
                            }}
                            step={1000}
                            onUpdate={(val) => setPriceRange(val as string[])}
                            className="noui-slider-range mt-2"
                            connect
                          />
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* Popular Filters / Sort By */}
                  <Col md={6} lg={4}>
                    <div className="form-size-lg form-control-borderless">
                      <label className="form-label">Popular Filters</label>
                      <SelectFormInput
                        className="form-select border-0 bg-transparent"
                        value={sortBy}
                        onChange={(val) => setSortBy(val)}
                      >
                        <option value="-1">Select Option</option>
                        <option value="most_popular">Most Popular</option>
                        <option value="price_asc">Price Low to High</option>
                        <option value="price_desc">Price High to Low</option>
                        <option value="rating_desc">Top Rated</option>
                      </SelectFormInput>
                    </div>
                  </Col>

                  {/* Customer Rating */}
                  <Col md={6} lg={4}>
                    <div className="form-control-borderless">
                      <label className="form-label">Customer Rating</label>
                      <ul className="list-inline mb-0 g-3 hstack gap-2">
                        {[3, 3.5, 4, 4.5].map((rating) => (
                          <li className="list-inline-item m-0" key={rating}>
                            <input
                              type="checkbox"
                              className="btn-check"
                              id={`rating-${rating}`}
                              checked={minRating === rating}
                              onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                            />
                            <label className="btn btn-white btn-primary-soft-check mb-0 py-2" htmlFor={`rating-${rating}`}>
                              {rating}+
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Col>

                  {/* Star Rating */}
                  <Col md={6} lg={4}>
                    <div className="form-control-borderless">
                      <label className="form-label">Star Rating</label>
                      <ul className="list-inline mb-0 g-3 hstack gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <li className="list-inline-item m-0" key={star}>
                            <input
                              type="checkbox"
                              className="btn-check"
                              id={`star-${star}`}
                              checked={selectedStars.includes(star)}
                              onChange={() => handleStarChange(star)}
                            />
                            <label className="btn btn-white btn-primary-soft-check mb-0 py-2 d-flex align-items-center" htmlFor={`star-${star}`}>
                              {star} <BsStarFill className="ms-1" />
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Col>

                  {/* Hotel Type */}
                  <Col md={6} lg={4}>
                    <div className="form-size-lg form-control-borderless">
                      <label className="form-label">Hotel Type</label>
                      <SelectFormInput
                        className="form-select border-0 bg-transparent"
                        value={selectedHotelType}
                        onChange={(val) => handleHotelTypeChange(val)}
                      >
                        <option value="-1">Select Option</option>
                        {categories.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </SelectFormInput>
                    </div>
                  </Col>

                  {/* Amenities */}
                  <Col xs={12}>
                    <div className="form-control-borderless">
                      <label className="form-label">Amenities</label>
                      <Row className="g-3">
                        {filterAmenities.map((item, idx) => {
                          return (
                            <Col key={idx} sm={6} md={4} lg={3} xl={2}>
                              <FormCheck className="mb-0">
                                <FormCheckInput
                                  type="checkbox"
                                  id={`amenity-${item.value}`}
                                  checked={selectedAmenities.includes(item.value)}
                                  onChange={() => handleAmenityChange(item.value)}
                                />
                                <FormCheckLabel className="h6 fw-light mb-0" htmlFor={`amenity-${item.value}`}>
                                  {item.label}
                                </FormCheckLabel>
                              </FormCheck>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  </Col>

                  {/* Buttons */}
                  <div className="text-end align-items-center">
                    <Button onClick={clearAll} variant="link" className="p-0 mb-0 me-1 text-primary-hover text-decoration-none">
                      Clear all
                    </Button>
                    <Button type="submit" variant="dark" className="mb-0 ms-3">
                      Apply filter
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        </Collapse>
      </Container>
    </section>
  );
};

export default HotelGridFilter;
