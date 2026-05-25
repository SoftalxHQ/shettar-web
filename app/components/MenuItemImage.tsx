'use client';

import { useState } from 'react';
import Skeleton from './Skeleton';

type MenuItemImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function MenuItemImage({ src, alt, className, style }: MenuItemImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = loadedSrc === src;

  return (
    <div className={`position-relative overflow-hidden ${className || ''}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`w-100 h-100 d-block ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ objectFit: 'cover', transition: 'opacity 0.35s ease-in-out' }}
        onLoad={() => setLoadedSrc(src)}
        loading="lazy"
        decoding="async"
      />
      {!loaded && (
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
          <Skeleton height="100%" width="100%" text="Shettar" />
        </div>
      )}
    </div>
  );
}
