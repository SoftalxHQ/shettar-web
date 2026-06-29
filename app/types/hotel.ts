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
  old_price?: number;
  schemes?: string[]; // Added for list view
  is_favorite?: boolean;
  sponsored?: boolean;
  ad_campaign_id?: number | null;
  ad_placement?: string;
  impression_key?: string;
}

export type HotelsGridType = Hotel;
export type HotelsListType = Hotel; // Alias for clarity

export type NotificationType = {
  title: string;
  content?: string;
  time: string;
};

/** Business/hotel payload from GET /api/v1/businesses/:slug */
export type HotelAmenities = Record<string, boolean | undefined>;

export interface HotelReviewComment {
  id: number;
  body: string;
  author_name: string;
  author_role: 'guest' | 'business';
  created_at?: string;
}

export interface HotelReview {
  id: number;
  reviewer: string;
  first_name?: string;
  last_name?: string;
  reviewer_avatar?: string;
  review_count?: number;
  stay_date?: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at?: string;
  verified?: boolean;
  admin_reply?: string | null;
  admin_reply_by?: string | null;
  admin_replied_at?: string | null;
  comments?: HotelReviewComment[];
  likes_count?: number;
  dislikes_count?: number;
  user_vote?: 1 | -1 | null;
}

export interface HotelRatingBucket {
  rating: number;
  count: number;
  percentage: number;
}

export interface HotelDetail extends Hotel {
  description?: string;
  amenities?: HotelAmenities;
  available_room_types?: Record<string, unknown>[];
  reviews?: HotelReview[];
  average_rating?: number | string;
  rating_distribution?: HotelRatingBucket[];
  starting_from?: number | string;
  check_in?: string;
  check_out?: string;
  policy_highlights?: { kind: string; text: string }[];
  policy_bullets?: string[];
  policy_footer?: string | null;
  city?: string;
  state?: string;
  images_url?: string[];
  can_reply_to_reviews?: boolean;
}

export interface RoomTypeBusinessSummary {
  id?: number;
  slug?: string;
  name?: string;
  city?: string;
  state?: string;
  address?: string;
  check_in?: string;
  check_out?: string;
}

export interface RoomTypeDetail {
  id: number;
  slug?: string;
  name: string;
  price?: number;
  images?: Array<string | { id: number; url: string }>;
  images_url?: string[];
  business?: RoomTypeBusinessSummary;
  amenities?: Record<string, boolean>;
  available_rooms?: number;
  other_room_types?: Record<string, unknown>[];
}
