import { Hotel, NotificationType } from '../types/hotel';

export const hotels: Hotel[] = [
  {
    id: 1,
    name: 'Courtyard by Marriott New York',
    address: '5855 W Century Blvd, Los Angeles - 90045',
    images: [
      '/images/category/hotel/4by3/04.jpg',
      '/images/category/hotel/4by3/03.jpg',
      '/images/category/hotel/4by3/02.jpg',
      '/images/category/hotel/4by3/01.jpg',
    ],
    price: 750,
    feature: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    features: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    rating: 4.5,
    schemes: ['Free Cancellation till 7 Jan 2022', 'Free Breakfast'],
    sale: '30% Off',
  },
  {
    id: 2,
    name: 'Pride moon Village Resort & Spa',
    address: '31J W Spark Street, California - 24578',
    images: ['/images/category/hotel/4by3/10.jpg'],
    price: 980,
    feature: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    features: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    rating: 4.5,
  },
  {
    id: 3,
    name: 'Royal Beach Resort',
    address: 'Manhattan street, London - 24578',
    images: ['/images/category/hotel/4by3/10.jpg'],
    price: 540,
    feature: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    features: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    rating: 4.5,
    schemes: ['Free Cancellation till 7 Jan 2022'],
  },
  {
    id: 4,
    name: 'Park Plaza Lodge Hotel',
    address: '5855 W Century Blvd, Los Angeles - 9004',
    images: [
      '/images/category/hotel/4by3/08.jpg',
      '/images/category/hotel/4by3/02.jpg',
      '/images/category/hotel/4by3/03.jpg',
      '/images/category/hotel/4by3/07.jpg',
    ],
    price: 845,
    feature: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    features: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    rating: 3.5,
    schemes: ['Free Cancellation till 7 Jan 2022', 'Free Breakfast'],
  },
  {
    id: 5,
    name: 'Beverly Hills Marriott',
    address: '31J W Spark Street, California - 24578',
    images: ['/images/category/hotel/4by3/11.jpg'],
    price: 645,
    feature: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    features: ['Air Conditioning', 'Wifi', 'Kitchen', 'Pool'],
    rating: 4.5,
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
