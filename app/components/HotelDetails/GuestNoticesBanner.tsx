'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { BsExclamationOctagonFill, BsXLg } from 'react-icons/bs';
import useEmblaCarousel from 'embla-carousel-react';
import { useToggle } from '@/app/hooks';

interface GuestNoticesBannerProps {
  notices?: string[];
}

export default function GuestNoticesBanner({ notices = [] }: GuestNoticesBannerProps) {
  const { isOpen: alertVisible, hide: hideAlert } = useToggle(true);
  const items = notices.map((n) => n.trim()).filter(Boolean);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: items.length > 1,
    dragFree: false,
    containScroll: 'trimSnaps',
  });

  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (items.length <= 1 || !emblaApi) return;
    const timer = setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, 5000);
    return () => clearInterval(timer);
  }, [emblaApi, items.length]);

  if (items.length === 0 || !alertVisible) return null;

  const noticeContent = (text: string) => (
    <div className="items-center d-flex">
      <span className="alert-heading h5 mb-0 me-2">
        <BsExclamationOctagonFill />
      </span>
      <span>
        <strong className="alert-heading me-2">Notice:</strong>
        {text}
      </span>
    </div>
  );

  if (items.length === 1) {
    return (
      <Alert
        variant="danger"
        className="d-flex justify-content-between align-items-center rounded-3 fade show mb-4 mb-0 pe-2 py-3"
        role="alert"
      >
        {noticeContent(items[0])}
        <Button variant="link" onClick={hideAlert} type="button" className="pb-0 pt-1 text-end">
          <BsXLg className="text-reset" />
        </Button>
      </Alert>
    );
  }

  return (
    <Alert
      variant="danger"
      className="rounded-3 fade show mb-4 mb-0 pe-2 py-3"
      role="alert"
    >
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="flex-grow-1 overflow-hidden" ref={emblaRef}>
          <div className="d-flex">
            {items.map((text, idx) => (
              <div key={idx} className="flex-shrink-0 w-100 min-w-0 pe-2">
                {noticeContent(text)}
              </div>
            ))}
          </div>
        </div>
        <Button variant="link" onClick={hideAlert} type="button" className="pb-0 pt-1 text-end flex-shrink-0">
          <BsXLg className="text-reset" />
        </Button>
      </div>
      <div className="d-flex justify-content-center gap-2 mt-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className="btn p-0 border-0 bg-transparent"
            aria-label={`Notice ${idx + 1}`}
            onClick={() => emblaApi?.scrollTo(idx)}
          >
            <span
              className="d-inline-block rounded-circle"
              style={{
                width: 8,
                height: 8,
                backgroundColor: idx === current ? 'var(--bs-danger)' : 'rgba(0,0,0,0.25)',
              }}
            />
          </button>
        ))}
      </div>
    </Alert>
  );
}
