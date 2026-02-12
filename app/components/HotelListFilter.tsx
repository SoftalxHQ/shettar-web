'use client';

import { useToggle } from '@/app/hooks';
import { currency } from '@/app/states';
import { Card, CardBody, Col, Collapse } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { FaAngleDown } from 'react-icons/fa6';
import Link from 'next/link';

const HotelListFilter = () => {
  const { isOpen: hotelTypeIsOpen, toggle: hotelTypeToggle } = useToggle();
  const { isOpen: hotelAmenitiesIsOpen, toggle: hotelAmenitiesToggle } = useToggle();

  return (
    <form className="rounded-3 shadow">
      <Card className="rounded-0 rounded-top p-4 border-0">
        <h6 className="mb-2">Hotel Type</h6>
        <Col xs={12}>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="hotelType1" />
            <label className="form-check-label" htmlFor="hotelType1">
              All
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="hotelType2" />
            <label className="form-check-label" htmlFor="hotelType2">
              Hotel
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="hotelType3" />
            <label className="form-check-label" htmlFor="hotelType3">
              Apartment
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="hotelType4" />
            <label className="form-check-label" htmlFor="hotelType4">
              Resort
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="hotelType5" />
            <label className="form-check-label" htmlFor="hotelType5">
              Villa
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="hotelType6" />
            <label className="form-check-label" htmlFor="hotelType6">
              Lodge
            </label>
          </div>
          <Collapse in={hotelTypeIsOpen}>
            <div className="multi-collapse" id="hotelType">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="hotelType7" />
                <label className="form-check-label" htmlFor="hotelType7">
                  Guest House
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="hotelType10" />
                <label className="form-check-label" htmlFor="hotelType10">
                  Cottage
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="hotelType8" />
                <label className="form-check-label" htmlFor="hotelType8">
                  Beach Hut
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="hotelType9" />
                <label className="form-check-label" htmlFor="hotelType9">
                  Farm house
                </label>
              </div>
            </div>
          </Collapse>
          <button
            onClick={hotelTypeToggle}
            className="btn btn-link p-0 mb-0 mt-2 btn-more d-flex align-items-center collapsed text-decoration-none"
            type="button"
            aria-expanded={hotelTypeIsOpen}
            aria-controls="hotelType"
          >
            See <span className="ms-1">{hotelTypeIsOpen ? 'less' : 'more'}</span>
            <FaAngleDown className="ms-2" />
          </button>
        </Col>
      </Card>
      <hr className="my-0" />
      <Card className="rounded-0 p-4 border-0">
        <h6 className="mb-2">Price range</h6>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="priceRange1" />
            <label className="form-check-label" htmlFor="priceRange1">
              Up to {currency}500
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="priceRange2" />
            <label className="form-check-label" htmlFor="priceRange2">
              {currency}500 - {currency}1000
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="priceRange3" />
            <label className="form-check-label" htmlFor="priceRange3">
              {currency}1000 - {currency}1500
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="priceRange4" />
            <label className="form-check-label" htmlFor="priceRange4">
              {currency}1500 - {currency}2000
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="priceRange5" />
            <label className="form-check-label" htmlFor="priceRange5">
              {currency}2000+
            </label>
          </div>
        </div>
      </Card>
      <hr className="my-0" />
      <Card className="rounded-0 p-4 border-0">
        <h6 className="mb-2">Popular Type</h6>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="popolarType1" />
            <label className="form-check-label" htmlFor="popolarType1">
              Free Breakfast Included
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
          <li className="list-inline-item mb-0">
            <input type="checkbox" className="btn-check" id="btn-check-c1" />
            <label className="btn btn-sm btn-light btn-primary-soft-check" htmlFor="btn-check-c1">
              3+
            </label>
          </li>
          <li className="list-inline-item mb-0">
            <input type="checkbox" className="btn-check" id="btn-check-c2" />
            <label className="btn btn-sm btn-light btn-primary-soft-check" htmlFor="btn-check-c2">
              3.5+
            </label>
          </li>
          <li className="list-inline-item mb-0">
            <input type="checkbox" className="btn-check" id="btn-check-c3" />
            <label className="btn btn-sm btn-light btn-primary-soft-check" htmlFor="btn-check-c3">
              4+
            </label>
          </li>
          <li className="list-inline-item mb-0">
            <input type="checkbox" className="btn-check" id="btn-check-c4" />
            <label className="btn btn-sm btn-light btn-primary-soft-check" htmlFor="btn-check-c4">
              4.5+
            </label>
          </li>
        </ul>
      </Card>
      <hr className="my-0" />
      <Card className="rounded-0 p-4 border-0">
        <h6 className="mb-2">Rating Star</h6>
        <ul className="list-inline mb-0 g-3">
          <li className="list-inline-item mb-0">
            <input type="checkbox" className="btn-check" id="btn-check-6" />
            <label className="btn btn-sm btn-light btn-primary-soft-check d-flex align-items-center" htmlFor="btn-check-6">
              1<BsStarFill className="ms-1" />
            </label>
          </li>
          <li className="list-inline-item mb-0">
            <input type="checkbox" className="btn-check" id="btn-check-7" />
            <label className="btn btn-sm btn-light btn-primary-soft-check d-flex align-items-center" htmlFor="btn-check-7">
              2<BsStarFill className="ms-1" />
            </label>
          </li>
          <li className="list-inline-item mb-0">
            <input type="checkbox" className="btn-check" id="btn-check-8" />
            <label className="btn btn-sm btn-light btn-primary-soft-check d-flex align-items-center" htmlFor="btn-check-8">
              3<BsStarFill className="ms-1" />
            </label>
          </li>
          <li className="list-inline-item mb-0">
            <input type="checkbox" className="btn-check" id="btn-check-15" />
            <label className="btn btn-sm btn-light btn-primary-soft-check d-flex align-items-center" htmlFor="btn-check-15">
              4<BsStarFill className="ms-1" />
            </label>
          </li>
          <li className="list-inline-item mb-0">
            <input type="checkbox" className="btn-check" id="btn-check-16" />
            <label className="btn btn-sm btn-light btn-primary-soft-check d-flex align-items-center" htmlFor="btn-check-16">
              5<BsStarFill className="ms-1" />
            </label>
          </li>
        </ul>
      </Card>
      <hr className="my-0" />
      <Card className="rounded-0 rounded-bottom p-4 border-0">
        <h6 className="mb-2">Amenities</h6>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="amenitiesType1" />
            <label className="form-check-label" htmlFor="amenitiesType1">
              All
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="amenitiesType2" />
            <label className="form-check-label" htmlFor="amenitiesType2">
              Air Conditioning
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="amenitiesType3" />
            <label className="form-check-label" htmlFor="amenitiesType3">
              Bar
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="amenitiesType4" />
            <label className="form-check-label" htmlFor="amenitiesType4">
              Bonfire
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="amenitiesType5" />
            <label className="form-check-label" htmlFor="amenitiesType5">
              Business Services
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="amenitiesType6" />
            <label className="form-check-label" htmlFor="amenitiesType6">
              Caretaker
            </label>
          </div>
          <Collapse in={hotelAmenitiesIsOpen}>
            <div className="multi-collapse" id="amenitiesCollapes">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="amenitiesType7" />
                <label className="form-check-label" htmlFor="amenitiesType7">
                  Dining
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="amenitiesType8" />
                <label className="form-check-label" htmlFor="amenitiesType8">
                  Free Internet
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="amenitiesType9" />
                <label className="form-check-label" htmlFor="amenitiesType9">
                  Hair nets
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="amenitiesType10" />
                <label className="form-check-label" htmlFor="amenitiesType10">
                  Masks
                </label>
              </div>
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
            <FaAngleDown className="ms-2" />
          </button>
        </div>
      </Card>
    </form>
  )
}

export default HotelListFilter
