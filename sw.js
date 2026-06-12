const CACHE = 'finanzas-amd-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './src/css/main.css',
  './src/data/defaults.js',
  './src/js/config.js',
  './src/js/supabase.js',
  './src/js/storage.js',
  './src/js/calc.js',
  './src/js/ui.js',
  './src/js/chart.js',
  './src/js/annual.js',
  './src/js/app.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
];

// Instala: descarga y cachea todos los archivos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activa: elimina caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: Supabase siempre va a la red; el resto sale del cache
self.addEventListener('fetch', e => {
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
