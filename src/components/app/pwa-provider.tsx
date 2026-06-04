"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Registers the service worker (production only) and shows a discreet banner
 * when the device goes offline. No offline writes/sync — the app is online-first.
 */
export function PwaProvider() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Register SW only in production to avoid dev caching surprises.
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registro best-effort */
      });
    }

    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-danger/90 px-4 py-2 text-center text-sm font-medium text-white"
    >
      <WifiOff className="h-4 w-4" />
      Sin conexión — algunas acciones no estarán disponibles hasta que vuelvas a
      tener internet.
    </div>
  );
}
