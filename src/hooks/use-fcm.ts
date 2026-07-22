"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export function useFcm() {
  const { data: session } = useSession();
  const done = useRef(false);

  useEffect(() => {
    if (!session?.user || done.current) return;

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const senderId = process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!apiKey || !projectId || !senderId || !appId || !vapidKey) return;

    done.current = true;

    (async () => {
      try {
        const { initializeApp } = await import("firebase/app");
        const { getMessaging, getToken } = await import("firebase/messaging");

        const app = initializeApp({ apiKey, projectId, messagingSenderId: senderId, appId });
        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const currentToken = await getToken(messaging, { vapidKey });
        if (!currentToken) return;

        await fetch("/api/notifications/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: currentToken, platform: "web" }),
        });
      } catch {}
    })();
  }, [session]);
}
