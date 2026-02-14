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

const amenities = [
  'Air Conditioning',
  'Room Services',
  'Dining',
  'Caretaker',
  'Free Internet',
  'Business Service',
  'Bonfire',
  'Mask',
  'Spa',
  'Swimming pool',
  'Fitness Centre',
  'Bar',
];

const HotelGridFilter = () => {
  const { isOpen, toggle } = useToggle();
  const [priceRange, setPriceRange] = useState<string[]>(['700', '1500']);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filterSchema = yup.object({
    hotelName: yup.string().required('Please enter hotel name'),
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(filterSchema),
  });

  if (!mounted) {
    return (
      <section className="pt-0 pb-4">
        <Container className="position-relative">
          <Row>
            <Col xs={12}>
              <div className="d-flex justify-content-between">
                <input type="checkbox" className="btn-check" id="btn-check-soft" />
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
            <div className="d-flex justify-content-between">
              <input type="checkbox" className="btn-check" id="btn-check-soft" />
              <label
                onClick={toggle}
                className="btn btn-primary-soft btn-primary-check mb-0 items-center"
                htmlFor="btn-check-soft"
                data-bs-toggle="collapse"
                data-bs-target="#collapseFilter"
                aria-controls="collapseFilter"
              >
                <BsSliders className=" fa-fe me-2" />
                Show Filters
              </label>
              <ul className="nav nav-pills nav-pills-dark" id="tour-pills-tab" role="tablist">
                <li className="nav-item">
                  <Link className="nav-link rounded-start rounded-0 mb-0" href="/hotel/list" passHref>
                    <BsListUl size={16} className=" fa-fw" />
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link rounded-end rounded-0 mb-0 active" href="/hotel/grid" passHref>
                    <BsGridFill size={16} className=" fa-fw" />
                  </Link>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
        <Collapse in={isOpen}>
          <Card className="bg-light p-4 mt-4 z-index-9 border-0">
            <CardBody className="p-0">
              <form onSubmit={handleSubmit(() => { })} className="row g-4">
                <Col md={6} lg={4}>
                  <TextFormInput
                    name="hotelName"
                    className="form-control-lg"
                    control={control}
                    label="Enter Hotel Name"
                    containerClass="form-control-borderless"
                  />
                </Col>
                <Col md={6} lg={4}>
                  <div className="form-control-borderless">
                    <label className="form-label">Price Range</label>
                    <div className="position-relative">
                      <div className="noui-wrapper">
                        <div className="d-flex justify-content-between flex-wrap">
                          <input type="text" className="text-body input-with-range-min" value={priceRange[0].split('.')[0]} readOnly />
                          <input type="text" className="text-body input-with-range-max" value={priceRange[1].split('.')[0]} readOnly />
                        </div>
                        <Nouislider
                          start={priceRange}
                          range={{
                            min: 500,
                            max: 2000,
                          }}
                          step={1}
                          onChange={(val) => setPriceRange(val as string[])}
                          className="noui-slider-range mt-2"
                          connect
                        />
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6} lg={4}>
                  <div className="form-size-lg form-control-borderless">
                    <label className="form-label">Popular Filters</label>
                    <SelectFormInput className="form-select js-choice border-0">
                      <option value={-1}>Select Option</option>
                      <option>Recently search</option>
                      <option>Most popular</option>
                      <option>Top rated</option>
                    </SelectFormInput>
                  </div>
                </Col>
                <Col md={6} lg={4}>
                  <div className="form-control-borderless">
                    <label className="form-label">Customer Rating</label>
                    <ul className="list-inline mb-0 g-3">
                      <li className="list-inline-item">
                        <input type="checkbox" className="btn-check" id="btn-check-1" />
                        <label className="btn btn-white btn-primary-soft-check" htmlFor="btn-check-1">
                          3+
                        </label>
                      </li>
                      <li className="list-inline-item">
                        <input type="checkbox" className="btn-check" id="btn-check-2" />
                        <label className="btn btn-white btn-primary-soft-check" htmlFor="btn-check-2">
                          3.5+
                        </label>
                      </li>
                      <li className="list-inline-item">
                        <input type="checkbox" className="btn-check" id="btn-check-3" />
                        <label className="btn btn-white btn-primary-soft-check" htmlFor="btn-check-3">
                          4+
                        </label>
                      </li>
                      <li className="list-inline-item">
                        <input type="checkbox" className="btn-check" id="btn-check-4" />
                        <label className="btn btn-white btn-primary-soft-check" htmlFor="btn-check-4">
                          4.5+
                        </label>
                      </li>
                    </ul>
                  </div>
                </Col>
                <div className="col-md-6 col-lg-4">
                  <div className="form-control-borderless">
                    <label className="form-label">Star Rating</label>
                    <ul className="list-inline mb-0 g-3">
                      {Array.from(new Array(5)).map((_val, idx) => (
                        <li className="list-inline-item" key={idx}>
                          <input type="checkbox" className="btn-check" id={`btn-check2-${idx}`} />
                          <label className="btn btn-white btn-primary-soft-check items-center" htmlFor={`btn-check2-${idx}`}>
                            {idx + 1}
                            <BsStarFill />
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Col md={6} lg={4}>
                  <div className="form-size-lg form-control-borderless">
                    <label className="form-label">Hotel Type</label>
                    <SelectFormInput className="form-select js-choice border-0">
                      <option value={-1}>Select Option</option>
                      <option>Free Cancellation Available</option>
                      <option>Pay At Hotel Available</option>
                      <option>Free Breakfast Included</option>
                    </SelectFormInput>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="form-control-borderless">
                    <label className="form-label">Amenities</label>
                    <Row className="g-3">
                      {amenities.map((item, idx) => {
                        return (
                          <Col key={idx} sm={6} md={4} lg={3} xl={2}>
                            <FormCheck className="mb-0">
                              <FormCheckInput type="checkbox" id={`flexCheckDefault-amenities${idx}`} />
                              <FormCheckLabel className="h6 fw-light mb-0" htmlFor={`flexCheckDefault-amenities${idx}`}>
                                {item}
                              </FormCheckLabel>
                            </FormCheck>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                </Col>
                <div className="text-end align-items-center">
                  <Button variant="link" className="p-0 mb-0 me-1 text-primary-hover">
                    Clear all
                  </Button>
                  <Button type="submit" variant="dark" className="mb-0 ms-3">
                    Apply filter
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Collapse>
      </Container>
    </section>
  );
};

export default HotelGridFilter;
