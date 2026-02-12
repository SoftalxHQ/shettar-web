export type HotelRoomType = {
  id: number;
  name: string;
  sqfeet: number;
  price: number;
  images: string[];
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

export const roomDetails: HotelRoomType[] = [
  {
    id: 1,
    name: 'Deluxe Pool View with Breakfast',
    images: [
      '/images/category/hotel/4by3/10.jpg',
      '/images/gallery/11.jpg',
      '/images/gallery/15.jpg',
      '/images/gallery/14.jpg',
      '/images/gallery/16.jpg',
    ],
    sqfeet: 315,
    price: 385,
  },
  {
    id: 2,
    name: 'Deluxe Room',
    images: [
      '/images/category/hotel/4by3/11.jpg',
      '/images/gallery/11.jpg',
      '/images/gallery/15.jpg',
      '/images/gallery/14.jpg',
      '/images/gallery/16.jpg',
    ],
    sqfeet: 458,
    price: 485,
  },
];
