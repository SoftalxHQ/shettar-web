'use client';

import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import { BsGridFill, BsListUl, BsSliders } from 'react-icons/bs';

export default function HotelListFilter() {
  return (
    <section className="pt-0 pb-4">
      <Container className="position-relative">
        <Row>
          <Col xs={12}>
            <div className="d-flex justify-content-between">
              <input type="checkbox" className="btn-check" id="btn-check-soft" />
              <label
                className="btn btn-primary-soft btn-primary-check mb-0 items-center"
                htmlFor="btn-check-soft"
              >
                <BsSliders className="fa-fe me-2" />
                Show Filters
              </label>

              <ul className="nav nav-pills nav-pills-dark" id="tour-pills-tab" role="tablist">
                <li className="nav-item">
                  <Link className="nav-link rounded-start rounded-0 mb-0" href="/hotels/list">
                    <BsListUl size={16} className="fa-fw" />
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link rounded-end rounded-0 mb-0 active" href="/hotels/grid">
                    <BsGridFill size={16} className="fa-fw" />
                  </Link>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
