const CACHE = 'bodega-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
  // Agrega aquí iconos y cualquier otra librería local si la usas localmente
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  // Estrategia: network-first para API, cache-first para estáticos
  if (req.url.includes('/exec')) {
    e.respondWith(
      fetch(req).then(res=>{
        return res;
      }).catch(()=>caches.match(req))
    );
  } else {
    e.respondWith(
      caches.match(req).then(res=>res || fetch(req).then(r=>{
        const copy = r.clone();
        caches.open(CACHE).then(c=>c.put(req, copy));
        return r;
      }))
    );
  }
});
