'use client';

import { AppMenu, LogoBox } from '@/app/components';
import { useScrollEvent, useToggle } from '@/app/hooks';
import { useLayoutContext } from '@/app/states';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { resendVerification } from '@/app/helpers/auth';
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
import {
  BsBellFill,
  BsBookmarkCheck,
  BsCalendarCheckFill,
  BsCircleHalf,
  BsGear,
  BsHeart,
  BsInfoCircle,
  BsLightningChargeFill,
  BsMoonStars,
  BsPerson,
  BsPower,
  BsStar,
  BsSun,
  BsWalletFill
} from 'react-icons/bs';
import Link from 'next/link';
import { useNotifications } from '@/app/context/NotificationContext';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + "y ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + "mo ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + "d ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + "h ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + "m ago";
  return "just now";
}

function getNotificationIcon(title: string, message: string) {
  const content = (title + ' ' + message).toLowerCase();
  if (content.includes('booking')) return { icon: BsCalendarCheckFill, color: 'text-success', bg: 'bg-success' };
  if (content.includes('wallet') || content.includes('payment') || content.includes('funded')) return { icon: BsWalletFill, color: 'text-primary', bg: 'bg-primary' };
  if (content.includes('airtime') || content.includes('data')) return { icon: BsLightningChargeFill, color: 'text-warning', bg: 'bg-warning' };
  return { icon: BsBellFill, color: 'text-info', bg: 'bg-info' };
}

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

