import { IconType } from 'react-icons';
import { BsStarFill, BsStarHalf, BsStar } from 'react-icons/bs';

export type ReviewType = {
  id: number;
  hotelName: string;
  hotelImage: string;
  rating: number;
  date: string;
  content: string;
  stayDate: string;
};

export const reviewsData: ReviewType[] = [
  {
    id: 1,
    hotelName: 'Courtyard by Marriott New York',
    hotelImage: '/images/category/hotel/4by3/01.jpg',
    rating: 4.5,
    date: 'Jan 25, 2026',
    stayDate: 'Stayed in Dec 2025',
    content: 'The location was perfect, right in the heart of the city. The staff was incredibly helpful and the room was spotless. I will definitely be coming back!'
  },
  {
    id: 2,
    hotelName: 'Pride Moon Village Resort & Spa',
    hotelImage: '/images/category/hotel/4by3/02.jpg',
    rating: 5,
    date: 'Dec 10, 2025',
    stayDate: 'Stayed in Nov 2025',
    content: 'Absolute paradise! The spa treatments were world-class and the private beach was so peaceful. The breakfast buffet had an amazing variety.'
  },
  {
    id: 3,
    hotelName: 'The Landmark Bangkok',
    hotelImage: '/images/category/hotel/4by3/03.jpg',
    rating: 3.5,
    date: 'Oct 05, 2025',
    stayDate: 'Stayed in Sept 2025',
    content: 'Good hotel with great city views. However, the elevator wait times were a bit long during peak hours. Room service was very fast though.'
  }
];
