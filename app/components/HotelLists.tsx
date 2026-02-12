'use client';

import { useToggle } from '@/app/hooks';
import { Alert, Button, Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { BsExclamationOctagonFill, BsGridFill, BsListUl, BsXLg } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaSliders } from 'react-icons/fa6';
import Link from 'next/link';

// Components
import HotelListCard from './HotelListCard';
import HotelListFilter from './HotelListFilter';

// Data
import { hotels } from '@/app/data/hotels';

const HotelLists = () => {
  const { isOpen, toggle } = useToggle();

  const { isOpen: alertVisible, hide: hideAlert } = useToggle(true);

  return (
    <section className="pt-0">
      <Container>
        <Row className="mb-4">
          <Col xs={12}>
            <Alert
              show={alertVisible}
              variant="danger"
              className="d-flex justify-content-between align-items-center rounded-3 fade show mb-4 mb-0 pe-2 py-3"
              role="alert"
            >
              <div className="d-flex align-items-center">
                <span className="alert-heading h5 mb-0 me-2">
                  <BsExclamationOctagonFill />
                </span>
                <span>
                  <strong className="alert-heading me-2">Covid Policy:</strong>You may require to present an RT-PCR negative test report at the hotel
                </span>
              </div>
              <Button variant="link" onClick={hideAlert} type="button" className="pb-0 pt-1 text-end" data-bs-dismiss="alert" aria-label="Close">
                <BsXLg className=" text-dark" />
              </Button>
            </Alert>

            <div className="hstack gap-3 justify-content-between justify-content-md-end">
              <Button
                onClick={toggle}
                variant="primary-soft"
                className="btn-primary-check mb-0 d-xl-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasSidebar"
                aria-controls="offcanvasSidebar"
              >
                <FaSliders className="me-1" /> Show filters
              </Button>
              <ul className="nav nav-pills nav-pills-dark" id="tour-pills-tab" role="tablist">
                <li className="nav-item">
                  <Link className="nav-link rounded-start rounded-0 mb-0 active " href="/hotels/list">
                    <BsListUl className=" fa-fw mb-1" />
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link rounded-end rounded-0 mb-0 " href="/hotels/grid">
                    <BsGridFill className=" fa-fw mb-1" />
                  </Link>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xl={4} xxl={3}>
            <div className="d-none d-xl-block">
              <HotelListFilter />
              <div className="d-flex justify-content-between p-2 p-xl-0 mt-xl-4">
                <button className="btn btn-link p-0 mb-0">Clear all</button>
                <button className="btn btn-primary mb-0">Filter Result</button>
              </div>
            </div>
            <Offcanvas
              placement="end"
              show={isOpen}
              onHide={toggle}
              className="offcanvas-xl"
              tabIndex={-1}
              id="offcanvasSidebar"
              aria-labelledby="offcanvasSidebarLabel"
            >
              <OffcanvasHeader className="offcanvas-header" closeButton>
                <h5 className="offcanvas-title" id="offcanvasSidebarLabel">
                  Advance Filters
                </h5>
              </OffcanvasHeader>
              <OffcanvasBody className="offcanvas-body flex-column p-3 p-xl-0">
                <HotelListFilter />
              </OffcanvasBody>
              <div className="d-flex justify-content-between p-2 p-xl-0 mt-xl-4">
                <button className="btn btn-link p-0 mb-0">Clear all</button>
                <button className="btn btn-primary mb-0">Filter Result</button>
              </div>
            </Offcanvas>
          </Col>
          <Col xl={8} xxl={9}>
            <div className="vstack gap-4">
              {hotels.map((hotel, idx) => (
                <HotelListCard key={idx} hotel={hotel} />
              ))}

              <nav className="d-flex justify-content-center" aria-label="navigation">
                <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                  <li className="page-item mb-0">
                    <Link className="page-link" href="" tabIndex={-1}>
                      <FaAngleLeft />
                    </Link>
                  </li>
                  <li className="page-item mb-0">
                    <Link className="page-link" href="">
                      1
                    </Link>
                  </li>
                  <li className="page-item mb-0 active">
                    <Link className="page-link" href="">
                      2
                    </Link>
                  </li>
                  <li className="page-item mb-0">
                    <Link className="page-link" href="">
                      ..
                    </Link>
                  </li>
                  <li className="page-item mb-0">
                    <Link className="page-link" href="">
                      6
                    </Link>
                  </li>
                  <li className="page-item mb-0">
                    <Link className="page-link" href="">
                      <FaAngleRight />
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HotelLists;
