'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Container,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ListGroup,
  ListGroupItem,
  Navbar,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { BsBell, BsBookmarkCheck, BsCircleHalf, BsGear, BsHeart, BsInfoCircle, BsMoonStars, BsPerson, BsPower, BsSearch, BsStar, BsSun } from 'react-icons/bs';
import AppMenu from './AppMenu';
import LogoBox from './LogoBox';
import { useScrollEvent, useToggle } from '../hooks';

import { useLayoutContext } from '@/app/states';

import avatar1 from '@/public/images/avatar/01.jpg';

import { notificationData } from '@/app/data/hotels';

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

const TopNavBar4 = () => {
  const { scrollY } = useScrollEvent();
  const { isOpen, toggle } = useToggle();
  const { theme, updateTheme } = useLayoutContext();
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  return (
    <div style={{ height: scrollY >= 400 ? headerHeight : 'auto' }}>
      <header
        ref={headerRef}
        className={clsx('navbar-light header-sticky', { 'header-sticky-on': scrollY >= 400 })}
      >
        <Navbar expand="xl">
          <Container>
            <LogoBox />
            <button
              onClick={toggle}
              className="navbar-toggler ms-auto mx-3 p-0 p-sm-2"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarCollapse"
              aria-controls="navbarCollapse"
              aria-expanded={isOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-animation">
                <span />
                <span />
                <span />
              </span>
            </button>

            <AppMenu mobileMenuOpen={isOpen} menuClassName="mx-auto" showExtraPages />

            <ul className="nav flex-row align-items-center list-unstyled">
              <Dropdown className="nav-item ms-2 me-3 ms-md-3">
                <DropdownToggle className="nav-notification btn btn-light p-0 mb-0 flex-centered arrow-none">
                  <BsBell />
                </DropdownToggle>

                <span className="notif-badge animation-blink" />

                <DropdownMenu align="end" className="dropdown-animation dropdown-menu-size-md shadow-lg p-0" renderOnMount>
                  <Card className="bg-transparent">
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

              <Dropdown className="nav-item dropdown" autoClose="outside">
                <DropdownToggle className="avatar avatar-sm p-0 arrow-none mb-0 border-0" id="profileDropdown" role="button">
                  <Image className="avatar-img rounded-2" src={avatar1} alt="avatar" width={40} height={40} />
                </DropdownToggle>
                <DropdownMenu
                  align={'end'}
                  className="dropdown-animation dropdown-menu-end shadow pt-3"
                  aria-labelledby="profileDropdown"
                  renderOnMount
                >
                  <li className="px-3 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="avatar me-3">
                        <Image className="avatar-img rounded-circle shadow" src={avatar1} alt="avatar" width={50} height={50} />
                      </div>
                      <div>
                        <h6 className="h6 mt-2 mt-sm-0">Lori Ferguson</h6>
                        <p className="small m-0">example@gmail.com</p>
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
                    <Link href="/auth/sign-in" className="dropdown-item bg-danger-soft-hover">
                      <BsPower className="fa-fw me-2" />
                      Sign Out
                    </Link>
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
          </Container>
        </Navbar>
      </header>
    </div>
  );
};

export default TopNavBar4;
