const CACHE_NAME = "gramsense-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/service-worker.js",
];

// Install event: cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn("[Service Worker] Cache addAll failed (some assets may not exist yet):", err);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  clients.claim();
});

// Fetch event: cache-first strategy with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip cross-origin and non-GET requests
  if (request.method !== "GET" || request.url.includes("chrome-extension")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        console.log("[Service Worker] Serving from cache:", request.url);
        return response;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback: try to serve cached version
          return caches.match("/index.html").then((response) => {
            if (response) {
              console.log("[Service Worker] Offline: serving fallback page");
              return response;
            }
            throw new Error("Offline and no cache available");
          });
        });
    })
  );
});

// Background Sync event (for future use with queue flush)
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync triggered:", event.tag);

  if (event.tag === "sync-reports") {
    event.waitUntil(
      // Notify the app to perform sync
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "PERFORM_SYNC",
            timestamp: Date.now(),
          });
        });
      })
    );
  }
});

// Periodic Sync event (for future use)
if ("periodicSync" in self.registration) {
  self.addEventListener("periodicsync", (event) => {
    console.log("[Service Worker] Periodic sync triggered:", event.tag);

    if (event.tag === "sync-queue") {
      event.waitUntil(
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "PERIODIC_SYNC",
              timestamp: Date.now(),
            });
          });
        })
      );
    }
  });
}

// Message handler for client communication
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
