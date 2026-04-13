const CACHE = 'gym-tracker-v1'
const PRECACHE = ['/', '/index.html']

// Install: pre-cache shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Fetch strategy:
// - Supabase API calls → network-first (no cache)
// - Everything else  → cache-first with network fallback
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Never cache Supabase requests
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(fetch(e.request))
    return
  }

  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response
          }
          const toCache = response.clone()
          caches.open(CACHE).then(c => c.put(e.request, toCache))
          return response
        })
        .catch(() => caches.match('/index.html')) // Offline fallback
    })
  )
})
