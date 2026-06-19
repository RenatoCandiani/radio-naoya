/* ============================================================
   Service Worker — Rádio Marajá AM 660 PWA
   Estratégia: Cache-first para assets estáticos,
               Network-first para navegação e API.
   ============================================================ */

const CACHE_NAME = 'radio-maraja-v1';

// Assets que queremos cachear no install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
];

// ---- Install: pré-cache dos assets principais ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// ---- Activate: limpa caches antigos ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ---- Fetch: Network-first com fallback para cache ----
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET
  if (event.request.method !== 'GET') return;

  // Ignora streams de áudio (não faz sentido cachear)
  if (
    event.request.url.includes('stream') ||
    event.request.url.includes(':8000') ||
    event.request.url.includes('antena1') ||
    event.request.url.includes('jovempan')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clona e armazena no cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
