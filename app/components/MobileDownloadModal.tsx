'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Modal } from 'react-bootstrap';

const IOS_APP_URL =
  process.env.NEXT_PUBLIC_IOS_APP_URL || 'https://apps.apple.com/search?term=Shettar';
const ANDROID_APP_URL =
  process.env.NEXT_PUBLIC_ANDROID_APP_URL ||
  'https://play.google.com/store/apps/details?id=com.softalx.shettar';

type MobileDownloadModalProps = {
  show: boolean;
  onHide: () => void;
};

export default function MobileDownloadModal({ show, onHide }: MobileDownloadModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Download Shettar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-secondary mb-4">
          Install the traveler app on your phone for faster booking, trip updates, and stays on the go.
        </p>

        <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-3">
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

        <p className="text-center mb-0 small">
          <Link href="/download" className="text-decoration-none" onClick={onHide}>
            More download options
          </Link>
        </p>
      </Modal.Body>
    </Modal>
  );
}
