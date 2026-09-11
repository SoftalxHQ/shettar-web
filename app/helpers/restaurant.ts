import { authorizationHeaders, getStoredToken } from '@/app/helpers/auth';
import { getApiBaseUrl } from '@/app/helpers/api-base-url';

export type GuestMenuCategory = {
  id: number;
  name: string;
  position: number;
  items: GuestMenuItem[];
};

export type GuestMenuItem = {
  id: number;
  restaurant_menu_category_id?: number;
  name: string;
  description?: string | null;
  price: number;
  available: boolean;
  image_url?: string | null;
};

export type GuestRestaurantOrder = {
  id: number;
  order_number?: string;
  status: string;
  payment_status?: string;
  subtotal: number;
  room_number?: string | null;
  items: { id: number; name: string; quantity: number; line_total: number }[];
  created_at: string;
};

export function upsertGuestOrder(list: GuestRestaurantOrder[], incoming: GuestRestaurantOrder) {
  const index = list.findIndex((o) => o.id === incoming.id);
  if (index >= 0) {
    const next = [...list];
    next[index] = incoming;
    return next;
  }
  return [incoming, ...list];
}

function authHeaders() {
  return {
    ...authorizationHeaders(getStoredToken()),
    'Content-Type': 'application/json',
  };
}

function businessPathKey(businessId: string | number) {
  return encodeURIComponent(String(businessId));
}

export async function fetchGuestMenu(businessId: string | number) {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/businesses/${businessPathKey(businessId)}/restaurant/menu`, {
    credentials: 'include',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load menu');
  return data.categories as GuestMenuCategory[];
}

export async function fetchGuestOrders(businessId: string | number, reservationId: number) {
  const res = await fetch(
    `${getApiBaseUrl()}/api/v1/businesses/${businessPathKey(businessId)}/restaurant/orders?reservation_id=${reservationId}`,
    { credentials: 'include', headers: authHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load orders');
  return data.orders as GuestRestaurantOrder[];
}

export async function createGuestOrder(
  businessId: string | number,
  reservationId: number,
  payload: {
    notes?: string;
    payment_method?: 'wallet' | 'card' | 'offline';
    paystack_reference?: string;
    items: { menu_item_id: number; quantity: number }[];
  }
) {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/businesses/${businessPathKey(businessId)}/restaurant/orders`, {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(),
    body: JSON.stringify({
      reservation_id: reservationId,
      order: {
        reservation_id: reservationId,
        notes: payload.notes || null,
        payment_method: payload.payment_method || 'offline',
        paystack_reference: payload.paystack_reference || null,
        items: payload.items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        })),
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error ||
        (Array.isArray(data.errors) ? data.errors.join(', ') : data.errors) ||
        'Failed to place order'
    );
  }
  return data.order as GuestRestaurantOrder;
}
