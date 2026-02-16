/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, type AnchorHTMLAttributes } from 'react';
import clsx from 'clsx';

import 'glightbox/dist/css/glightbox.min.css';

interface GlightBoxProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  image: string;
  'data-glightbox'?: string;
  'data-gallery'?: string;
}

// Global instance to avoid multiple conflicts and support multiple components
let sharedLightbox: any = null;

const GlightBox = ({
  children,
  image,
  'data-glightbox': dataGlightbox,
  'data-gallery': dataGallery,
  ...other
}: GlightBoxProps) => {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initLightbox = async () => {
      try {
        const { default: GLightbox } = await import('glightbox');

        if (isMounted) {
          if (!sharedLightbox) {
            sharedLightbox = GLightbox({
              selector: '.glightbox',
              openEffect: 'fade',
              closeEffect: 'fade',
              touchNavigation: true,
              loop: true,
              autoplayVideos: true,
            });
          } else {
            // Debounce the reload slightly for React renders
            const timeoutId = setTimeout(() => {
              if (sharedLightbox && typeof sharedLightbox.reload === 'function') {
                sharedLightbox.reload();
              }
            }, 50);
            return () => clearTimeout(timeoutId);
          }
        }
      } catch (error) {
        console.error('GLightbox initialization failed:', error);
      }
    };

    initLightbox();

    return () => {
      isMounted = false;
    };
  }, [image, dataGallery]);

  return (
    <a
      ref={ref}
      {...other}
      className={clsx('glightbox cursor-pointer', other.className)}
      data-glightbox={dataGlightbox}
      data-gallery={dataGallery}
      data-href={image}
      data-type="image"
      style={{ cursor: 'pointer', ...other.style }}
    >
      {children}
    </a>
  );
};

export default GlightBox;
