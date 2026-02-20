'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Navbar, Nav, Dropdown, DropdownToggle, DropdownMenu, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useScrollEvent } from '../hooks';
import { useLayoutContext } from '../states';
import clsx from 'clsx';
import {
  BsBell,
  BsBookmarkCheck,
  BsChevronDown,
  BsCircleHalf,
  BsGear,
  BsHeart,
  BsInfoCircle,
  BsMoonStars,
  BsPerson,
  BsPower,
  BsStar,
  BsSun
} from 'react-icons/bs';
import { notificationData } from '../data/hotel';
import avatar1 from '@/public/images/avatar/01.jpg';
import { DropdownDivider, ListGroup, ListGroupItem, Card, CardHeader, CardBody, CardFooter } from 'react-bootstrap';

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
  const { theme, updateTheme, isAuthenticated, logout, account, isAccountLoading } = useLayoutContext();
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  const fullName = account ? `${account.first_name} ${account.last_name}` : 'User';
  const email = account?.email || 'example@gmail.com';
  const avatar = account?.avatar_url || '/images/avatar/01.jpg';

  return (
    <div style={{ height: scrollY >= 400 ? headerHeight : 'auto' }}>
      <header
        ref={headerRef}
        className={clsx('navbar-light header-sticky', { 'header-sticky-on': scrollY >= 400 })}
      >
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

                <Dropdown className="nav-item" id="headerCompanyDropdown">
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
                {isAuthenticated ? (
                  <ul className="nav flex-row align-items-center list-unstyled mb-0">
                    <Dropdown className="nav-item ms-2 me-3 ms-md-3" id="headerNotificationDropdown">
                      <DropdownToggle id="notificationDropdown" className="nav-notification btn btn-light p-0 mb-0 flex-centered arrow-none">
                        <BsBell />
                      </DropdownToggle>

                      <span className="notif-badge animation-blink" />

                      <DropdownMenu align="end" className="dropdown-animation dropdown-menu-size-md shadow-lg p-0" renderOnMount>
                        <Card className="bg-transparent border-0">
                          <CardHeader className="bg-transparent d-flex justify-content-between align-items-center border-bottom">
                            <h6 className="m-0">
                              Notifications <span className="badge bg-danger bg-opacity-10 text-danger ms-2">4 new</span>
                            </h6>
                            <Link className="small" href="#">
                              Clear all
                            </Link>
                          </CardHeader>

                          <CardBody className="p-0">
                            <ListGroup className="list-group-flush list-unstyled p-2">
                              {(notificationData ?? []).map((notification, idx) => (
                                <li key={idx}>
                                  <ListGroupItem className={clsx('list-group-item-action rounded border-0 mb-1 p-3', { 'notif-unread': idx === 0 })}>
                                    <h6 className="mb-2">{notification.title}</h6>
                                    {notification.content && <p className="mb-0 small">{notification.content}</p>}
                                    <span>{notification.time}</span>
                                  </ListGroupItem>
                                </li>
                              ))}
                            </ListGroup>
                          </CardBody>

                          <CardFooter className="bg-transparent text-center border-top">
                            <Link href="#" className="btn btn-sm btn-link mb-0 p-0">
                              See all incoming activity
                            </Link>
                          </CardFooter>
                        </Card>
                      </DropdownMenu>
                    </Dropdown>

                    <Dropdown className="nav-item dropdown" autoClose="outside" id="headerProfileDropdown">
                      <DropdownToggle className="avatar avatar-sm p-0 arrow-none mb-0 border-0 shadow-none" id="profileDropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        {account?.avatar_url ? (
                          <Image className="avatar-img rounded-2" src={avatar} alt="avatar" width={40} height={40} />
                        ) : (
                          <div className="avatar-img rounded-2 border border-primary bg-primary-soft d-flex align-items-center justify-content-center shadow-sm" style={{ width: 40, height: 40 }}>
                            <span className="text-primary fw-bold" style={{ fontSize: '14px' }}>{account?.first_name?.charAt(0) ?? '?'}</span>
                          </div>
                        )}
                      </DropdownToggle>
                      <DropdownMenu
                        align={'end'}
                        className="dropdown-animation dropdown-menu-end shadow pt-3"
                        aria-labelledby="profileDropdown"
                        renderOnMount
                      >
                        <li className="px-3 mb-3">
                          <div className="d-flex align-items-center">
                            <div className="avatar me-3 flex-centered">
                              {account?.avatar_url ? (
                                <Image className="avatar-img rounded-circle shadow" src={avatar} alt="avatar" width={50} height={50} />
                              ) : (
                                <div className="avatar-img rounded-circle border border-primary bg-primary-soft d-flex align-items-center justify-content-center shadow-sm" style={{ width: 50, height: 50 }}>
                                  <span className="text-primary fw-bold h5 mb-0">{account?.first_name?.charAt(0) ?? '?'}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h6 className="h6 mt-2 mt-sm-0">{isAccountLoading ? 'Loading...' : fullName}</h6>
                              <p className="small m-0 text-truncate" style={{ maxWidth: '150px' }}>{email}</p>
                            </div>
                          </div>
                        </li>

                        <DropdownDivider />
                        <li>
                          <Link href="/user/profile" className="dropdown-item">
                            <BsPerson className="fa-fw me-2" />
                            My Profile
                          </Link>
                        </li>

                        <li>
                          <Link href="/user/bookings" className="dropdown-item">
                            <BsBookmarkCheck className="fa-fw me-2" />
                            My Bookings
                          </Link>
                        </li>

                        <li>
                          <Link href="/user/wishlist" className="dropdown-item">
                            <BsHeart className="fa-fw me-2" />
                            My Wishlist
                          </Link>
                        </li>

                        <li>
                          <Link href="/user/reviews" className="dropdown-item">
                            <BsStar className="fa-fw me-2" />
                            My Reviews
                          </Link>
                        </li>

                        <li>
                          <Link href="/user/settings" className="dropdown-item">
                            <BsGear className="fa-fw me-2" />
                            Settings
                          </Link>
                        </li>

                        <li>
                          <Link href="#" className="dropdown-item">
                            <BsInfoCircle className="fa-fw me-2" />
                            Help Center
                          </Link>
                        </li>

                        <li>
                          <button
                            onClick={async () => {
                              if (isLoggingOut) return;
                              setIsLoggingOut(true);
                              await logout();
                              router.push('/');
                              setIsLoggingOut(false);
                            }}
                            className="dropdown-item bg-danger-soft-hover text-danger border-0 w-100 text-start d-flex align-items-center"
                            disabled={isLoggingOut}
                          >
                            {isLoggingOut ? (
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            ) : (
                              <BsPower className="fa-fw me-2" />
                            )}
                            {isLoggingOut ? 'Signing out…' : 'Sign Out'}
                          </button>
                        </li>

                        <DropdownDivider />

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
                  </ul>
                ) : (
                  <>
                    <Dropdown className="nav-item dropdown ms-3 me-3" id="headerThemeDropdown">
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
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
    </div >
  );
}
