// Service Worker для кеширования изображений и статики
const CACHE_NAME = 'nextlevel-cache-v1'
const IMAGE_CACHE = 'nextlevel-images-v1'

// Ресурсы для кеширования при установке
const STATIC_ASSETS = [
  '/',
  '/index.html',
]

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Активация и очистка старых кешей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // НЕ кешируем API запросы (Firebase, Firestore, и т.д.)
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('googleapis.com') ||
      url.pathname.includes('/api/')) {
    // Для API всегда используем сеть
    event.respondWith(fetch(request))
    return
  }

  // Кешируем изображения
  if (request.destination === 'image' || 
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Возвращаем из кеша, но обновляем в фоне
            fetch(request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone())
              }
            }).catch(() => {
              // Игнорируем ошибки сети при фоновом обновлении
            })
            return cachedResponse
          }

          // Если нет в кеше, загружаем из сети
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          }).catch(() => {
            // Возвращаем fallback изображение при ошибке
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f3f4f6" width="200" height="200"/><text x="50%" y="50%" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">Изображение недоступно</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            )
          })
        })
      })
    )
    return
  }

  // Для остальных запросов - сеть в приоритете
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    })
  )
})
