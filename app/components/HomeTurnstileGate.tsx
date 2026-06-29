'use client';

import { Card, Col, Container, Row } from 'react-bootstrap';
import TurnstileField from '@/app/components/TurnstileField';
import { useTurnstileBrowse } from '@/app/contexts/TurnstileBrowseContext';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function HomeTurnstileGate({ children }: Props) {
  const { turnstileRequired, browseVerified, confirmBrowse } = useTurnstileBrowse();

  if (!turnstileRequired || browseVerified) {
    return <>{children}</>;
  }

  return (
    <section className="py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4 p-sm-5 text-center">
                <h2 className="h5 mb-2">Quick security check</h2>
                <p className="text-secondary small mb-4">
                  Verify you&apos;re human to browse hotels and search listings. This helps us
                  keep bots from loading our catalog.
                </p>
                <TurnstileField
                  className="d-flex justify-content-center"
                  onToken={(token) => {
                    if (token) confirmBrowse(token);
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
