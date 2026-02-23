'use client';

import React, { useState, useEffect, useRef } from 'react';
import Skeleton from './Skeleton';

interface SkeletonImageProps {
  src: string;
  alt: string;
  className?: string; // Class for the img tag
  containerClassName?: string; // Class for the wrapper div
  height?: string | number;
  style?: React.CSSProperties;
  objectPosition?: string;
  children?: React.ReactNode;
}

const SkeletonImage: React.FC<SkeletonImageProps> = ({ src, alt, className, containerClassName, height, style, objectPosition, children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset state when source changes
    setIsLoaded(false);
    setHasError(false);

    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div
      className={`position-relative w-100 ${!height ? 'h-100' : ''} overflow-hidden bg-body-tertiary ${containerClassName || ''}`}
      style={{
        ...(height ? { height } : {}),
        ...style
      }}
    >
      {/* Image in normal flow to maintain dimensions if not fixed */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className || ''} w-100 h-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        style={{
          transition: 'opacity 0.4s ease-in-out',
          objectFit: 'cover',
          objectPosition: objectPosition || 'center',
          display: 'block'
        }}
      />

      {/* Children content (overlays, text, etc.) */}
      {children}

      {/* Skeleton overlay */}
      {(!isLoaded && !hasError) && (
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
          <Skeleton height="100%" width="100%" text="Shettar" />
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light-subtle text-muted p-2 text-center" style={{ zIndex: 1 }}>
          <small className="fw-bold">Image Unavailable</small>
        </div>
      )}
    </div>
  );
};

export default SkeletonImage;
