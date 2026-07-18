import { getStoredToken } from '@/app/helpers/auth';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

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
  const res = await fetch(`${API_URL}/api/v1/reservations/${encodeURIComponent(bookingId)}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.[0]?.message || data.error || 'Failed to load booking');
  }
  return data.reservation as GuestReservation;
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

export function reservationGuestName(r: GuestReservation): string {
  if (r.client_name && r.client_name !== 'Unknown' && r.client_name !== 'N/A') {
    return r.client_name;
  }
  const other = [r.other_first_name, r.other_last_name].filter(Boolean).join(' ').trim();
  if (other) return other;
  const self = [r.first_name, r.last_name].filter(Boolean).join(' ').trim();
  return self || '';
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
