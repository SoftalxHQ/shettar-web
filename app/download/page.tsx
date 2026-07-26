'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { BsApple, BsWindows, BsUbuntu, BsDownload } from 'react-icons/bs';
import { desktopReleaseChannel } from '@/app/helpers/app-env';

type Installers = {
  windows?: string | null;
  macos_x64?: string | null;
  macos_arm?: string | null;
  linux?: string | null;
};

type LatestRelease = {
  version: string;
  channel: string;
  notes?: string | null;
  published_at?: string | null;
  installers: Installers;
};

type DetectedOs = 'windows' | 'macos' | 'linux' | 'unknown';

const IOS_APP_URL =
  process.env.NEXT_PUBLIC_IOS_APP_URL || 'https://apps.apple.com/search?term=Shettar';
const ANDROID_APP_URL =
  process.env.NEXT_PUBLIC_ANDROID_APP_URL ||
  'https://play.google.com/store/apps/details?id=com.softalx.shettar';

function detectOs(): DetectedOs {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Mac/i.test(ua)) return 'macos';
  if (/Linux|X11/i.test(ua)) return 'linux';
  return 'unknown';
}

function preferMacInstaller(installers: Installers): string | null {
  if (installers.macos_arm) return installers.macos_arm;
  if (installers.macos_x64) return installers.macos_x64;
  return null;
}

export default function DownloadPage() {
  const [release, setRelease] = useState<LatestRelease | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [os, setOs] = useState<DetectedOs>('unknown');

  const channel = desktopReleaseChannel();

  useEffect(() => {
    setOs(detectOs());
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/desktop_releases/latest?channel=${channel}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'No desktop release available yet');
        }
        const data = await res.json();
        if (!cancelled) setRelease(data.release as LatestRelease);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load download');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [channel]);

  const primary = useMemo(() => {
    if (!release) return null;
    const { installers } = release;
    if (os === 'windows' && installers.windows) {
      return { label: 'Download for Windows', url: installers.windows, icon: BsWindows };
    }
    if (os === 'macos') {
      const url = preferMacInstaller(installers);
      if (url) return { label: 'Download for macOS', url, icon: BsApple };
    }
    if (os === 'linux' && installers.linux) {
      return { label: 'Download for Linux', url: installers.linux, icon: BsUbuntu };
    }
    if (installers.windows) return { label: 'Download for Windows', url: installers.windows, icon: BsWindows };
    const mac = preferMacInstaller(installers);
    if (mac) return { label: 'Download for macOS', url: mac, icon: BsApple };
    if (installers.linux) return { label: 'Download for Linux', url: installers.linux, icon: BsUbuntu };
    return null;
  }, [release, os]);

  const otherLinks = useMemo(() => {
    if (!release) return [];
    const { installers } = release;
    const links: { label: string; url: string }[] = [];
    if (installers.windows) links.push({ label: 'Windows (.exe)', url: installers.windows });
    if (installers.macos_arm) links.push({ label: 'macOS Apple Silicon (.dmg)', url: installers.macos_arm });
    if (installers.macos_x64) links.push({ label: 'macOS Intel (.dmg)', url: installers.macos_x64 });
    if (installers.linux) links.push({ label: 'Linux (.AppImage)', url: installers.linux });
    return links.filter((l) => l.url !== primary?.url);
  }, [release, primary]);

  return (
    <>
      <Header />
      <main>
        <section className="pt-4 pt-md-5 pb-5">
          <Container>
            <Row className="justify-content-center mb-5">
              <Col lg={8} className="text-center">
                <h1 className="mb-2">Download Shettar</h1>
                <p className="lead text-secondary mb-4">
                  Get the traveler app on your phone, or install Shettar Business on your desktop.
                </p>

                <h2 className="h4 mb-3">Mobile app</h2>
                <p className="text-secondary mb-4">
                  Book stays, manage trips, and get updates on the go — available on iOS and Android.
                </p>
                <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
                  <a
                    href={IOS_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download on the App Store"
                  >
                    <Image
                      src="/images/element/app-store.svg"
                      alt="Download on the App Store"
                      width={148}
                      height={44}
                      style={{ height: 44, width: 'auto' }}
                    />
                  </a>
                  <a
                    href={ANDROID_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get it on Google Play"
                  >
                    <Image
                      src="/images/element/google-play.svg"
                      alt="Get it on Google Play"
                      width={148}
                      height={44}
                      style={{ height: 44, width: 'auto' }}
                    />
                  </a>
                </div>
              </Col>
            </Row>

            <hr className="my-5" />

            <Row className="justify-content-center">
              <Col lg={8} className="text-center">
                <h2 className="h4 mb-2">Shettar Business (desktop)</h2>
                <p className="text-secondary mb-4">
                  Manage your property — bookings, check-in, and payments in one place.
                </p>

                {loading && (
                  <div className="py-4">
                    <Spinner animation="border" role="status" variant="primary" />
                  </div>
                )}

                {!loading && error && (
                  <div className="alert alert-warning" role="alert">
                    {error}
                  </div>
                )}

                {!loading && release && (
                  <>
                    <p className="text-secondary mb-3">
                      Version <strong>v{release.version}</strong>
                      {release.published_at
                        ? ` · ${new Date(release.published_at).toLocaleDateString()}`
                        : null}
                      {channel === 'staging' ? ' · Staging' : null}
                    </p>

                    {primary ? (
                      <a href={primary.url} className="btn btn-primary btn-lg mb-3 px-4">
                        <primary.icon className="me-2" />
                        {primary.label}
                        <BsDownload className="ms-2" />
                      </a>
                    ) : (
                      <p className="text-secondary">Installer links are not available for this release yet.</p>
                    )}

                    {otherLinks.length > 0 && (
                      <div className="mt-4">
                        <p className="small text-secondary mb-2">Other platforms</p>
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                          {otherLinks.map((link) => (
                            <a
                              key={link.label}
                              href={link.url}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {release.notes ? (
                      <div className="text-start mt-5 p-4 bg-light rounded">
                        <h5 className="mb-2">Release notes</h5>
                        <pre className="mb-0 small text-secondary" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                          {release.notes}
                        </pre>
                      </div>
                    ) : null}
                  </>
                )}
              </Col>
            </Row>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
