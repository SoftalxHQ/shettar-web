export interface Hotel {
  id: number;
  slug?: string;
  name: string;
  address?: string; // Added for list view
  sale?: string;
  images: string[];
  rating: number;
  feature: string[]; // Keep for backward compatibility if needed, or alias to features
  features?: string[]; // Added for list view standard
  price: number;
  schemes?: string[]; // Added for list view
  is_favorite?: boolean;
}

export type HotelsGridType = Hotel;
export type HotelsListType = Hotel; // Alias for clarity

export type NotificationType = {
  title: string;
  content?: string;
  time: string;
};
