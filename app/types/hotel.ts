export interface Hotel {
  id: number;
  name: string;
  sale?: string;
  images: string[];
  rating: number;
  feature: string[];
  price: number;
}

export type HotelsGridType = Hotel;

export type NotificationType = {
  title: string;
  content?: string;
  time: string;
};
