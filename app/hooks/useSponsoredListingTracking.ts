'use client';

import { getApiBaseUrl } from '@/app/helpers/businesses';
import { getStoredToken } from '@/app/helpers/auth';
import { getAdTrackingContext, type AdSearchContext } from '@/app/helpers/ad-viewer-context';
import { getAdDeviceContext } from '@/app/helpers/ad-device-context';
import { useCallback, useEffect, useRef } from 'react';

const SESSION_KEY = 'shettar_ad_session';
const ATTRIBUTION_KEY = 'shettar_ad_attribution';
const SENT_KEY = 'shettar_ad_sent_keys';

type TrackingPayload = {
  ad_campaign_id?: number | null;
  business_id: number;
  ad_placement?: string;
  impression_key?: string;
};

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getFingerprint() {
  if (typeof window === 'undefined') return '';
  let fp = localStorage.getItem('shettar_viewer_fp');
  if (!fp) {
    fp = `fp_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('shettar_viewer_fp', fp);
  }
  return fp;
}

function alreadySent(key: string) {
  try {
    const raw = localStorage.getItem(SENT_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    return set.has(key);
  } catch {
    return false;
  }
}

function markSent(key: string) {
  try {
    const raw = localStorage.getItem(SENT_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(key);
    localStorage.setItem(SENT_KEY, JSON.stringify(Array.from(set).slice(-500)));
  } catch {
    /* ignore */
  }
}

function withSearchContext(event: Record<string, unknown>) {
  const ctx = getAdTrackingContext();
  const device = getAdDeviceContext();
  const search_context: AdSearchContext = {
    ...(ctx ?? {}),
    ...device,
  };
  return Object.keys(search_context).length > 0 ? { ...event, search_context } : event;
}

async function flushEvents(events: Record<string, unknown>[]) {
  if (!events.length) return null;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = JSON.stringify({
    session_id: getSessionId(),
    viewer_fingerprint: getFingerprint(),
    events: events.map(withSearchContext),
  });

  const res = await fetch(`${getApiBaseUrl()}/api/v1/ad_events/batch`, {
    method: 'POST',
    headers,
    body,
    keepalive: true,
  });

  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

const queue: Record<string, unknown>[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function enqueue(event: Record<string, unknown>) {
  queue.push(event);
  if (event.event_type === 'impression') {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = null;
    const batch = queue.splice(0, queue.length);
    flushEvents(batch).catch(() => {});
    return;
  }
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    const batch = queue.splice(0, queue.length);
    flushEvents(batch).catch(() => {});
  }, 5000);
}

export function storeAttributionToken(token: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ATTRIBUTION_KEY, token);
}

export function getAttributionToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ATTRIBUTION_KEY);
}

export function useSponsoredListingTracking(payload: TrackingPayload | null) {
  const ref = useRef<HTMLDivElement | null>(null);
  const visibleSince = useRef<number | null>(null);
  const sent = useRef(false);

  const trackClick = useCallback(async () => {
    if (!payload?.ad_campaign_id) return;

    const dedupe = payload.impression_key || `click_${payload.ad_campaign_id}_${payload.business_id}`;
    enqueue({
      event_type: 'click',
      ad_campaign_id: payload.ad_campaign_id,
      business_id: payload.business_id,
      placement: payload.ad_placement || 'homepage_featured',
      dedupe_key: `${dedupe}_click`,
    });

    const data = await flushEvents(queue.splice(0, queue.length));
    const attrToken = data?.attribution_tokens?.[0];
    if (attrToken) storeAttributionToken(attrToken);
  }, [payload]);

  useEffect(() => {
    if (!payload?.ad_campaign_id || !ref.current) return;

    const el = ref.current;
    const dedupeKey =
      payload.impression_key || `imp_${payload.ad_campaign_id}_${payload.business_id}_${payload.ad_placement}`;

    if (alreadySent(dedupeKey) || sent.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.5) {
            if (!visibleSince.current) visibleSince.current = Date.now();
            const dwellMs = visibleSince.current ? Date.now() - visibleSince.current : 0;
            if (visibleSince.current && dwellMs >= 1000 && !sent.current) {
              sent.current = true;
              markSent(dedupeKey);
              enqueue({
                event_type: 'impression',
                ad_campaign_id: payload.ad_campaign_id,
                business_id: payload.business_id,
                placement: payload.ad_placement || 'homepage_featured',
                dedupe_key: dedupeKey,
              });
            }
          } else {
            visibleSince.current = null;
          }
        });
      },
      { threshold: [0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [payload]);

  useEffect(() => {
    const onHide = () => {
      if (queue.length) flushEvents(queue.splice(0, queue.length)).catch(() => {});
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  return { ref, trackClick };
}
