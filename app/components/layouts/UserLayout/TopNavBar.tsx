'use client';

import { AppMenu, LogoBox } from '@/app/components';
import { useScrollEvent, useToggle } from '@/app/hooks';
import { USER_PROFILE_MENU_ITEMS } from '@/app/data/menu-items';
import { useLayoutContext } from '@/app/states';
import clsx from 'clsx';
import {
  Button,
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
  Image,
  ListGroup,
  ListGroupItem,
  Navbar,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { BsBell, BsBookmarkCheck, BsCircleHalf, BsGear, BsHeart, BsInfoCircle, BsLightningCharge, BsMoonStars, BsPerson, BsPower, BsStar, BsSun } from 'react-icons/bs';
import Link from 'next/link';
import { notificationData } from '@/app/data/hotel';

import avatar1 from '@/public/images/avatar/01.jpg';

const themeModes: any[] = [
  {
    icon: BsSun,
    theme: 'light',
    label: 'Light'
  },
  {
    icon: BsMoonStars,
    theme: 'dark',
    label: 'Dark'
  },
  {
    icon: BsCircleHalf,
    theme: 'auto',
    label: 'Auto'
  },
];

const TopNavBar = () => {
  const { theme, updateTheme, account, isAccountLoading, logout } = useLayoutContext();
  const { isOpen, toggle } = useToggle();

  const fullName = account ? `${account.first_name} ${account.last_name}` : 'User';
  const email = account?.email || 'example@gmail.com';
  const avatar = account?.avatar_url || '/images/avatar/01.jpg';

  return (
    <header className="navbar-light header-sticky sticky-top bg-mode border-bottom">
      <Navbar expand="lg">
        <Container>
          <LogoBox />
          <button
            onClick={toggle}
            className="navbar-toggler ms-auto mx-3 me-md-0 p-0 p-sm-2"
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

          <AppMenu mobileMenuOpen={isOpen} menuClassName="mx-auto" />

          <ul className="nav flex-row align-items-center list-unstyled">
            <Dropdown className="nav-item ms-0 ms-md-3">
              <DropdownToggle as={Link} href="#" className="arrow-none nav-link p-0" role="button">
                <BsBell className=" fs-5" />
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
                            <span className="small">{notification.time}</span>
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
            <Dropdown className="nav-item ms-3 dropdown">
              <DropdownToggle as={Link} href="#" className="arrow-none avatar avatar-xs p-0" id="profileDropdown" role="button">
                {account?.avatar_url ? (
                  <Image className="avatar-img rounded-3 border border-primary shadow-sm" src={avatar} alt="avatar" width={24} height={24} />
                ) : (
                  <div className="avatar-img rounded-3 border border-primary bg-primary-soft d-flex align-items-center justify-content-center shadow-sm" style={{ width: 24, height: 24 }}>
                    <span className="text-primary fw-bold" style={{ fontSize: '10px' }}>{account?.first_name?.charAt(0) ?? '?'}</span>
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
                        <Image className="avatar-img rounded-2 border border-2 border-primary shadow" src={avatar} alt="avatar" width={40} height={40} />
                      ) : (
                        <div className="avatar-img rounded-2 border border-2 border-primary bg-primary-soft d-flex align-items-center justify-content-center shadow" style={{ width: 40, height: 40 }}>
                          <span className="text-primary fw-bold">{account?.first_name?.charAt(0) ?? '?'}</span>
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
                    <BsPerson className=" me-2" />
                    My Profile
                  </Link>
                </li>

                <li>
                  <Link href="/user/bookings" className="dropdown-item">
                    <BsBookmarkCheck className=" me-2" />
                    My Bookings
                  </Link>
                </li>

                <li>
                  <Link href="/user/wishlist" className="dropdown-item">
                    <BsHeart className=" me-2" />
                    My Wishlist
                  </Link>
                </li>

                <li>
                  <Link href="/user/reviews" className="dropdown-item">
                    <BsStar className=" me-2" />
                    My Reviews
                  </Link>
                </li>

                <li>
                  <Link href="/user/settings" className="dropdown-item">
                    <BsGear className=" me-2" />
                    Settings
                  </Link>
                </li>

                <li>
                  <Link href="#" className="dropdown-item">
                    <BsInfoCircle className=" me-2" />
                    Help Center
                  </Link>
                </li>

                <li>
                  <button onClick={logout} className="dropdown-item bg-danger-soft-hover text-danger border-0 w-100 text-start">
                    <BsPower className=" me-2" />
                    Sign Out
                  </button>
                </li>

                <DropdownDivider />

                <li>
                  <div className="nav-pills-primary-soft theme-icon-active d-flex justify-content-between align-items-center p-2 pb-0">
                    <span>Mode:</span>
                    {(themeModes ?? []).map((mode, idx) => {
                      const Icon = mode.icon
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
                      )
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

export default TopNavBar;
