'use client';

import Link from 'next/link';
import { NavbarBrand } from 'react-bootstrap';
import clsx from 'clsx';

type LogoBoxType = {
  imgClassName?: string;
  onlyDark?: boolean;
};

export default function LogoBox({ imgClassName, onlyDark }: LogoBoxType) {
  return (
    <NavbarBrand as={Link} href="/">
      {/* 
        Using standard <img> tags for the logo SVGs instead of Next.js <Image> 
        to perfectly integrate with the theme's CSS-driven responsive height 
        (navbar-brand-item class) and avoid aspect ratio calculation glitches.
      */}
      <img
        className={clsx(!onlyDark && 'light-mode-item', 'navbar-brand-item', imgClassName)}
        src="/images/logo/shettar-logo.png"
        alt="logo"
      />
      {!onlyDark && (
        <img
          className={clsx('dark-mode-item navbar-brand-item', imgClassName)}
          src="/images/logo/shettar-logo.png"
          alt="logo"
        />
      )}
    </NavbarBrand>
  );
}
