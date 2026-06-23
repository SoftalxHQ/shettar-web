/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

let messaging = null;

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'FIREBASE_CONFIG' || messaging) return;

  firebase.initializeApp(event.data.config);
  messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'Shettar';
    const iconUrl = new URL('/images/logo/logo.svg', self.location.origin).href;
    self.registration.showNotification(title, {
      body: payload.notification?.body || '',
      icon: iconUrl,
      badge: iconUrl,
      data: payload.data || {},
    });
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const route = event.notification?.data?.route;
  const url = route ? new URL(route, self.location.origin).href : self.location.origin;
  event.waitUntil(clients.openWindow(url));
});
