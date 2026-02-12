'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Container, Navbar, Nav, Dropdown, DropdownToggle, DropdownMenu, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsChevronDown, BsCircleHalf, BsMoonStars, BsSun } from 'react-icons/bs';
import { useScrollEvent } from '../hooks';
import { useLayoutContext } from '../states';
import clsx from 'clsx';

type ThemeModeType = {
  theme: 'light' | 'dark' | 'auto';
  icon: typeof BsSun;
  label: string;
};

const themeModes: ThemeModeType[] = [
  {
    icon: BsSun,
    theme: 'light',
    label: 'Light',
  },
  {
    icon: BsMoonStars,
    theme: 'dark',
    label: 'Dark',
  },
  {
    icon: BsCircleHalf,
    theme: 'auto',
    label: 'Auto',
  },
];

export default function Header() {
  const { scrollY } = useScrollEvent();
  const { theme, updateTheme } = useLayoutContext();

  return (
    <header className={clsx('navbar-light header-sticky', { 'header-sticky-on': scrollY >= 400 })}>
      <Navbar expand="xl" className="navbar-expand-xl">
        <Container>
          <Link href="/" className="navbar-brand">
            <Image
              src="/images/logo/logo-light.svg"
              alt="logo"
              width={160}
              height={40}
              className="light-mode-item navbar-brand-item"
            />
            <Image
              src="/images/logo/logo.svg"
              alt="logo"
              width={160}
              height={40}
              className="dark-mode-item navbar-brand-item"
            />
          </Link>

          <Navbar.Toggle aria-controls="navbarCollapse" />

          <Navbar.Collapse id="navbarCollapse">
            <Nav className="navbar-nav mx-auto justify-content-center text-center align-items-center">
              <Link href="/" className="nav-link">Home</Link>

              <Dropdown className="nav-item">
                <DropdownToggle as={Link} href="#" className="nav-link arrow-none" id="headerCompanyMenu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
              <Link className="nav-link" href="/contact">Contact Us</Link>
            </Nav>

            <Nav className="navbar-nav align-items-center">
              <Dropdown className="nav-item dropdown ms-3 me-3">
                <DropdownToggle className="nav-link mb-0 flex-centered arrow-none bg-transparent border-0 p-0" id="themeDropdown" role="button">
                  {theme === 'light' ? <BsSun /> : theme === 'dark' ? <BsMoonStars /> : <BsCircleHalf />}
                </DropdownToggle>
                <DropdownMenu
                  align={'end'}
                  className="dropdown-animation dropdown-menu-end shadow pt-3"
                  aria-labelledby="themeDropdown"
                  renderOnMount
                >
                  <li>
                    <div className="nav-pills-primary-soft theme-icon-active d-flex justify-content-between align-items-center p-2 pb-0">
                      <span>Mode:</span>
                      {(themeModes ?? []).map((mode, idx) => {
                        const Icon = mode.icon;
                        return (
                          <OverlayTrigger key={mode.theme + idx} overlay={<Tooltip>{mode.label}</Tooltip>}>
                            <button
                              onClick={() => updateTheme(mode.theme)}
                              type="button"
                              className={clsx('btn btn-link nav-link text-primary-hover mb-0 p-0', { active: theme === mode.theme })}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              data-bs-title={mode.label}
                            >
                              <Icon />
                            </button>
                          </OverlayTrigger>
                        );
                      })}
                    </div>
                  </li>
                </DropdownMenu>
              </Dropdown>

              <Link href="/auth/sign-in" className="btn btn-sm btn-primary mb-0 flex-centered">
                Sign In
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
