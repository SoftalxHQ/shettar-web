'use client';
import { useState, useEffect } from 'react';

const useViewPort = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.outerWidth : 0);
  const [height, setHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleWindowResize = () => {
      setWidth(window.outerWidth);
      setHeight(window.innerHeight);
    };

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  return { width, height };
};

export default useViewPort;
