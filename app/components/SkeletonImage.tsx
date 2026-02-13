'use client';

import React, { useState, useEffect, useRef } from 'react';
import Skeleton from './Skeleton';

interface SkeletonImageProps {
  src: string;
  alt: string;
  className?: string;
  height?: string | number;
}

const SkeletonImage: React.FC<SkeletonImageProps> = ({ src, alt, className, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div
      className="position-relative w-100 overflow-hidden"
      style={{ height: height || '200px', backgroundColor: '#f3f4f6' }}
    >
      {/* Image in normal flow to maintain slider dimensions */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className} w-100 h-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        style={{
          transition: 'opacity 0.4s ease-in-out',
          objectFit: 'cover',
          display: 'block'
        }}
      />

      {/* Skeleton overlay */}
      {(!isLoaded && !hasError) && (
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
          <Skeleton height="100%" width="100%" />
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light text-muted p-2 text-center" style={{ zIndex: 1 }}>
          <small className="fw-bold">Image Unavailable</small>
        </div>
      )}
    </div>
  );
};

export default SkeletonImage;
