'use client';

import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className, width, height, variant = 'rect' }) => {
  const style = {
    width: width || '100%',
    height: height || '1rem',
  };

  return (
    <div
      className={clsx(
        'skeleton-pulse bg-gray-200 dark:bg-gray-700',
        variant === 'circle' ? 'rounded-circle' : 'rounded-2',
        className
      )}
      style={style}
    >
      <style jsx>{`
        .skeleton-pulse {
          background-size: 200% 100%;
          animation: pulse 1.5s ease-in-out infinite;
          background-image: linear-gradient(
            90deg,
            #eeeeee 25%,
            #dddddd 50%,
            #eeeeee 75%
          );
        }
        
        [data-bs-theme='dark'] .skeleton-pulse {
          background-image: linear-gradient(
            90deg,
            #2d3748 25%,
            #4a5568 50%,
            #2d3748 75%
          );
        }

        @keyframes pulse {
          0% {
            background-position: 200% 0;
            opacity: 0.6;
          }
          100% {
            background-position: -200% 0;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Skeleton;
