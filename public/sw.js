const CACHE_NAME = "bebasthapan-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // Add other critical assets here
];

// Install Event
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Fetch Event (Cache-first strategy)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedRes) => cachedRes || fetch(e.request))
  );
});

// Activate Event (Clean old caches)
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});
