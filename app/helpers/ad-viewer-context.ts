import { getApiBaseUrl } from '@/app/helpers/businesses';
import { getStoredToken } from '@/app/helpers/auth';

export type AdViewerContextSource = 'search' | 'recent_search' | 'booking_history' | 'device' | 'none';

export type AdViewerContext = {
  location?: string;
  country?: string;
  state?: string;
  city?: string;
  context_source: AdViewerContextSource;
};

export type AdSearchContext = {
  country?: string;
  state?: string;
  city?: string;
  source?: string;
};

const RECENT_KEY = 'shettar_recent_searches';
const BOOKING_CACHE_KEY = 'shettar_ad_booking_geo';
const DEVICE_OPT_IN_KEY = 'shettar_device_geo_opt_in';
const MAX_RECENT = 5;
const BOOKING_CACHE_MS = 24 * 60 * 60 * 1000;
const DEFAULT_COUNTRY = 'Nigeria';

let trackingContext: AdSearchContext | null = null;

export function parseLocationDisplay(display: string): { country: string; state?: string; city?: string } {
  const parts = display.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { country: DEFAULT_COUNTRY, city: parts[0], state: parts[1] };
  }
  if (parts.length === 1) {
    return { country: DEFAULT_COUNTRY, city: parts[0] };
  }
  return { country: DEFAULT_COUNTRY };
}

export function toSearchContext(ctx: AdViewerContext): AdSearchContext {
  return {
    country: ctx.country,
    state: ctx.state,
    city: ctx.city,
    source: ctx.context_source,
  };
}

export function setAdTrackingContext(ctx: AdSearchContext | null) {
  trackingContext = ctx;
}

export function getAdTrackingContext(): AdSearchContext | null {
  return trackingContext;
}

export function persistRecentSearch(location: string) {
  if (typeof window === 'undefined') return;
  const trimmed = location.trim();
  if (!trimmed) return;

  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [trimmed, ...list.filter((item) => item !== trimmed)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getCachedBookingGeo(): { city?: string; state?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BOOKING_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; city?: string; state?: string };
    if (Date.now() - parsed.at > BOOKING_CACHE_MS) return null;
    if (!parsed.city && !parsed.state) return null;
    return { city: parsed.city, state: parsed.state };
  } catch {
    return null;
  }
}

function cacheBookingGeo(city?: string, state?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOOKING_CACHE_KEY, JSON.stringify({ at: Date.now(), city, state }));
}

async function fetchBookingGeo(token: string): Promise<{ city?: string; state?: string } | null> {
  const cached = getCachedBookingGeo();
  if (cached) return cached;

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/reservations?filter=past&page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const reservations = (data.reservations || data.data || []) as Array<{
      business?: { city?: string; state?: string };
    }>;
    for (const reservation of reservations) {
      const city = reservation.business?.city?.trim();
      const state = reservation.business?.state?.trim();
      if (city || state) {
        cacheBookingGeo(city, state);
        return { city, state };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function isInNigeria(lat: number, lng: number) {
  return lat >= 4 && lat <= 14.5 && lng >= 2.5 && lng <= 15;
}

export function setDeviceGeoOptIn(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEVICE_OPT_IN_KEY, enabled ? 'true' : 'false');
}

export function getDeviceGeoOptIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEVICE_OPT_IN_KEY) === 'true';
}

async function reverseGeocode(lat: number, lng: number): Promise<{ country?: string; state?: string; city?: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const address = data.address || {};
    return {
      country: address.country,
      state: address.state,
      city: address.city || address.town || address.village,
    };
  } catch {
    return null;
  }
}

async function resolveDeviceGeo(): Promise<AdViewerContext | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) return null;
  const optedIn = localStorage.getItem(DEVICE_OPT_IN_KEY);
  if (optedIn !== 'true') return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (!isInNigeria(latitude, longitude)) {
          resolve(null);
          return;
        }
        const place = await reverseGeocode(latitude, longitude);
        if (!place || place.country?.toLowerCase() !== 'nigeria') {
          resolve(null);
          return;
        }
        resolve({
          country: DEFAULT_COUNTRY,
          state: place.state,
          city: place.city,
          context_source: 'device',
        });
      },
      () => resolve(null),
      { timeout: 8000, maximumAge: 600_000 }
    );
  });
}

function contextFromLocation(display: string, source: AdViewerContextSource): AdViewerContext {
  const parsed = parseLocationDisplay(display);
  return {
    location: display,
    country: parsed.country,
    state: parsed.state,
    city: parsed.city,
    context_source: source,
  };
}

export async function resolveAdViewerContext(options: {
  activeLocation?: string | null;
  token?: string | null;
}): Promise<AdViewerContext> {
  const active = options.activeLocation?.trim();
  if (active) {
    const ctx = contextFromLocation(active, 'search');
    setAdTrackingContext(toSearchContext(ctx));
    return ctx;
  }

  const recent = getRecentSearches();
  if (recent[0]) {
    const ctx = contextFromLocation(recent[0], 'recent_search');
    setAdTrackingContext(toSearchContext(ctx));
    return ctx;
  }

  const token = options.token ?? getStoredToken();
  if (token) {
    const booking = await fetchBookingGeo(token);
    if (booking?.city || booking?.state) {
      const display = booking.city && booking.state ? `${booking.city}, ${booking.state}` : booking.city || booking.state || '';
      const ctx: AdViewerContext = {
        location: display || undefined,
        country: DEFAULT_COUNTRY,
        state: booking.state,
        city: booking.city,
        context_source: 'booking_history',
      };
      setAdTrackingContext(toSearchContext(ctx));
      return ctx;
    }
  }

  const device = await resolveDeviceGeo();
  if (device) {
    setAdTrackingContext(toSearchContext(device));
    return device;
  }

  const ctx: AdViewerContext = { context_source: 'none', country: DEFAULT_COUNTRY };
  setAdTrackingContext(null);
  return ctx;
}
