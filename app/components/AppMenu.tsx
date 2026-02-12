'use client';

import Link from 'next/link';
import { Collapse, Dropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'react-bootstrap';
import { BsCloudDownloadFill, BsLifePreserver, BsChevronDown } from 'react-icons/bs';
import { FaEllipsis } from 'react-icons/fa6';
import clsx from 'clsx';

type AppMenuProps = {
  showExtraPages?: boolean;
  mobileMenuOpen: boolean;
  menuClassName?: string;
};

const menuItems = [
  { label: 'Home', url: '/' },
];

export default function AppMenu({ showExtraPages, mobileMenuOpen, menuClassName }: AppMenuProps) {
  return (
    <Collapse in={mobileMenuOpen} className="navbar-collapse">
      <div>
        <ul className={clsx('navbar-nav navbar-nav-scroll mx-auto justify-content-center text-center align-items-center', menuClassName)}>
          {menuItems.map((item, idx) => (
            <li key={idx} className="nav-item">
              <Link href={item.url} className="nav-link">
                {item.label}
              </Link>
            </li>
          ))}

          <Dropdown className="nav-item">
            <DropdownToggle as={Link} href="#" className="nav-link arrow-none" id="companyMenu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Company <BsChevronDown className="small ms-1" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end shadow" renderOnMount>
              <li>
                <Link className="dropdown-item" href="/about">About Us</Link>
              </li>
              <li>
                <Link className="dropdown-item" href="/faq">FAQ</Link>
              </li>
              <li>
                <Link className="dropdown-item" href="/terms">Terms & Conditions</Link>
              </li>
            </DropdownMenu>
          </Dropdown>

          <li className="nav-item">
            <Link className="nav-link" href="/contact">Contact Us</Link>
          </li>
        </ul>
      </div>
    </Collapse>
  );
}
