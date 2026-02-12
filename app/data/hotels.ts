import { HotelsGridType, NotificationType } from '../types/hotel';

export const hotels: HotelsGridType[] = [
  {
    id: 1,
    name: 'Hotel Baljees Regency',
    sale: '30% Off',
    images: [
      '/images/hotels/09.jpg',
      '/images/hotels/02.jpg',
      '/images/hotels/03.jpg',
      '/images/hotels/01.jpg',
    ],
    rating: 4.5,
    feature: ['Air Conditioning ', 'Wifi', 'Kitchen', 'Pool'],
    price: 750,
  },
  {
    id: 2,
    name: 'Courtyard by Marriott New York',
    images: ['/images/hotels/10.jpg'],
    rating: 4,
    feature: ['Air Conditioning ', 'Wifi', 'Pool', 'Kitchen'],
    price: 1200,
  },
  {
    id: 3,
    name: 'Club Quarters Hotel',
    images: ['/images/hotels/08.jpg'],
    rating: 4.8,
    feature: ['Air Conditioning ', 'Wifi', 'Kitchen', 'Pool'],
    price: 980,
  },
  {
    id: 4,
    name: 'Beverly Hills Marriott',
    images: ['/images/hotels/07.jpg'],
    rating: 4.8,
    feature: ['Air Conditioning ', 'Wifi', 'Kitchen', 'Pool'],
    price: 1400,
  },
  {
    id: 5,
    name: 'Courtyard by Marriott New York',
    images: ['/images/hotels/02.jpg'],
    rating: 4.5,
    feature: ['Air Conditioning ', 'Wifi', 'Kitchen', 'Pool'],
    price: 680,
  },
  {
    id: 6,
    name: 'Park Plaza Lodge Hotel',
    images: ['/images/hotels/05.jpg'],
    rating: 4.4,
    feature: ['Air Conditioning ', 'Wifi', 'Kitchen', 'Pool'],
    price: 740,
  },
  {
    id: 7,
    name: 'Royal Beach Resort',
    images: ['/images/hotels/04.jpg'],
    rating: 4,
    feature: ['Air Conditioning ', 'Wifi', 'Kitchen', 'Pool'],
    price: 570,
  },
  {
    id: 8,
    name: 'Pride moon Village Resort & Spa',
    images: ['/images/hotels/03.jpg'],
    rating: 3.8,
    feature: ['Air Conditioning ', 'Wifi', 'Kitchen', 'Pool'],
    price: 896,
  },
  {
    id: 9,
    name: 'Carina Beach Resort',
    images: ['/images/hotels/01.jpg'],
    rating: 4,
    feature: ['Air Conditioning ', 'Wifi', 'Kitchen', 'Pool'],
    price: 475,
  },
];

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
