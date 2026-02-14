export type WishCardType = {
  id: number;
  slug: string;
  name: string;
  address: string;
  rating: number;
  price: number;
  image: string;
};

export const wishListCards: WishCardType[] = [
  {
    id: 2,
    slug: 'pride-moon-village-resort-spa',
    name: 'Pride moon Village Resort & Spa',
    address: '31J W Spark Street, California - 24578',
    rating: 4.5,
    price: 980,
    image: '/images/category/hotel/4by3/10.jpg',
  },
  {
    id: 3,
    slug: 'royal-beach-resort',
    name: 'Royal Beach Resort',
    address: 'Manhattan street, London - 24578',
    rating: 4.5,
    price: 540,
    image: '/images/category/hotel/4by3/11.jpg',
  },
];
