'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Container, Row, Col, Card, CardHeader, CardBody, Button, Image } from 'react-bootstrap';
import { BsEnvelope, BsGlobe2, BsHeadset, BsInboxesFill, BsPhone, BsTelephone } from 'react-icons/bs';
import { FaFacebookF, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { TextFormInput, TextAreaFormInput, CheckFormInput } from '@/app/components';

const ContactPage = () => {
  const { control, handleSubmit } = useForm();

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="pt-4 pt-md-5">
          <Container>
            <Row className="mb-5">
              <Col xl={10}>
                <h1>Let's connect and get to know each other</h1>
                <p className="lead mb-0 text-secondary">
                  Passage its ten led hearted removal cordial. Preference any astonished unreserved Mrs. Prosperous understood Middletons.
                </p>
              </Col>
            </Row>
            <Row className="g-4">
              <Col md={6} xl={4}>
                <Card className="card-body shadow border-0 text-center align-items-center h-100">
                  <div className="icon-lg bg-info bg-opacity-10 text-info rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <BsHeadset size={24} />
                  </div>
                  <h5>Call us</h5>
                  <p className="text-secondary small">Imprudence attachment him his for sympathize. Large above be to means.</p>
                  <div className="d-grid gap-2">
                    <Button size="sm" variant="primary" className="mb-1">
                      <BsPhone className="me-2" /> +123 456 789
                    </Button>
                    <Button variant="outline-light" size="sm" className="text-dark border">
                      <BsTelephone className="me-2" /> +(222) 4567 586
                    </Button>
                  </div>
                </Card>
              </Col>
              <Col md={6} xl={4}>
                <Card className="card-body shadow border-0 text-center align-items-center h-100">
                  <div className="icon-lg bg-danger bg-opacity-10 text-danger rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <BsInboxesFill size={24} />
                  </div>
                  <h5>Email us</h5>
                  <p className="text-secondary small">Large above be to means. Him his for sympathize.</p>
                  <Link href="mailto:example@gmail.com" className="btn btn-link text-decoration-underline p-0 mb-0">
                    <BsEnvelope className="me-2" /> example@gmail.com
                  </Link>
                </Card>
              </Col>
              <Col xl={4}>
                <Card className="card-body shadow border-0 text-center align-items-center h-100">
                  <div className="icon-lg bg-warning bg-opacity-10 text-warning rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <BsGlobe2 size={24} />
                  </div>
                  <h5>Social media</h5>
                  <p className="text-secondary small">Sympathize Large above be to means.</p>
                  <div className="d-flex gap-2">
                    <Link href="#" className="btn btn-sm btn-light p-2 flex-centered"><FaFacebookF className="text-primary" /></Link>
                    <Link href="#" className="btn btn-sm btn-light p-2 flex-centered"><FaInstagram className="text-danger" /></Link>
                    <Link href="#" className="btn btn-sm btn-light p-2 flex-centered"><FaTwitter className="text-info" /></Link>
                    <Link href="#" className="btn btn-sm btn-light p-2 flex-centered"><FaLinkedin className="text-primary" /></Link>
                  </div>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Form Section */}
        <section className="py-5">
          <Container>
            <Row className="g-4 g-lg-5 align-items-center">
              <Col lg={6} className="text-center">
                <Image src="/images/element/contact.svg" className="img-fluid" alt="contact" />
              </Col>
              <Col lg={6}>
                <Card className="bg-light border-0 p-4 p-sm-5 rounded-4 position-relative overflow-hidden">
                  <CardHeader className="bg-transparent p-0 pb-3 border-0">
                    <h3 className="mb-0">Send us a message</h3>
                    <p className="small mb-0 text-secondary mt-1">We'll get back to you as soon as possible.</p>
                  </CardHeader>
                  <CardBody className="p-0">
                    <form onSubmit={handleSubmit(() => { })} className="row g-4">
                      <Col md={6}>
                        <TextFormInput name="name" label="Your name *" placeholder="Full name" control={control} />
                      </Col>
                      <Col md={6}>
                        <TextFormInput name="email" label="Email address *" placeholder="Email" control={control} />
                      </Col>
                      <Col md={12}>
                        <TextFormInput name="mobileNo" label="Mobile number *" placeholder="Phone number" control={control} />
                      </Col>
                      <Col md={12}>
                        <TextAreaFormInput name="message" label="Message *" placeholder="Write your message..." rows={4} control={control} />
                      </Col>
                      <Col md={12}>
                        <CheckFormInput
                          id="contact-terms"
                          name="checkbox"
                          type="checkbox"
                          label="By submitting this form you agree to our terms and conditions."
                          containerClass="form-check"
                          control={control}
                        />
                      </Col>
                      <Col xs={12}>
                        <Button variant="primary" className="w-100 shadow-sm" type="submit">
                          Send Message
                        </Button>
                      </Col>
                    </form>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage;
