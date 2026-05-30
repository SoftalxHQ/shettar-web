'use client';

import { useCallback, useEffect, useState } from 'react';
import { BsGeoAlt } from 'react-icons/bs';
import { getStoredToken } from '@/app/helpers/auth';
import { resolveAdViewerContext, setDeviceGeoOptIn } from '@/app/helpers/ad-viewer-context';
import {
  markAdLocationPromptDismissed,
  notifyAdViewerContextUpdated,
  shouldShowAdLocationPrompt,
} from '@/app/helpers/ad-location-prompt';

type Props = {
  /** Show on homepage before user searches (featured ads) */
  triggerVisible: boolean;
};

export default function EnableLocationForAdsPrompt({ triggerVisible }: Props) {
  const [visible, setVisible] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (!triggerVisible) {
      setVisible(false);
      return;
    }

    let cancelled = false;
    shouldShowAdLocationPrompt().then((show) => {
      if (!cancelled) setVisible(show);
    });

    return () => {
      cancelled = true;
    };
  }, [triggerVisible]);

  const handleEnable = useCallback(async () => {
    setEnabling(true);
    try {
      setDeviceGeoOptIn(true);
      const token = getStoredToken();
      await resolveAdViewerContext({ token });
      setVisible(false);
      notifyAdViewerContextUpdated();
    } catch {
      markAdLocationPromptDismissed();
      setVisible(false);
    } finally {
      setEnabling(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    markAdLocationPromptDismissed();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="container pb-2">
      <div
        className="d-flex align-items-start gap-3 rounded-3 p-3 p-md-4 border"
        style={{ backgroundColor: 'rgba(81, 67, 217, 0.08)', borderColor: 'rgba(81, 67, 217, 0.25)' }}
      >
        <BsGeoAlt className="text-primary flex-shrink-0 mt-1" size={22} />
        <div className="flex-grow-1">
          <h6 className="mb-1 fw-bold">See hotels near you</h6>
          <p className="text-muted small mb-3 mb-md-2">
            Allow location to personalize featured stays using your area, recent searches, and bookings. Optional and
            changeable anytime in your browser settings.
          </p>
          <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3">
            <button
              type="button"
              className="btn btn-primary btn-sm fw-semibold"
              onClick={handleEnable}
              disabled={enabling}
            >
              {enabling ? 'Enabling…' : 'Use my location'}
            </button>
            <button
              type="button"
              className="btn btn-link btn-sm text-muted text-decoration-none p-0"
              onClick={handleDismiss}
              disabled={enabling}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
