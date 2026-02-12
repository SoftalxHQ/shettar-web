'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
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
import { BsBell, BsBookmarkCheck, BsCircleHalf, BsGear, BsHeart, BsInfoCircle, BsMoonStars, BsPower, BsSearch, BsSun } from 'react-icons/bs';
import AppMenu from './AppMenu';
import LogoBox from './LogoBox';
import { useScrollEvent, useToggle } from '../hooks';

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
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  return (
    <header className={clsx('navbar-light header-sticky', { 'header-sticky-on': scrollY >= 400 })}>
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

          <ul className="nav flex-row align-items-center list-unstyled ms-xl-auto">
            <Dropdown className="nav-item nav-search d-none d-sm-block">
              <DropdownToggle as={Link} href="#" className="arrow-none nav-notification btn btn-light mb-0 p-0">
                <BsSearch />
              </DropdownToggle>
              <DropdownMenu className="dropdown-animation dropdown-menu-end p-2" aria-labelledby="searchDropdown">
                <div className="nav flex-nowrap align-items-center">
                  <div className="nav-item w-100">
                    <form className="input-group">
                      <input className="form-control border-primary" type="search" placeholder="Search..." aria-label="Search" />
                      <button className="btn btn-primary m-0" type="submit">
                        Search
                      </button>
                    </form>
                  </div>
                </div>
              </DropdownMenu>
            </Dropdown>

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

                <DropdownItem>
                  <BsBookmarkCheck className="fa-fw me-2" />
                  My Bookings
                </DropdownItem>

                <DropdownItem>
                  <BsHeart className="fa-fw me-2" />
                  My Wishlist
                </DropdownItem>

                <DropdownItem>
                  <BsGear className="fa-fw me-2" />
                  Settings
                </DropdownItem>

                <DropdownItem>
                  <BsInfoCircle className="fa-fw me-2" />
                  Help Center
                </DropdownItem>

                <DropdownItem className="bg-danger-soft-hover">
                  <BsPower className="fa-fw me-2" />
                  Sign Out
                </DropdownItem>

                <DropdownDivider />

                <li>
                  <div className="nav-pills-primary-soft theme-icon-active d-flex justify-content-between align-items-center p-2 pb-0">
                    <span>Mode:</span>
                    {(themeModes ?? []).map((mode, idx) => {
                      const Icon = mode.icon;
                      return (
                        <OverlayTrigger key={mode.theme + idx} overlay={<Tooltip>{mode.label}</Tooltip>}>
                          <button
                            onClick={() => setTheme(mode.theme)}
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
  );
};

export default TopNavBar4;
