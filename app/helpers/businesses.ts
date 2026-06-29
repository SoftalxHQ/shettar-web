import { ReadonlyURLSearchParams } from 'next/navigation';
import { Hotel } from '@/app/types/hotel';
import { getStoredToken } from '@/app/helpers/auth';
import { withBrowseCredentials } from '@/app/helpers/browse-gate';

export type BusinessListMeta = {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
};

export type FeaturedHotel = Hotel & {
  city?: string;
  state?: string;
};

const RESERVED_QUERY_KEYS = ['page', 'limit', 'featured', 'exclude_featured'];

const BUSINESS_SEARCH_KEYS = [
  'location',
  'start_date',
  'end_date',
  'name',
  'amenities',
  'stars',
  'hotel_types',
  'min_rating',
  'adults',
  'children',
  'rooms',
] as const;

export function hasActiveBusinessSearch(searchParams: ReadonlyURLSearchParams): boolean {
  for (const key of BUSINESS_SEARCH_KEYS) {
    const value = searchParams.get(key);
    if (value != null && value !== '') return true;
  }

  const minPrice = searchParams.get('min_price');
  if (minPrice != null && minPrice !== '' && minPrice !== '0') return true;

  const maxPrice = searchParams.get('max_price');
  if (maxPrice != null && maxPrice !== '' && maxPrice !== '500000') return true;

  const sortBy = searchParams.get('sort_by');
  if (sortBy != null && sortBy !== '' && sortBy !== '-1') return true;

  return false;
}

function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDefaultStayDates(): { start_date: string; end_date: string } {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    start_date: formatDateLocal(today),
    end_date: formatDateLocal(tomorrow),
  };
}

export function ensureFutureStayDatesFromSearchParams(
  searchParams: ReadonlyURLSearchParams
): { start_date: string; end_date: string } {
  const defaults = getDefaultStayDates();
  const today = defaults.start_date;
  let start_date = searchParams.get('start_date') || defaults.start_date;
  let end_date = searchParams.get('end_date') || defaults.end_date;

  if (start_date < today) {
    start_date = defaults.start_date;
    end_date = defaults.end_date;
  } else if (end_date <= start_date) {
    end_date = defaults.end_date;
  }

  return { start_date, end_date };
}

export function getApiBaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = rawUrl && rawUrl !== 'undefined' ? rawUrl : 'http://127.0.0.1:3000';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export function normalizeApiMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  try {
    const api = new URL(getApiBaseUrl());
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      parsed.protocol = api.protocol;
      parsed.hostname = api.hostname;
      parsed.port = api.port;
      return parsed.toString();
    }
  } catch {
    return url;
  }
  return url;
}

export function normalizeApiMediaUrls(urls: string[] | undefined | null): string[] {
  return (urls || []).map(normalizeApiMediaUrl).filter(Boolean);
}

export function mapBusinessToHotel(b: Record<string, unknown>): Hotel {
  const features = Object.entries((b.amenities as Record<string, boolean>) || {})
    .filter(([, value]) => value === true)
    .map(([key]) =>
      key.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    )
    .slice(0, 4);

  const price = parseFloat(String(b.starting_from)) || 0;
  const oldPrice = parseFloat(String(b.old_price)) || 0;
  const sale =
    oldPrice > price ? `${Math.round(((oldPrice - price) / oldPrice) * 100)}% Off` : undefined;

  return {
    id: b.id as number,
    slug: b.slug as string,
    name: b.name as string,
    address: `${b.address}, ${b.city}, ${b.state}`,
    images: normalizeApiMediaUrls(b.images_url as string[]),
    price,
    old_price: oldPrice,
    rating: parseFloat(String(b.average_rating)) || 0,
    feature: features.length > 0 ? features : ['Standard Room'],
    features: features.length > 0 ? features : ['Standard Room'],
    sale,
    is_favorite: Boolean(b.is_favorite),
  };
}

export function mapBusinessToFeaturedHotel(b: Record<string, unknown>): FeaturedHotel {
  return {
    ...mapBusinessToHotel(b),
    city: b.city as string | undefined,
    state: b.state as string | undefined,
  };
}

export function parseListPayload(json: unknown): {
  rows: Record<string, unknown>[];
  meta: BusinessListMeta | null;
} {
  if (Array.isArray(json)) {
    return { rows: json as Record<string, unknown>[], meta: null };
  }
  if (json && typeof json === 'object' && 'businesses' in json) {
    const o = json as {
      businesses: Record<string, unknown>[];
      meta?: BusinessListMeta;
    };
    return { rows: o.businesses || [], meta: o.meta ?? null };
  }
  return { rows: [], meta: null };
}

export function buildBusinessQueryString(
  searchParams: ReadonlyURLSearchParams,
  options: {
    page: number;
    limit: number;
    featured?: boolean;
    excludeFeatured?: boolean;
  }
): string {
  const query = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (RESERVED_QUERY_KEYS.includes(key)) return;
    if (key === 'rooms') {
      query.append('number_of_rooms', value);
    } else if (key !== 'start_date' && key !== 'end_date') {
      query.append(key, value);
    }
  });
  const stayDates = ensureFutureStayDatesFromSearchParams(searchParams);
  query.set('start_date', stayDates.start_date);
  query.set('end_date', stayDates.end_date);
  query.set('page', String(options.page));
  query.set('limit', String(options.limit));
  if (options.featured) {
    query.set('featured', 'true');
  }
  if (options.excludeFeatured) {
    query.set('exclude_featured', 'true');
  }
  return query.toString();
}

export async function fetchBusinesses(options: {
  searchParams: ReadonlyURLSearchParams;
  page?: number;
  limit?: number;
  featured?: boolean;
  excludeFeatured?: boolean;
}): Promise<{ rows: Record<string, unknown>[]; meta: BusinessListMeta | null }> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const qs = buildBusinessQueryString(options.searchParams, {
    page,
    limit,
    featured: options.featured,
    excludeFeatured: options.excludeFeatured,
  });
  const token = getStoredToken();
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/businesses?${qs}`,
    withBrowseCredentials({
      headers: { Authorization: `Bearer ${token}` },
    })
  );
  if (!response.ok) {
    throw new Error('Failed to fetch hotels');
  }
  const json = await response.json();
  return parseListPayload(json);
}
