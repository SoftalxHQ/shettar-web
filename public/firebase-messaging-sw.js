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
  const route = event.notification?.data?.route;
  const url = route ? new URL(route, self.location.origin).href : self.location.origin;
  event.waitUntil(clients.openWindow(url));
});
