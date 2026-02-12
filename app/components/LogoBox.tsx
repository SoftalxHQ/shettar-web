'use client';

import Image from 'next/image';
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
      <Image
        className={clsx(!onlyDark && 'light-mode-item', 'navbar-brand-item', imgClassName)}
        src="/images/logo/logo.svg"
        alt="logo"
        width={160}
        height={40}
        style={{ width: 'auto' }}
      />
      {!onlyDark && (
        <Image
          className={clsx('dark-mode-item navbar-brand-item', imgClassName)}
          src="/images/logo/logo-light.svg"
          alt="logo"
          width={160}
          height={40}
          style={{ width: 'auto' }}
        />
      )}
    </NavbarBrand>
  );
}
