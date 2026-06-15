const CACHE = 'neto-v1'
const SHELL = '/finanzas-amd/'

// APIs que siempre van a la red
const NETWORK_ONLY = ['supabase.co', 'datos.gov.co', 'open.er-api.com']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.add(SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Pasar APIs a la red directamente
  if (NETWORK_ONLY.some(h => url.hostname.includes(h))) return

  // Navegación SPA: red primero, fallback al shell cacheado
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
          return res
        })
        .catch(() => caches.match(SHELL))
    )
    return
  }

  // Assets (JS/CSS/SVG/etc): stale-while-revalidate
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone())
          return res
        }).catch(() => cached)
        return cached || fresh
      })
    )
  )
})
