/* eslint-disable no-restricted-globals */

// VKart service worker. Keeps the app installable and usable on a bad connection:
//  - pages: network first; when offline, a page the shopper already opened, else the offline page
//  - /assets/* (hashed build files): cache first, they never change under the same name
//  - images and fonts from our own site or the product CDN: stale-while-revalidate
//  - API calls, sockets and anything that isn't a GET are never touched.
const VERSION = 'vkart-v2';
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const MEDIA = `${VERSION}-media`;
const OFFLINE_URL = '/offline.html';
const MAX_MEDIA = 120;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGES).then((cache) => cache.addAll([OFFLINE_URL, '/icon-192.png', '/manifest.json'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

const isMedia = (request, url) =>
  request.destination === 'image' || request.destination === 'font' || /\.(?:png|jpe?g|webp|svg|woff2?)$/i.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/') || url.pathname.startsWith('/admin')) return;

  // Pages
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) { const copy = response.clone(); caches.open(PAGES).then((c) => c.put(request, copy)); }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/')) || (await caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Hashed build files
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((response) => {
        if (response.ok) { const copy = response.clone(); caches.open(ASSETS).then((c) => c.put(request, copy)); }
        return response;
      }))
    );
    return;
  }

  // Images and fonts
  if (isMedia(request, url)) {
    event.respondWith(
      caches.open(MEDIA).then(async (cache) => {
        const hit = await cache.match(request);
        const network = fetch(request).then((response) => {
          if (response.ok || response.type === 'opaque') { cache.put(request, response.clone()).then(() => trim(MEDIA, MAX_MEDIA)); }
          return response;
        }).catch(() => hit);
        return hit || network;
      })
    );
  }
});
