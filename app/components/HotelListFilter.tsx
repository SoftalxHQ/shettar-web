'use client';

import { useState, useEffect } from 'react';
import { useToggle } from '@/app/hooks';
import { currency } from '@/app/states';
import { Card, CardBody, Col, Collapse } from 'react-bootstrap';
import { BsStarFill, BsSearch } from 'react-icons/bs';
import { FaAngleDown } from 'react-icons/fa6';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Nouislider from 'nouislider-react';

const HotelListFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { isOpen: hotelTypeIsOpen, toggle: hotelTypeToggle } = useToggle();
  const { isOpen: hotelAmenitiesIsOpen, toggle: hotelAmenitiesToggle } = useToggle();
  const [hotelName, setHotelName] = useState(searchParams.get('name') || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<number[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<string[]>(['0', '500000']);

  useEffect(() => {
    setHotelName(searchParams.get('name') || '');
    setSelectedAmenities(searchParams.get('amenities')?.split(',') || []);
    setSelectedStars(searchParams.get('stars')?.split(',').filter(Boolean).map(s => parseInt(s)) || []);
    setSelectedHotelTypes(searchParams.get('hotel_types')?.split(',').filter(Boolean).map(s => parseInt(s)) || []);
    setMinRating(parseFloat(searchParams.get('min_rating') || '0'));
    setPriceRange([
      searchParams.get('min_price') || '0',
      searchParams.get('max_price') || '500000'
    ]);
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

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRatingToggle = (rating: number) => {
    const newValue = minRating === rating ? null : rating.toString();
    updateFilter('min_rating', newValue);
  };

  const handleStarToggle = (star: number) => {
    let newStars: number[];
    if (selectedStars.includes(star)) {
      newStars = selectedStars.filter(s => s !== star);
    } else {
      newStars = [...selectedStars, star];
    }
    updateFilter('stars', newStars.length > 0 ? newStars.join(',') : null);
  };

  const handleHotelTypeToggle = (id: number) => {
    let newTypes: number[];
    if (selectedHotelTypes.includes(id)) {
      newTypes = selectedHotelTypes.filter(t => t !== id);
    } else {
      newTypes = [...selectedHotelTypes, id];
    }
    updateFilter('hotel_types', newTypes.length > 0 ? newTypes.join(',') : null);
  };

  const handleAmenityToggle = (amenity: string) => {
    let newAmenities: string[];
    if (selectedAmenities.includes(amenity)) {
      newAmenities = selectedAmenities.filter(a => a !== amenity);
    } else {
      newAmenities = [...selectedAmenities, amenity];
    }
    updateFilter('amenities', newAmenities.length > 0 ? newAmenities.join(',') : null);
  };

  const handleNameSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('name', hotelName);
  };

  const handlePriceChange = (value: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('min_price', value[0].toString());
    params.set('max_price', value[1].toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    // Preserve core search params
    const preserve = ['start_date', 'end_date', 'rooms', 'location'];
    preserve.forEach(key => {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    });
    router.push(`${pathname}?${params.toString()}`);
  };


  return (
    <div className="rounded-3 shadow">
      {/* Hotel Name Search */}
      <Card className="rounded-0 rounded-top p-4 border-0">
        <h6 className="mb-2">Hotel Name</h6>
        <form onSubmit={handleNameSearch} className="form-control-borderless">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name..."
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              <BsSearch />
            </button>
          </div>
        </form>
      </Card>
      <hr className="my-0" />

      <Card className="rounded-0 p-4 border-0">
        <h6 className="mb-2">Hotel Type</h6>
        <Col xs={12}>
          {categories.slice(0, 4).map((type) => (
            <div className="form-check" key={type.id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`hotelType-${type.id}`}
                checked={selectedHotelTypes.includes(type.id)}
                onChange={() => handleHotelTypeToggle(type.id)}
              />
              <label className="form-check-label" htmlFor={`hotelType-${type.id}`}>
                {type.name}
              </label>
            </div>
          ))}

          <Collapse in={hotelTypeIsOpen}>
            <div id="hotelTypeCollapse">
              {categories.slice(4).map((type) => (
                <div className="form-check" key={type.id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`hotelTypeMore-${type.id}`}
                    checked={selectedHotelTypes.includes(type.id)}
                    onChange={() => handleHotelTypeToggle(type.id)}
                  />
                  <label className="form-check-label" htmlFor={`hotelTypeMore-${type.id}`}>
                    {type.name}
                  </label>
                </div>
              ))}
            </div>
          </Collapse>

          <button
            onClick={hotelTypeToggle}
            className="btn btn-link p-0 mb-0 mt-2 btn-more d-flex align-items-center collapsed text-decoration-none"
            type="button"
            aria-expanded={hotelTypeIsOpen}
            aria-controls="hotelTypeCollapse"
          >
            See <span className="ms-1">{hotelTypeIsOpen ? 'less' : 'more'}</span>
            <FaAngleDown className="ms-2" />
          </button>
        </Col>
      </Card>
      <hr className="my-0" />
      <Card className="rounded-0 p-4 border-0">
        <h6 className="mb-2">Price range</h6>
        <div className="col-12 mt-3">
          <div className="noui-wrapper">
            <div className="d-flex justify-content-between flex-wrap mb-2">
              <span className="fw-bold">{currency}{parseInt(priceRange[0]).toLocaleString()}</span>
              <span className="fw-bold">{currency}{parseInt(priceRange[1]).toLocaleString()}</span>
            </div>
            <Nouislider
              start={[parseInt(priceRange[0]), parseInt(priceRange[1])]}
              range={{
                min: 0,
                max: 500000,
              }}
              connect
              step={1000}
              onSlide={(value) => setPriceRange([value[0].toString(), value[1].toString()])}
              onChange={handlePriceChange}
            />
          </div>
        </div>
      </Card>
      <hr className="my-0" />
      <Card className="rounded-0 p-4 border-0">
        <h6 className="mb-2">Popular Type</h6>
        <div className="col-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="popolarType1"
              checked={selectedAmenities.includes('breakfast')}
              onChange={() => handleAmenityToggle('breakfast')}
            />
            <label className="form-check-label" htmlFor="popolarType1">
              Free Breakfast Included
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="popolarTypeWifi"
              checked={selectedAmenities.includes('wifi')}
              onChange={() => handleAmenityToggle('wifi')}
            />
            <label className="form-check-label" htmlFor="popolarTypeWifi">
              Free WiFi
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="popolarType2" />
            <label className="form-check-label" htmlFor="popolarType2">
              Pay At Hotel Available
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="popolarType3" />
            <label className="form-check-label" htmlFor="popolarType3">
              Free Cancellation Available
            </label>
          </div>
        </div>
      </Card>
      <hr className="my-0" />
      <Card className="rounded-0 p-4 border-0">
        <h6 className="mb-2">Customer Rating</h6>
        <ul className="list-inline mb-0 g-3">
          {[3, 3.5, 4, 4.5].map((rating) => (
            <li className="list-inline-item mb-0" key={rating}>
              <input
                type="checkbox"
                className="btn-check"
                id={`btn-check-c-${rating}`}
                checked={minRating === rating}
                onChange={() => handleRatingToggle(rating)}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check" htmlFor={`btn-check-c-${rating}`}>
                {rating}+
              </label>
            </li>
          ))}
        </ul>
      </Card>
      <hr className="my-0" />
      <Card className="rounded-0 p-4 border-0">
        <h6 className="mb-2">Rating Star</h6>
        <ul className="list-inline mb-0 g-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <li className="list-inline-item mb-0" key={star}>
              <input
                type="checkbox"
                className="btn-check"
                id={`btn-check-s-${star}`}
                checked={selectedStars.includes(star)}
                onChange={() => handleStarToggle(star)}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check d-flex align-items-center" htmlFor={`btn-check-s-${star}`}>
                {star}<BsStarFill className="ms-1" />
              </label>
            </li>
          ))}
        </ul>
      </Card>
      <hr className="my-0" />
      <Card className="rounded-0 rounded-bottom p-4 border-0">
        <h6 className="mb-2">Amenities</h6>
        <div className="col-12">
          {[
            { label: 'Air Conditioning', value: 'ac' },
            { label: 'Bar', value: 'bar' },
            { label: 'Swimming Pool', value: 'swimming_pool' },
            { label: 'Gym', value: 'gym' },
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Parking', value: 'parking' },
          ].map((item, idx) => (
            <div className="form-check" key={idx}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`amenitiesType-${item.value}`}
                checked={selectedAmenities.includes(item.value)}
                onChange={() => handleAmenityToggle(item.value)}
              />
              <label className="form-check-label" htmlFor={`amenitiesType-${item.value}`}>
                {item.label}
              </label>
            </div>
          ))}

          <Collapse in={hotelAmenitiesIsOpen}>
            <div className="multi-collapse" id="amenitiesCollapes">
              {[
                { label: 'Spa', value: 'spa' },
                { label: 'WiFi', value: 'wifi' },
                { label: 'Kitchenette', value: 'kitchenette' },
                { label: 'Room Service', value: 'room_service' },
                { label: 'Laundry', value: 'laundry' },
              ].map((item, idx) => (
                <div className="form-check" key={`more-${idx}`}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`amenitiesMore-${item.value}`}
                    checked={selectedAmenities.includes(item.value)}
                    onChange={() => handleAmenityToggle(item.value)}
                  />
                  <label className="form-check-label" htmlFor={`amenitiesMore-${item.value}`}>
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </Collapse>
          <button
            onClick={hotelAmenitiesToggle}
            className="btn btn-link p-0 mb-0 mt-2 btn-more d-flex align-items-center collapsed text-decoration-none"
            type="button"
            aria-expanded={hotelAmenitiesIsOpen}
            aria-controls="amenitiesCollapes"
          >
            See <span className="ms-1">{hotelAmenitiesIsOpen ? 'less' : 'more'}</span>
          </button>
        </div>
      </Card>

      <div className="d-grid p-4 pt-0">
        <button className="btn btn-outline-primary" type="button" onClick={clearAll}>
          Clear all filters
        </button>
      </div>
    </div>
  )
}

export default HotelListFilter
