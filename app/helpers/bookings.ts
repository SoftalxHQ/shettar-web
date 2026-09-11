import { authorizationHeaders, getStoredToken } from '@/app/helpers/auth';
import { getApiBaseUrl } from '@/app/helpers/api-base-url';

export type GuestReservation = {
  id: number;
  booking_id: string;
  start_date: string;
  end_date: string;
  total_amount: string | number;
  cancelled: boolean;
  status?: string;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  can_order_room_service?: boolean;
  has_room_service_orders?: boolean;
  can_view_room_service_orders?: boolean;
  room_number?: string;
  qr_code_url?: string;
  payment_method?: string;
  payment_method_label?: string;
  booked_at?: string;
  created_at?: string;
  guests?: number;
  children?: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  booked_for_someone?: boolean;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  other_first_name?: string | null;
  other_last_name?: string | null;
  other_phone_number?: string | null;
  other_email_address?: string | null;
  emer_first_name?: string | null;
  emer_last_name?: string | null;
  emer_phone_number?: string | null;
  business?: {
    id?: number;
    business_unique_id?: string;
    name: string;
    address: string;
    city?: string;
    state?: string;
    phone_number?: string | null;
    slug?: string | null;
    check_in: string;
    check_out: string;
    restaurant_enabled?: boolean;
  };
  room?: {
    number?: string;
    room_type?: { name: string; price?: number };
  };
};

export async function fetchGuestReservation(bookingId: string): Promise<GuestReservation> {
  const token = getStoredToken();
  const res = await fetch(`${getApiBaseUrl()}/api/v1/reservations/${encodeURIComponent(bookingId)}`, {
    credentials: 'include',
    headers: {
      ...authorizationHeaders(token),
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.[0]?.message || data.error || 'Failed to load booking');
  }
  const raw = data.reservation ?? data.reservations?.[0];
  if (!raw) {
    throw new Error('Failed to load booking');
  }
  if (!raw.business && raw.room?.room_type?.business) {
    return { ...raw, business: raw.room.room_type.business } as GuestReservation;
  }
  return raw as GuestReservation;
}

export function reservationRoomNumber(r: GuestReservation) {
  return r.room_number || r.room?.number || '';
}

export function hotelDetailPath(business?: GuestReservation['business']) {
  const key = business?.slug || business?.business_unique_id || business?.id;
  if (key == null || String(key).trim() === '') return null;
  return `/hotel/${encodeURIComponent(String(key).trim())}`;
}

export function reservationBookedAt(r: GuestReservation) {
  return r.booked_at || r.created_at || null;
}

/** Public business key for URLs — prefer business_unique_id over numeric id. */
export function businessPublicId(business?: GuestReservation['business']) {
  return business?.business_unique_id || (business?.id != null ? String(business.id) : '');
}

export function roomServicePath(
  bookingId: string,
  opts: {
    businessUniqueId?: string;
    reservationId?: number | string;
    roomNumber?: string;
    historyOnly?: boolean;
    tab?: 'order' | 'history';
    orderId?: number | string;
  } = {}
) {
  const qs = new URLSearchParams();
  if (opts.businessUniqueId) qs.set('businessId', opts.businessUniqueId);
  if (opts.reservationId != null && opts.reservationId !== '') {
    qs.set('reservationId', String(opts.reservationId));
  }
  if (opts.roomNumber) qs.set('roomNumber', opts.roomNumber);
  if (opts.historyOnly) qs.set('historyOnly', '1');
  if (opts.tab) qs.set('tab', opts.tab);
  if (opts.orderId != null && opts.orderId !== '') qs.set('orderId', String(opts.orderId));
  const query = qs.toString();
  return `/user/bookings/${encodeURIComponent(bookingId)}/room-service${query ? `?${query}` : ''}`;
}

export function isBookedForSomeone(r: GuestReservation): boolean {
  if (r.booked_for_someone) return true;
  return Boolean(
    r.other_first_name ||
      r.other_last_name ||
      r.other_email_address ||
      r.other_phone_number
  );
}

function splitFullName(full?: string | null): { first: string; last: string } {
  const parts = (full || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export function reservationGuestFirstName(r: GuestReservation): string {
  if (isBookedForSomeone(r) && r.other_first_name?.trim()) return r.other_first_name.trim();
  if (r.first_name?.trim()) return r.first_name.trim();
  if (r.other_first_name?.trim()) return r.other_first_name.trim();
  const fromClient = r.client_name && r.client_name !== 'Unknown' && r.client_name !== 'N/A'
    ? splitFullName(r.client_name).first
    : '';
  return fromClient;
}

export function reservationGuestLastName(r: GuestReservation): string {
  if (isBookedForSomeone(r) && r.other_last_name?.trim()) return r.other_last_name.trim();
  if (r.last_name?.trim()) return r.last_name.trim();
  if (r.other_last_name?.trim()) return r.other_last_name.trim();
  const fromClient = r.client_name && r.client_name !== 'Unknown' && r.client_name !== 'N/A'
    ? splitFullName(r.client_name).last
    : '';
  return fromClient;
}

export function reservationGuestName(r: GuestReservation): string {
  const named = [reservationGuestFirstName(r), reservationGuestLastName(r)].filter(Boolean).join(' ').trim();
  if (named) return named;
  if (r.client_name && r.client_name !== 'Unknown' && r.client_name !== 'N/A') {
    return r.client_name;
  }
  return '';
}

export function reservationGuestEmail(r: GuestReservation): string {
  if (r.client_email && r.client_email !== 'N/A') return r.client_email;
  return r.other_email_address || '';
}

export function reservationGuestPhone(r: GuestReservation): string {
  if (r.client_phone && r.client_phone !== 'N/A') return r.client_phone;
  return r.other_phone_number || r.phone_number || '';
}

export function reservationEmergencyName(r: GuestReservation): string {
  return [r.emer_first_name, r.emer_last_name].filter(Boolean).join(' ').trim();
}

export function reservationStatusLabel(r: GuestReservation): string {
  if (r.cancelled) return 'Cancelled';
  const status = (r.status || '').toLowerCase();
  if (status === 'past') return 'Past';
  if (status === 'active') return 'Active';
  if (status === 'upcoming') return 'Upcoming';
  if (r.checked_out_at) return 'Checked out';
  if (r.checked_in_at) return 'Checked in';
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Confirmed';
}
