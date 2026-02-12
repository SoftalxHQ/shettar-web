'use client';

import Link from 'next/link';
import { Collapse, Dropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'react-bootstrap';
import { BsCloudDownloadFill, BsLifePreserver } from 'react-icons/bs';
import { FaEllipsis } from 'react-icons/fa6';
import clsx from 'clsx';

type AppMenuProps = {
  showExtraPages?: boolean;
  mobileMenuOpen: boolean;
  menuClassName?: string;
};

const menuItems = [
  { label: 'Home', url: '/' },
  { label: 'Hotels', url: '/hotels' },
  { label: 'Flights', url: '/flights' },
  { label: 'Tours', url: '/tours' },
  { label: 'Cabs', url: '/cabs' },
];

export default function AppMenu({ showExtraPages, mobileMenuOpen, menuClassName }: AppMenuProps) {
  return (
    <Collapse in={mobileMenuOpen} className="navbar-collapse">
      <div>
        <ul className={clsx('navbar-nav navbar-nav-scroll me-auto', menuClassName)}>
          {menuItems.map((item, idx) => (
            <li key={idx} className="nav-item">
              <Link href={item.url} className="nav-link">
                {item.label}
              </Link>
            </li>
          ))}

          {showExtraPages && (
            <Dropdown className="nav-item">
              <DropdownToggle
                as={Link}
                className="nav-link arrow-none"
                href="#"
                id="advanceMenu"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <FaEllipsis />
              </DropdownToggle>
              <DropdownMenu className="min-w-auto" data-bs-popper="none" renderOnMount>
                <DropdownItem href="https://support.stackbros.in">
                  <BsLifePreserver className="text-warning fa-fw bi me-2" />
                  Support
                </DropdownItem>
                <DropdownItem href="https://themes.getbootstrap.com/product/booking-multipurpose-online-booking-theme/" target="_blank">
                  <BsCloudDownloadFill className="text-success fa-fw bi me-2" />
                  Buy Booking!
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </ul>
      </div>
    </Collapse>
  );
}
