// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the app is not in the foreground.
// File MUST be named firebase-messaging-sw.js and placed at the PUBLIC root.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ── Firebase config is injected at runtime from the main app ──────────────
// These values are intentionally duplicated here because service workers
// cannot access import.meta.env or the React bundle.
const firebaseConfig = {
  apiKey: "AIzaSyAO7s3WIhIT_zlTxLmZmE4ZjYOgHXO5-Ow",
  authDomain: "ravssms-a5c7b.firebaseapp.com",
  projectId: "ravssms-a5c7b",
  storageBucket: "ravssms-a5c7b.firebasestorage.app",
  messagingSenderId: "418513625094",
  appId: "1:418513625094:web:333089421df897174ba387"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background push messages (app is closed or minimized)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] FCM Background message received:', payload);

  const { title, body, icon } = payload.notification || {};
  const notifTitle = title || 'RAVS Smart School';
  const notifOptions = {
    body: body || 'You have a new notification.',
    icon: icon || '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.data?.type || `ravs-${Date.now()}`,
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: false
  };

  return self.registration.showNotification(notifTitle, notifOptions);
});

// Click handler — opens/focuses the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