export default function Header() {
  const { theme, updateTheme, account, isAccountLoading, logout, isAuthenticated } = useLayoutContext();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { isOpen, toggle } = useToggle();
  const { scrollY } = useScrollEvent();
  const headerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isSendingCode, setIsSendingCode] = useState(false);

  const handleVerifyClick = async () => {
    if (!account?.email) return;
    setIsSendingCode(true);
    const toastId = toast.loading('Sending verification code...');
    try {
      const result = await resendVerification(account.email);
      if (result.ok) {
        toast.success('Verification code sent! Please check your email.', { id: toastId });
        router.push(`/auth/verify-email?email=${encodeURIComponent(account.email)}`);
      } else {
        toast.error(result.message || 'Failed to send verification code.', { id: toastId });
      }
    } catch (error) {
      toast.error('An error occurred while sending the code.', { id: toastId });
    } finally {
      setIsSendingCode(false);
    }
  };

  const fullName = account ? `${account.first_name} ${account.last_name}` : 'User';
  const email = account?.email || '';
  const avatar = account?.avatar_url || '/images/avatar/01.jpg';

  return (
    <div ref={headerRef}>
      {isAuthenticated && account && !account.email_verified && (
        <div className="bg-warning bg-opacity-10 border-bottom border-warning text-dark text-center py-2 px-3 small">
          <BsInfoCircle className="me-2 text-warning mb-1" />
          Your email address has not been verified.{' '}
          <button
            onClick={handleVerifyClick}
            disabled={isSendingCode}
            className="btn btn-link p-0 text-primary fw-bold text-decoration-underline ms-1 mb-1 align-baseline"
          >
            {isSendingCode ? 'Sending...' : 'Verify Now'}
          </button>
        </div>
      )}
      <header
        ref={headerRef}
        className={clsx('navbar-light header-sticky bg-mode border-bottom mb-3', { 'header-sticky-on': scrollY >= 400 })}
      >
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
              <Dropdown className="nav-item ms-3 dropdown" id="themeMenu">
                <DropdownToggle
                  as="button"
                  className="arrow-none nav-link p-0 btn btn-link border-0 bg-transparent"
                  id="themeDropdown"
                  role="button"
                >
                  {theme === 'light' ? <BsSun className="fs-5" /> : theme === 'dark' ? <BsMoonStars className="fs-5" /> : <BsCircleHalf className="fs-5" />}
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
                        const Icon = mode.icon
                        return (
                          <OverlayTrigger key={mode.theme + idx} overlay={<Tooltip>{mode.label}</Tooltip>}>
                            <button
                              onClick={() => updateTheme(mode.theme)}
                              type="button"
                              className={clsx('btn btn-link nav-link text-primary-hover mb-0 p-0', { active: theme === mode.theme })}
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

              {isAuthenticated ? (
                <>
                  <Dropdown className="nav-item ms-3" id="notificationMenu">
                    <DropdownToggle
                      as="button"
                      className="arrow-none nav-link p-0 position-relative btn btn-link border-0 bg-transparent"
                      id="notificationDropdown"
                      role="button"
                    >
                      <BsBellFill className="fs-5" />
                      {unreadCount > 0 && <span className="notif-badge animation-blink" />}
                    </DropdownToggle>

                    <DropdownMenu align="end" className="dropdown-animation dropdown-menu-size-md shadow-lg p-0" renderOnMount>
                      <Card className="bg-transparent border-0">
                        <CardHeader className="bg-transparent d-flex justify-content-between align-items-center border-bottom">
                          <h6 className="m-0">
                            Notifications {unreadCount > 0 && <span className="badge bg-danger bg-opacity-10 text-danger ms-2">{unreadCount} new</span>}
                          </h6>
                          <button
                            className="btn btn-link link-primary p-0 small"
                            onClick={() => markAsRead('all')}
                            disabled={notifications.length === 0}
                          >
                            Mark all as read
                          </button>
                        </CardHeader>

                        <CardBody className="p-0">
                          <ListGroup className="list-group-flush list-unstyled p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {notifications.length > 0 ? (
                              notifications.map((notification) => (
                                <li key={notification.id}>
                                  <ListGroupItem
                                    className={clsx('list-group-item-action rounded border-0 mb-1 p-3', { 'notif-unread': !notification.read_at })}
                                    onClick={() => !notification.read_at && markAsRead(notification.id)}
                                  >
                                    <div className="d-flex align-items-start">
                                      {(() => {
                                        const { icon: Icon, color, bg } = getNotificationIcon(notification.title, notification.message);
                                        return (
                                          <div className={clsx('avatar avatar-xs me-3 flex-shrink-0')}>
                                            <div className={clsx('avatar-img rounded-circle d-flex align-items-center justify-content-center', bg, 'bg-opacity-15', color)}>
                                              <Icon size={16} />
                                            </div>
                                          </div>
                                        );
                                      })()}
                                      <div className="flex-grow-1">
                                        <h6 className="mb-1 small">{notification.title}</h6>
                                        {notification.message && <p className="mb-0 small text-truncate" style={{ maxWidth: '200px' }}>{notification.message}</p>}
                                        <span className="small text-muted">{timeAgo(notification.created_at)}</span>
                                      </div>
                                    </div>
                                  </ListGroupItem>
                                </li>
                              ))
                            ) : (
                              <li className="p-4 text-center">
                                <p className="mb-0 text-muted small">No notifications yet</p>
                              </li>
                            )}
                          </ListGroup>
                        </CardBody>

                        <CardFooter className="bg-transparent text-center border-top">
                          <Link href="/user/notifications" className="btn btn-sm btn-link mb-0 p-0">
                            See all activity
                          </Link>
                        </CardFooter>
                      </Card>
                    </DropdownMenu>
                  </Dropdown>

                  <Dropdown className="nav-item ms-3 dropdown" id="profileMenu">
                    <DropdownToggle
                      as="button"
                      className="arrow-none avatar avatar-xs p-0 btn btn-link border-0 bg-transparent"
                      id="profileDropdown"
                      role="button"
                    >
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
                          <BsPerson className="me-2" />
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link href="/user/bookings" className="dropdown-item">
                          <BsBookmarkCheck className="me-2" />
                          My Bookings
                        </Link>
                      </li>
                      <li>
                        <Link href="/user/wishlist" className="dropdown-item">
                          <BsHeart className="me-2" />
                          My Wishlist
                        </Link>
                      </li>
                      <li>
                        <Link href="/user/reviews" className="dropdown-item">
                          <BsStar className="me-2" />
                          My Reviews
                        </Link>
                      </li>
                      <li>
                        <Link href="/user/settings" className="dropdown-item">
                          <BsGear className="me-2" />
                          Settings
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="dropdown-item">
                          <BsInfoCircle className="me-2" />
                          Help Center
                        </Link>
                      </li>
                      <li>
                        <button onClick={logout} className="dropdown-item bg-danger-soft-hover text-danger border-0 w-100 text-start">
                          <BsPower className="me-2" />
                          Sign Out
                        </button>
                      </li>
                    </DropdownMenu>
                  </Dropdown>
                </>
              ) : (
                <li className="nav-item ms-3">
                  <Link href="/auth/sign-in" className="btn btn-sm btn-primary mb-0">
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </Container>
        </Navbar>
      </header>
    </div>
  );
}
