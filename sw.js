// Service Worker mejorado para PWA
const CACHE_NAME = 'calc-chapas-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// 1. INSTALAR - Más robusto
self.addEventListener('install', event => {
  console.log('[SW] Instalando versión v2...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando recursos esenciales');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Todos los recursos cacheados');
        return self.skipWaiting(); // Importante para Chrome
      })
  );
});

// 2. ACTIVAR - Limpiar cachés viejos
self.addEventListener('activate', event => {
  console.log('[SW] Activado y listo');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Borrar cachés viejos
          if (cache !== CACHE_NAME) {
            console.log('[SW] Borrando cache viejo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  
  return self.clients.claim(); // Importante para Chrome
});

// 3. FETCH - Mejor manejo de peticiones
self.addEventListener('fetch', event => {
  // Solo cachear GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en cache, devolverlo
        if (response) {
          return response;
        }
        
        // Si no está, hacer fetch
        return fetch(event.request)
          .then(response => {
            // Verificar respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar para cachear
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('[SW] Fetch falló:', error);
            // Podrías devolver una página offline aquí
          });
      })
  );
});

// 4. MENSAJES (para debug)
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
