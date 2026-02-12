'use client';

import { Card, CardBody, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsPencilSquare } from 'react-icons/bs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';
import clsx from 'clsx';
import { USER_PROFILE_MENU_ITEMS } from '@/app/data/menu-items';

const LeftPanel = () => {
  const pathname = usePathname();
  const menuItems = USER_PROFILE_MENU_ITEMS;

  return (
    <Card className="bg-light w-100">
      <div className="position-absolute top-0 end-0 p-3">
        <OverlayTrigger overlay={<Tooltip>Edit profile</Tooltip>} placement="top">
          <span className="text-dark">
            <BsPencilSquare />
          </span>
        </OverlayTrigger>
      </div>
      <CardBody className="p-3">
        <div className="text-center mb-3">
          <div className="avatar avatar-xl mb-2 flex-centered">
            <Image
              className="avatar-img rounded-circle border border-2 border-white shadow"
              src="/images/avatar/01.jpg"
              alt="avatar"
              width={100}
              height={100}
            />
          </div>
          <h6 className="mb-0 text-dark">Jacqueline Miller</h6>
          <Link href="" className="text-reset text-primary-hover small text-dark">
            hello@gmail.com
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
