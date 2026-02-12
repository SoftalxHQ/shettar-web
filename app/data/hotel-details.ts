import { FaBiking, FaConciergeBell } from 'react-icons/fa';
import { FaCreditCard } from 'react-icons/fa6';

export type HotelsRoomType = {
  id: number;
  name: string;
  sale?: string;
  images: string[];
  features: string[];
  price: number;
  schemes?: string[];
};

export type NotificationType = {
  title: string;
  content?: string;
  time: string;
};

export const notificationData: NotificationType[] = [
  {
    title: 'New! Booking flights from New York ✈️',
    content: 'Find the flexible ticket on flights around the world. Start searching today',
    time: '05 Feb 2024',
  },
  {
    title: 'Sunshine saving are here 🌞 save 30% or more on a stay',
    time: '24 Aug 2024',
  },
];

const hotelRooms: HotelsRoomType[] = [
  {
    id: 1,
    name: 'Luxury Room with Balcony',
    images: ['/images/category/hotel/4by3/04.jpg', '/images/category/hotel/4by3/03.jpg', '/images/category/hotel/4by3/02.jpg', '/images/category/hotel/4by3/01.jpg'],
    price: 750,
    features: ['Air Conditioning', 'Wifi', 'Kitchen', 'pool'],
    schemes: ['Free Cancellation till 7 Jan 2022', 'Free Breakfast'],
    sale: '30% Off',
  },
  {
    id: 2,
    name: 'Pride moon Village Resort & Spa',
    images: ['/images/category/hotel/4by3/04.jpg', '/images/category/hotel/4by3/03.jpg', '/images/category/hotel/4by3/02.jpg', '/images/category/hotel/4by3/01.jpg'],
    price: 980,
    sale: '15% Off',
    features: ['Air Conditioning', 'Wifi', 'Kitchen', 'pool'],
  },
];

const amenities = [
  {
    label: 'Activities',
    name: ['Swimming pool', 'Spa', "Kids' play area", 'Gym'],
    icon: FaBiking,
  },
  {
    label: 'Payment Method',
    name: ['Credit card (Visa, Master card)', 'Cash', 'Debit Card'],
    icon: FaCreditCard,
  },
  {
    label: 'Services',
    name: [
      'Dry cleaning',
      'Room Service',
      'Special service',
      'Waiting Area',
      'Secrete smoking area',
      'Concierge',
      'Laundry facilities',
      'Ironing Service',
      'Lift',
    ],
    icon: FaConciergeBell,
  },
];

export { amenities, hotelRooms };
