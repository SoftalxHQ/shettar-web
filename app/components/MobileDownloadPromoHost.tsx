'use client';

import { useEffect, useState } from 'react';
import MobileDownloadPromoCard, {
  dismissMobilePromo,
  isMobilePromoDismissed,
} from '@/app/components/MobileDownloadPromoCard';
import MobileDownloadModal from '@/app/components/MobileDownloadModal';

/** Floating mobile download promo for traveler sign-in/sign-up. */
export default function MobileDownloadPromoHost() {
  const [dismissed, setDismissed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setDismissed(isMobilePromoDismissed());
  }, []);

  return (
    <>
      <MobileDownloadPromoCard
        dismissed={dismissed}
        onDismiss={() => {
          dismissMobilePromo();
          setDismissed(true);
        }}
        onDownload={() => setModalOpen(true)}
      />
      <MobileDownloadModal show={modalOpen} onHide={() => setModalOpen(false)} />
    </>
  );
}
