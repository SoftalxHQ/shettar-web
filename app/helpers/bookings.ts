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
  business?: {
    id?: number;
    business_unique_id?: string;
    name: string;
    address: string;
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
  opts: { businessUniqueId: string; reservationId: number; roomNumber?: string; historyOnly?: boolean }
) {
  const qs = new URLSearchParams({
    businessId: opts.businessUniqueId,
    reservationId: String(opts.reservationId),
  });
  if (opts.roomNumber) qs.set('roomNumber', opts.roomNumber);
  if (opts.historyOnly) qs.set('historyOnly', '1');
  return `/user/bookings/${encodeURIComponent(bookingId)}/room-service?${qs.toString()}`;
}
