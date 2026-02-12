import {
  BsGear,
  BsHeart,
  BsPerson,
  BsTicketPerforated,
  BsTrash,
  BsWallet,
  BsPeople,
} from 'react-icons/bs';
import { type IconType } from 'react-icons';

export type MenuItemType = {
  key: string;
  label: string;
  isTitle?: boolean;
  url?: string;
  target?: string;
  children?: MenuItemType[];
  parentKey?: string;
  icon?: IconType;
};

export const USER_PROFILE_MENU_ITEMS: MenuItemType[] = [
  {
    key: 'acc-user-profile',
    label: 'My Profile',
    url: '/user/profile',
    parentKey: 'acc-user',
    icon: BsPerson,
  },
  {
    key: 'acc-user-bookings',
    label: 'My Bookings',
    url: '/user/bookings',
    parentKey: 'acc-user',
    icon: BsTicketPerforated,
  },
  {
    key: 'acc-user-travelers',
    label: 'Travelers',
    url: '/user/travelers',
    parentKey: 'acc-user',
    icon: BsPeople,
  },
  {
    key: 'acc-user-payment-details',
    label: 'Payment Details',
    url: '/user/payment-details',
    parentKey: 'acc-user',
    icon: BsWallet,
  },
  {
    key: 'acc-user-wishlist',
    label: 'Wishlist',
    url: '/user/wishlist',
    parentKey: 'acc-user',
    icon: BsHeart,
  },
  {
    key: 'acc-user-settings',
    label: 'Settings',
    url: '/user/settings',
    parentKey: 'acc-user',
    icon: BsGear,
  },
  {
    key: 'acc-user-delete',
    label: 'Delete Profile',
    url: '/user/delete-profile',
    parentKey: 'acc-user',
    icon: BsTrash,
  },
];
