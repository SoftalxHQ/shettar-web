import { type IconType } from 'react-icons';
import { FaCar, FaGlobeAmericas, FaHotel, FaPlane } from 'react-icons/fa';

export type OurStoryType = {
  title: string;
  description: string;
  icon: IconType;
  variant: string;
};

export type TeamType = {
  name: string;
  image: string;
  position: string;
};

export const ourStories: OurStoryType[] = [
  {
    title: 'Hotel Booking',
    description: 'A pleasure exertion if believed provided to. All led out world this music while asked.',
    icon: FaHotel,
    variant: 'bg-orange text-orange',
  },
  {
    title: 'Flight Booking',
    description: 'Warrant private blushes removed an in equally totally Objection do Mr prevailed.',
    icon: FaPlane,
    variant: 'bg-success text-success',
  },
  {
    title: 'Tour Booking',
    description: 'Dashwood does provide stronger is. But discretion frequently sir she instruments.',
    icon: FaGlobeAmericas,
    variant: 'bg-primary text-primary',
  },
  {
    title: 'Cab Booking',
    description: 'Imprudence attachment him his for sympathize. Large above be to means.',
    icon: FaCar,
    variant: 'bg-info text-info',
  },
];

export const ourTeams: TeamType[] = [
  {
    name: 'Larry Lawson',
    position: 'Editor in Chief',
    image: '/images/avatar/01.jpg',
  },
  {
    name: 'Louis Ferguson',
    position: 'Director Graphics',
    image: '/images/avatar/02.jpg',
  },
  {
    name: 'Louis Crawford',
    position: 'Editor, Coverage',
    image: '/images/avatar/08.jpg',
  },
  {
    name: 'Frances Guerrero',
    position: 'CEO, Coverage',
    image: '/images/avatar/09.jpg',
  },
];
