'use client';

import { useEffect, useRef, type AnchorHTMLAttributes } from 'react';
import clsx from 'clsx';

import 'glightbox/dist/css/glightbox.min.css';

interface GlightBoxProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  image: string;
  'data-glightbox'?: string;
  'data-gallery'?: string;
}

const GlightBox = ({
  children,
  image,
  'data-glightbox': dataGlightbox,
  'data-gallery': dataGallery,
  ...other
}: GlightBoxProps) => {
  const ref = useRef<HTMLAnchorElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initLightbox = async () => {
      try {
        // Dynamic import ensures the library is only loaded on the client
        const { default: GLightbox } = await import('glightbox');

        if (ref.current && isMounted) {
          // If an instance already exists, destroy it before creating a new one
          if (instanceRef.current) {
            instanceRef.current.destroy();
          }

          instanceRef.current = GLightbox({
            openEffect: 'fade',
            closeEffect: 'fade',
            touchNavigation: true,
            loop: true,
            autoplayVideos: true,
          });
        }
      } catch (error) {
        console.error('GLightbox initialization failed:', error);
      }
    };

    initLightbox();

    return () => {
      isMounted = false;
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, [image]);

  return (
    <a
      ref={ref}
      href={image}
      {...other}
      className={clsx('glightbox', other.className)}
      data-glightbox={dataGlightbox}
      data-gallery={dataGallery}
    >
      {children}
    </a>
  );
};

export default GlightBox;
