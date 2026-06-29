import { getApiBaseUrl, mapBusinessToFeaturedHotel, type FeaturedHotel } from '@/app/helpers/businesses';
import { withBrowseCredentials, handleBrowseClearanceResponse } from '@/app/helpers/browse-gate';
import type { AdViewerContext } from '@/app/helpers/ad-viewer-context';
import type { ReadonlyURLSearchParams } from 'next/navigation';

export const SEARCH_RESULTS_SPONSORED_LIMIT = 2;

export type SponsoredListing = {
  business: Record<string, unknown>;
  sponsored: boolean;
  ad_campaign_id: number | null;
  ad_placement: string;
  tracking: { impression_key: string };
};

export type SponsoredHotel = FeaturedHotel & {
  sponsored?: boolean;
  ad_campaign_id?: number | null;
  ad_placement?: string;
  impression_key?: string;
};

export type SponsoredFetchOptions = {
  placement?: string;
  location?: string;
  country?: string;
  state?: string;
  city?: string;
  context_source?: string;
  limit?: number;
  start_date?: string;
  end_date?: string;
  number_of_rooms?: string;
};

export function searchStayParamsFromSearchParams(
  searchParams: ReadonlyURLSearchParams
): Pick<SponsoredFetchOptions, 'start_date' | 'end_date' | 'number_of_rooms'> {
  const rooms = searchParams.get('rooms');
  return {
    start_date: searchParams.get('start_date') || undefined,
    end_date: searchParams.get('end_date') || undefined,
    number_of_rooms: rooms || undefined,
  };
}

export function viewerContextToFetchParams(ctx: AdViewerContext): SponsoredFetchOptions {
  return {
    location: ctx.location,
    country: ctx.country,
    state: ctx.state,
    city: ctx.city,
    context_source: ctx.context_source,
  };
}

export async function fetchSponsoredListings(options: SponsoredFetchOptions): Promise<SponsoredHotel[]> {
  const params = new URLSearchParams();
  params.set('placement', options.placement || 'homepage_featured');
  if (options.location) params.set('location', options.location);
  if (options.country) params.set('country', options.country);
  if (options.state) params.set('state', options.state);
  if (options.city) params.set('city', options.city);
  if (options.context_source) params.set('context_source', options.context_source);
  if (options.start_date) params.set('start_date', options.start_date);
  if (options.end_date) params.set('end_date', options.end_date);
  if (options.number_of_rooms) params.set('number_of_rooms', options.number_of_rooms);
  const defaultLimit = options.placement === 'search_results' ? SEARCH_RESULTS_SPONSORED_LIMIT : 12;
  params.set('limit', String(options.limit ?? defaultLimit));

  const res = await handleBrowseClearanceResponse(
    await fetch(
      `${getApiBaseUrl()}/api/v1/sponsored_listings?${params}`,
      withBrowseCredentials(),
    ),
  );
  if (!res.ok) throw new Error('Failed to fetch sponsored listings');

  const data = (await res.json()) as { listings: SponsoredListing[] };
  return (data.listings || []).map((row) => {
    const hotel = mapBusinessToFeaturedHotel(row.business);
    return {
      ...hotel,
      sponsored: row.sponsored,
      ad_campaign_id: row.ad_campaign_id,
      ad_placement: row.ad_placement,
      impression_key: row.tracking?.impression_key,
    };
  });
}
