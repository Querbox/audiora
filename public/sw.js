// Audiora Service Worker – macht die App installierbar und offline-fähig.
// Strategie: Netz zuerst, Cache als Fallback (immer aktuelle Charts, offline trotzdem nutzbar).
const CACHE = 'audiora-v1'
const PRECACHE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // Nur eigene Ressourcen cachen (keine Supabase-/API-Aufrufe)
  if (url.origin !== self.location.origin) return

  e.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(request, copy))
        return res
      })
      .catch(() =>
        caches.match(request).then((hit) => hit || (request.mode === 'navigate' ? caches.match('./') : undefined)),
      ),
  )
})
