/* Moto Control — service worker (PWA).
 *
 * Estrategia deliberadamente conservadora por privacidad:
 *  - Navegaciones: network-first; si no hay red, fallback a /offline.
 *    Las páginas /app NUNCA se guardan en caché (solo se muestran online).
 *  - Assets de build (/_next/static, /icons, manifest): cache-first.
 *  - Todo lo demás (datos /app, /app/exports, /app/rentals/.../contract,
 *    Supabase, signed URLs, PDFs, documentos privados): passthrough sin caché.
 *  - Cross-origin (Supabase, Storage, signed URLs): se ignora por completo.
 */
const CACHE = "moto-control-v1";
const PRECACHE = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo GET y mismo origen. Supabase / Storage / signed URLs quedan fuera.
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Navegaciones: red primero, /offline como respaldo. No se cachea /app.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/offline")),
    );
    return;
  }

  // Assets de build no sensibles: cache-first con relleno.
  const isStaticAsset =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest";

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Resto: passthrough sin caché (incluye datos y archivos privados).
});
