import { getApiBaseUrl, mapBusinessToFeaturedHotel, type FeaturedHotel } from '@/app/helpers/businesses';
import type { AdViewerContext } from '@/app/helpers/ad-viewer-context';

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
};

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
  params.set('limit', String(options.limit || 12));

  const res = await fetch(`${getApiBaseUrl()}/api/v1/sponsored_listings?${params}`);
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
