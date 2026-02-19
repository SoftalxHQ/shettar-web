'use client';

import { Card, CardBody, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsPencilSquare } from 'react-icons/bs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';
import clsx from 'clsx';
import { USER_PROFILE_MENU_ITEMS } from '@/app/data/menu-items';
import { useLayoutContext } from '@/app/states';

const LeftPanel = () => {
  const pathname = usePathname();
  const { account, isAccountLoading } = useLayoutContext();
  const menuItems: any[] = USER_PROFILE_MENU_ITEMS;

  const fullName = account ? `${account.first_name} ${account.last_name}` : 'User';
  const email = account?.email || '';
  const avatar = account?.avatar_url || '/images/avatar/01.jpg';

  return (
    <Card className="bg-light w-100">
      <CardBody className="p-3">
        <div className="text-center mb-3">
          <div className="avatar avatar-xl mb-3 flex-centered">
            {account?.avatar_url ? (
              <Image
                className="avatar-img rounded-circle border border-2 border-primary shadow"
                src={avatar}
                alt="avatar"
                width={100}
                height={100}
              />
            ) : (
              <div
                className="avatar-img rounded-circle border border-2 border-primary shadow bg-primary-soft d-flex align-items-center justify-content-center"
                style={{ width: 100, height: 100 }}
              >
                <span className="h3 text-primary mb-0">
                  {account?.first_name?.charAt(0) ?? '?'}
                </span>
              </div>
            )}
          </div>
          <h6 className="mb-0">{isAccountLoading ? 'Loading...' : fullName}</h6>
          <Link href="/user/profile" className="text-reset text-primary-hover small">
            {email}
          </Link>
          <hr />
        </div>
        <ul className="nav nav-pills-primary-soft flex-column">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const activeItem = item.url === pathname;
            return (
              item.url &&
              Icon && (
                <li key={idx} className="nav-item">
                  <Link
                    className={clsx('nav-link items-center d-flex', { active: activeItem })}
                    href={item.url}
                  >
                    <Icon className=" fa-fw me-2" />
                    {item.label}
                  </Link>
                </li>
              )
            );
          })}
          <li role="button" className="nav-item">
            <Link className="nav-link text-danger bg-danger-soft-hover d-flex align-items-center" href="/auth/sign-in">
              <FaSignOutAlt className="me-2" />
              Sign Out
            </Link>
          </li>
        </ul>
      </CardBody>
    </Card>
  );
};

export default LeftPanel;
