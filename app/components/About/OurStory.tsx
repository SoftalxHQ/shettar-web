'use client';

import clsx from 'clsx';
import { Col, Container, Row } from 'react-bootstrap';
import { ourStories } from './data';

const OurStory = () => {
  return (
    <section className="pt-0 pt-lg-5">
      <Container>
        <Row className="mb-4 mb-md-5">
          <Col md={10} className="mx-auto">
            <h3 className="mb-4">Our Story</h3>
            <p className="fw-bold">
              Founded in 2006, passage its ten led hearted removal cordial. Preference any astonished unreserved Mrs. Prosperous understood Middletons
              in conviction an uncommonly do. Supposing so be resolving breakfast am or perfectly. It drew a hill from me. Valley by oh twenty direct
              me so.
            </p>
            <p className="mb-0">
              Water timed folly right aware if oh truth. Imprudence attachment him his for sympathize. Large above be to means. Dashwood does provide
              stronger is. Warrant private blushes removed an in equally totally if. Delivered dejection necessary objection do Mr prevailed. Mr
              feeling does chiefly cordial in do. ...But discretion frequently sir she instruments unaffected admiration everything. Meant balls it if
              up doubt small purse. Required his you put the outlived answered position. A pleasure exertion if believed provided to. All led out
              world this music while asked. Paid mind even sons does he door no. Attended overcame repeated it is perceived Marianne in. I think on
              style child of. Servants moreover in sensible it ye possible. Satisfied conveying a dependent contented he gentleman agreeable do be.
              Water timed folly right aware if oh truth. Imprudence attachment him his for sympathize. Large above be to means. Dashwood does provide
              stronger is. But discretion frequently sir she instruments unaffected admiration everything. Meant balls it if up doubt small purse.
              Required his you put the outlived answered position. I think on style child of. Servants moreover in sensible it ye possible. Satisfied
              conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if. Delivered
              dejection necessary objection do Mr prevailed. Required his you put the outlived answered position. A pleasure exertion if believed
              provided to. All led out world this music while asked. Paid mind even sons does he door no. Attended overcame repeated it is perceived
              Marianne in. I think on style child of. Servants moreover in sensible it ye possible.
            </p>
          </Col>
        </Row>
        <Row className="g-4">
          {ourStories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Col key={idx} sm={6} lg={3}>
                <div className={clsx('icon-lg bg-opacity-10 rounded-2 flex-centered', item.variant)}>
                  <Icon size={21} />
                </div>
                <h5 className="mt-2">{item.title}</h5>
                <p className="mb-0">{item.description}</p>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default OurStory;
