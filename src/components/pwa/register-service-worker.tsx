"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {
            // Ignore unregister failures in development.
          });
        });
      });

      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures should not block the app.
    });
  }, []);

  return null;
}
