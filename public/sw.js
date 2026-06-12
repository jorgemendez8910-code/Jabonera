// Jabonera Service Worker — cache-first for static assets, network-first for pages
const CACHE = 'jabonera-v1'
const STATIC = ['/mock/dev01.png', '/mock/dev02.png', '/mock/dev03.png', '/mock/dev04.png']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Cache-first for images
  if (request.destination === 'image') {
    e.respondWith(
      caches.match(request).then(cached => cached ?? fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(request, clone))
        return res
      }))
    )
    return
  }

  // Network-first for everything else (pages, API)
  e.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
