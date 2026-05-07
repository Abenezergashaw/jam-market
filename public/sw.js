const CACHE = 'jam-store-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()))

// Required by Chrome for PWA installability
self.addEventListener('fetch', (e) => {
  // Only handle GET requests; skip cross-origin and non-http
  const req = e.request
  if (req.method !== 'GET') return
  if (!req.url.startsWith(self.location.origin)) return
  // Skip API and SW itself
  if (req.url.includes('/api/') || req.url.includes('/sw.js')) return

  e.respondWith(
    fetch(req)
      .then((res) => {
        // Cache successful responses for static assets
        if (res.ok && (req.destination === 'script' || req.destination === 'style' || req.destination === 'image' || req.destination === 'font')) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(req, clone))
        }
        return res
      })
      .catch(() => caches.match(req))
  )
})

self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'Jam Store', {
      body: data.body ?? '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: data.tag ?? 'jam-store',
      renotify: true,
      data: { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
