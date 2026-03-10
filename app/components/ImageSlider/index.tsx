'use client';

/**
 * ImageSlider — replaces TinySlider for hotel/room image carousels.
 *
 * Built on Embla Carousel v8 which:
 *  - Has zero preloader issues (plain CSS, no JS-injected spinner)
 *  - Never shows a half-slide (containScroll + proper sizing)
 *  - Supports mouse-drag, touch, and arrow-key navigation natively
 *
 * Usage:
 *   <ImageSlider images={[url1, url2]} height="200px" alt="Hotel photo" />
 */

import useEmblaCarousel from 'embla-carousel-react';
import SkeletonImage from '@/app/components/SkeletonImage';
import { useCallback, useEffect, useState } from 'react';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';

interface ImageSliderProps {
  images: string[];
  height?: string;
  alt?: string;
  className?: string;
  /** If true the slider fills the full height of its parent (e.g. list-card side column) */
  fillHeight?: boolean;
}

export function ImageSlider({
  images,
  height = '200px',
  alt = 'Image',
  className = '',
  fillHeight = false,
}: ImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1,
    dragFree: false,
    containScroll: 'trimSnaps',
    watchDrag: images.length > 1,
  });

  const [prevEnabled, setPrevEnabled] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevEnabled(emblaApi.canScrollPrev());
    setNextEnabled(emblaApi.canScrollNext());
    setCurrent(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => { emblaApi.off('select', onSelect); emblaApi.off('reInit', onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const containerStyle: React.CSSProperties = fillHeight
    ? { height: '100%', minHeight: height }
    : { height };

  if (!images || images.length === 0) {
    return (
      <div
        className={`rounded-2 overflow-hidden bg-light d-flex align-items-center justify-content-center ${className}`}
        style={containerStyle}
      >
        <span className="text-secondary small opacity-50">No images</span>
      </div>
    );
  }

  return (
    <div className={`position-relative overflow-hidden rounded-2 ${className}`} style={containerStyle}>
      {/* Embla viewport */}
      <div ref={emblaRef} style={{ height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          {images.map((src, idx) => (
            <div
              key={idx}
              style={{
                flex: '0 0 100%',
                minWidth: 0,
                position: 'relative',
                height: '100%',
              }}
            >
              <SkeletonImage
                src={src}
                alt={`${alt} ${idx + 1}`}
                height="100%"
                style={{ position: 'absolute', inset: 0 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Arrows — only show when there are multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Previous image"
            style={{
              position: 'absolute', left: '10px', top: '50%',
              transform: 'translateY(-50%)', zIndex: 10,
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: prevEnabled || images.length > 1 ? 1 : 0.4,
              transition: 'opacity 0.2s, background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
          >
            <BsArrowLeft size={15} color="#fff" />
          </button>

          <button
            onClick={scrollNext}
            aria-label="Next image"
            style={{
              position: 'absolute', right: '10px', top: '50%',
              transform: 'translateY(-50%)', zIndex: 10,
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: nextEnabled || images.length > 1 ? 1 : 0.4,
              transition: 'opacity 0.2s, background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
          >
            <BsArrowRight size={15} color="#fff" />
          </button>

          {/* Dot indicators */}
          {images.length <= 8 && (
            <div style={{
              position: 'absolute', bottom: '8px', left: 0, right: 0,
              display: 'flex', justifyContent: 'center', gap: '5px', zIndex: 10,
            }}>
              {images.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: idx === current ? '16px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: idx === current ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.25s ease',
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ImageSlider;
