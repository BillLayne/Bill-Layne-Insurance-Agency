// Enhanced Service Worker with Version-based Caching
const CACHE_NAME = 'bill-layne-v2025.01.11.1'; // Update this version when deploying
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.min.css?v=2024.12.13.4',
  '/app.js?v=2024.12.13.2',
  '/lazy-load.min.js?v=2024.12.13.1',
  '/critical-enhanced.css',
  '/critical-styles-mobile.css',
  // Local images
  '/images/bill-layne-insurance-logo.webp',
  // Critical fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap'
];

// Install event - cache critical resources with error handling
self.addEventListener('install', function(event) {
  console.log('📦 Service Worker: Installing version', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Service Worker: Caching static assets');
        // Use Promise.allSettled to handle individual file failures gracefully
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              // Don't let one failed file break the entire service worker
              return Promise.resolve();
            })
          )
        );
      })
      .then(function() {
        console.log('📦 Service Worker: Installation complete');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('📦 Service Worker: Installation failed:', error);
        // Still skip waiting even if some files failed to cache
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('🔄 Service Worker: Activating version', CACHE_NAME);
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('🔄 Service Worker: Activation complete');
      // Ensure the new service worker takes control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip external domains (except fonts)
  if (url.origin !== location.origin && !url.hostname.includes('googleapis.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      // If we have a cached response, use it
      if (cachedResponse) {
        // For versioned assets, serve from cache immediately
        if (url.search.includes('v=') || url.search.includes('dev=')) {
          return cachedResponse;
        }
      }
      
      // Fetch from network
      return fetch(event.request).then(function(networkResponse) {
        // Only cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          
          caches.open(CACHE_NAME).then(function(cache) {
            // Cache versioned assets for longer
            if (url.search.includes('v=')) {
              cache.put(event.request, responseClone);
            }
          });
        }
        
        return networkResponse;
      }).catch(function() {
        // If network fails and we have a cached version, use it
        return cachedResponse;
      });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('📦 Service Worker: Received SKIP_WAITING message');
    self.skipWaiting();
  }
});