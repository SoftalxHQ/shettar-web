'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Container, Row, Col, Spinner, Badge, Button, Collapse } from 'react-bootstrap';
import { desktopReleaseChannel } from '@/app/helpers/app-env';

type DesktopRelease = {
  version: string;
  channel: string;
  notes?: string | null;
  published_at?: string | null;
};

type ReleasesMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

const PAGE_SIZE = 10;

function ChangelogContent() {
  const searchParams = useSearchParams();
  const focusVersion = useMemo(() => {
    const fromQuery = searchParams.get('v')?.replace(/^v/i, '').trim();
    if (fromQuery) return fromQuery;
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#v')) {
      return window.location.hash.slice(2).replace(/^v/i, '').trim();
    }
    return null;
  }, [searchParams]);

  const [releases, setReleases] = useState<DesktopRelease[]>([]);
  const [meta, setMeta] = useState<ReleasesMeta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const channel = desktopReleaseChannel();
  const hasMore = !!meta && meta.page < meta.total_pages;

  const fetchPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const res = await fetch(
        `${apiBase}/api/v1/desktop_releases?channel=${channel}&limit=${PAGE_SIZE}&page=${pageToLoad}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to load changelog');
      }
      const data = await res.json();
      const nextReleases = (data.releases || []) as DesktopRelease[];
      const nextMeta = (data.meta || null) as ReleasesMeta | null;

      setReleases((prev) => (append ? [...prev, ...nextReleases] : nextReleases));
      setMeta(nextMeta);
      setPage(pageToLoad);
      return nextReleases;
    },
    [channel]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const nextReleases = await fetchPage(1, false);
        if (cancelled) return;

        if (focusVersion) {
          setExpanded((prev) => ({ ...prev, [focusVersion]: true }));
          window.setTimeout(() => {
            document.getElementById(`v${focusVersion}`)?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 100);
        } else if (nextReleases[0]?.version) {
          setExpanded({ [nextReleases[0].version]: true });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load changelog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [channel, fetchPage, focusVersion]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      await fetchPage(page + 1, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more releases');
    } finally {
      setLoadingMore(false);
    }
  };

  const toggle = (version: string) => {
    setExpanded((prev) => ({ ...prev, [version]: !prev[version] }));
  };

  return (
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
              releases.map((release) => {
                const isOpen = !!expanded[release.version];
                return (
                  <article
                    key={`${release.channel}-${release.version}`}
                    className="mb-3 border rounded overflow-hidden bg-white"
                    id={`v${release.version}`}
                  >
                    <button
                      type="button"
                      className="w-100 text-start border-0 bg-light px-3 py-3 d-flex flex-wrap align-items-center justify-content-between gap-2"
                      onClick={() => toggle(release.version)}
                      aria-expanded={isOpen}
                    >
                      <span className="d-flex flex-wrap align-items-center gap-2">
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
                      </span>
                      <span className="text-secondary small">{isOpen ? 'Hide notes' : 'Show notes'}</span>
                    </button>
                    <Collapse in={isOpen}>
                      <div>
                        <div className="px-3 pb-3 pt-2">
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
                        </div>
                      </div>
                    </Collapse>
                  </article>
                );
              })}

            {!loading && hasMore ? (
              <div className="text-center mt-4">
                <Button variant="outline-primary" onClick={() => void loadMore()} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
                {meta ? (
                  <p className="text-secondary small mt-2 mb-0">
                    Showing {releases.length} of {meta.total}
                  </p>
                ) : null}
              </div>
            ) : null}
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default function ChangelogPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense
          fallback={
            <div className="py-5 text-center">
              <Spinner animation="border" role="status" variant="primary" />
            </div>
          }
        >
          <ChangelogContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
