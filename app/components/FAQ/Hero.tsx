'use client';

import { Col, Container, Row } from 'react-bootstrap';
import { BsHouse } from 'react-icons/bs';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="pt-4 pt-lg-5">
      <Container>
        <Row>
          <Col lg={10} className="mx-auto text-center">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-dots justify-content-center">
                <li className="breadcrumb-item">
                  <Link href="/" className="items-center d-flex gap-1">
                    <BsHouse className=" me-1" /> Home
                  </Link>
                </li>
                <li className="breadcrumb-item active">Faqs</li>
              </ol>
            </nav>
            <h6 className="text-primary">Faqs</h6>
            <h1>Frequently Asked Questions</h1>
            <p>Have questions? We're here to help you</p>
            <form className="col-lg-8 position-relative mx-auto">
              <input className="form-control form-control-lg pe-5" type="search" placeholder="Type search words" aria-label="Search" />
              <button
                className="text-primary-hover text-reset border-0 bg-transparent position-absolute top-50 end-0 translate-middle-y pe-3 py-0 flex-centered"
                type="submit"
              >
                <FaSearch size={16} />
              </button>
            </form>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;
