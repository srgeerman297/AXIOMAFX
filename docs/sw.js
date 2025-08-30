const CACHE_NAME = 'axioma-fx-v2';
const APP_SHELL = [
  './','./index.html','./manifest.json',
  './icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/htm@3.1.1/dist/htm.umd.js',
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const fxHosts = ['open.er-api.com','api.exchangerate.host','cdn.jsdelivr.net'];
  if (fxHosts.includes(url.host)) {
    event.respondWith(fetch(event.request).then((resp)=>{
      const clone = resp.clone();
      caches.open(CACHE_NAME).then((cache)=>cache.put(event.request, clone)).catch(()=>{});
      return resp;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached)=>cached || fetch(event.request).then((resp)=>{
    const clone = resp.clone();
    caches.open(CACHE_NAME).then((cache)=>cache.put(event.request, clone)).catch(()=>{});
    return resp;
  })));
});
