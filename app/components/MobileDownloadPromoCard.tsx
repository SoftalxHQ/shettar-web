'use client';

import { Button } from 'react-bootstrap';
import { BsPhone, BsX } from 'react-icons/bs';

const DISMISS_KEY = 'shettar-mobile-promo-dismissed';

type MobileDownloadPromoCardProps = {
  dismissed: boolean;
  onDismiss: () => void;
  onDownload: () => void;
};

export function isMobilePromoDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(DISMISS_KEY) === '1';
}

export function dismissMobilePromo(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(DISMISS_KEY, '1');
}

/** Fixed top-right card encouraging travelers to install the mobile app. */
export default function MobileDownloadPromoCard({
  dismissed,
  onDismiss,
  onDownload,
}: MobileDownloadPromoCardProps) {
  if (dismissed) return null;

  return (
    <div
      className="position-fixed top-0 end-0 m-3 p-3 bg-white border rounded-3 shadow"
      style={{ zIndex: 1060, width: 'min(20rem, calc(100vw - 1.5rem))' }}
      role="status"
      aria-live="polite"
    >
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div className="d-flex align-items-start gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-2 bg-primary bg-opacity-10 text-primary flex-shrink-0"
            style={{ width: 28, height: 28 }}
          >
            <BsPhone size={14} />
          </span>
          <p className="mb-0 fw-semibold lh-sm">Get the Shettar app</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="btn btn-link p-0 text-secondary text-decoration-none lh-1"
          aria-label="Dismiss mobile download promo"
        >
          <BsX size={18} />
        </button>
      </div>

      <p className="mb-0 mt-2 small text-secondary lh-sm">
        Book stays, manage trips, and get updates on the go from your phone.
      </p>

      <div className="d-flex align-items-center justify-content-end gap-2 mt-3">
        <Button variant="link" size="sm" className="text-secondary text-decoration-none px-2" onClick={onDismiss}>
          Later
        </Button>
        <Button variant="primary" size="sm" onClick={onDownload}>
          Download
        </Button>
      </div>
    </div>
  );
}
