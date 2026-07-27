'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Container, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { desktopReleaseChannel } from '@/app/helpers/app-env';

type DesktopRelease = {
  version: string;
  channel: string;
  notes?: string | null;
  published_at?: string | null;
};

export default function ChangelogPage() {
  const [releases, setReleases] = useState<DesktopRelease[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const channel = desktopReleaseChannel();

  useEffect(() => {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${apiBase}/api/v1/desktop_releases?channel=${channel}&limit=20`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load changelog');
        }
        const data = await res.json();
        if (!cancelled) setReleases((data.releases || []) as DesktopRelease[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load changelog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [channel]);

  return (
    <>
      <Header />
      <main>
        <section className="pt-4 pt-md-5 pb-5">
          <Container>
            <Row className="justify-content-center">
              <Col lg={8}>
                <div className="text-center mb-5">
                  <h1 className="mb-2">Changelog</h1>
                  <p className="lead text-secondary mb-3">
                    What’s new in Shettar Business
                    {channel === 'staging' ? ' (staging)' : ''}.
                  </p>
                  <Link href="/download" className="btn btn-outline-primary btn-sm">
                    Download installers
                  </Link>
                </div>

                {loading && (
                  <div className="py-5 text-center">
                    <Spinner animation="border" role="status" variant="primary" />
                  </div>
                )}

                {!loading && error && (
                  <div className="alert alert-warning" role="alert">
                    {error}
                  </div>
                )}

                {!loading && !error && releases.length === 0 && (
                  <p className="text-center text-secondary">No releases published yet.</p>
                )}

                {!loading &&
                  releases.map((release) => (
                    <article
                      key={`${release.channel}-${release.version}`}
                      className="mb-4 p-4 bg-light rounded"
                      id={`v${release.version}`}
                    >
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <Badge bg="primary" className="fs-6 fw-normal">
                          v{release.version}
                        </Badge>
                        {release.published_at ? (
                          <span className="text-secondary small">
                            {new Date(release.published_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        ) : null}
                      </div>
                      {release.notes ? (
                        <pre
                          className="mb-0 small text-secondary"
                          style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
                        >
                          {release.notes}
                        </pre>
                      ) : (
                        <p className="mb-0 small text-secondary">No release notes for this version.</p>
                      )}
                    </article>
                  ))}
              </Col>
            </Row>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
