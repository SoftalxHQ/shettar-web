'use client';

import clsx from 'clsx';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import { whyShettar } from './data';

const WhyShettar = () => {
  return (
    <section className="pt-0">
      <Container>
        <Row className="mb-4">
          <Col xs={12}>
            <h2 className="mb-0">Why Guests Choose Shettar</h2>
            <p className="mb-0 mt-2 text-secondary">Everything you need to book with confidence.</p>
          </Col>
        </Row>
        <Row className="g-4">
          {whyShettar.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Col key={idx} sm={6} lg={3}>
                <Card className="card-body border h-100">
                  <div className={clsx('icon-lg bg-opacity-10 rounded-2 flex-centered mb-3', item.variant)}>
                    <Icon size={22} />
                  </div>
                  <CardBody className="p-0">
                    <h5 className="mb-2">{item.title}</h5>
                    <p className="mb-0">{item.description}</p>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default WhyShettar;
