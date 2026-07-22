importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID",
  messagingSenderId: "FIREBASE_SENDER_ID",
  appId: "FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const data = payload.data || {};
  self.registration.showNotification(title || "رسالة جديدة", {
    body: body || "",
    icon: "/icon.png",
    badge: "/icon.png",
    data,
  });
});

self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data;
  event.notification.close();
  const tripId = data?.tripId;
  if (tripId) {
    event.waitUntil(clients.openWindow(`/driver/chat/${tripId}`));
  }
});
