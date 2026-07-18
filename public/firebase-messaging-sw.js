/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Public Firebase config (shettar-1747f) — must be initialized before getToken() runs.
firebase.initializeApp({
  apiKey: 'AIzaSyDO0251mOBioZ7XZluRXGSteag3-cGS8TI',
  authDomain: 'shettar-1747f.firebaseapp.com',
  projectId: 'shettar-1747f',
  storageBucket: 'shettar-1747f.firebasestorage.app',
  messagingSenderId: '277614124723',
  appId: '1:277614124723:web:030e62c5c885ff9d351ac6',
  measurementId: 'G-79YC7H5V5N',
});

const messaging = firebase.messaging();

const NOTIFICATION_ICON = new URL('/images/icon.png', self.location.origin).href;

messaging.onBackgroundMessage((payload) => {
  const message =
    payload.notification?.body ||
    payload.data?.message ||
    payload.notification?.title ||
    'New notification';
  self.registration.showNotification(message, {
    body: '',
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification?.data || {};
  let route = data.route;
  const source = data.source || '';
  const eventName = data.event || '';

  if (source === 'review_reply' || source === 'review_comment_reply') {
    const businessId = data.business_slug || data.business_unique_id || data.business_id;
    if (businessId) route = `/hotel/${businessId}`;
  } else if (source === 'restaurant_order') {
    const isReceiptEvent = eventName === 'order_created' || eventName === 'order_paid' || !eventName;
    if (isReceiptEvent && data.transaction_id) {
      route = `/user/transactions?receipt=${data.transaction_id}`;
    } else if (data.booking_id) {
      const qs = new URLSearchParams({ tab: 'history' });
      const businessKey = data.business_unique_id || data.business_slug || data.business_id;
      if (businessKey) qs.set('businessId', String(businessKey));
      if (data.reservation_id) qs.set('reservationId', String(data.reservation_id));
      if (data.room_number) qs.set('roomNumber', String(data.room_number));
      const orderId = data.restaurant_order_id || data.order_id;
      if (orderId) qs.set('orderId', String(orderId));
      route = `/user/bookings/${encodeURIComponent(String(data.booking_id))}/room-service?${qs.toString()}`;
    }
  } else if (data.transaction_id) {
    route = `/user/transactions?receipt=${data.transaction_id}`;
  } else if (typeof route === 'string' && route.startsWith('/room-service/')) {
    const match = route.match(/^\/room-service\/([^/?#]+)(\?.*)?$/);
    if (match?.[1]) {
      route = `/user/bookings/${encodeURIComponent(decodeURIComponent(match[1]))}/room-service${match[2] || ''}`;
    }
  } else if (data.booking_id) {
    route = `/user/bookings/${encodeURIComponent(String(data.booking_id))}`;
  } else if (typeof route === 'string') {
    const bookingMatch = route.match(/^\/bookings\/([^/?#]+)/);
    if (bookingMatch?.[1]) {
      route = `/user/bookings/${decodeURIComponent(bookingMatch[1])}`;
    } else if (route === '/(tabs)/bookings' || route === '/bookings') {
      route = '/user/bookings';
    } else if (route === '/transactions' || route.startsWith('/transactions?')) {
      route = route.replace(/^\/transactions/, '/user/transactions');
    }
  }

  const url = route ? new URL(route, self.location.origin).href : self.location.origin;
  event.waitUntil(clients.openWindow(url));
});
