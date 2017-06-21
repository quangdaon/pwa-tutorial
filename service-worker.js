/**
 * Created by QuangdaoN on 5/31/2017.
 */

// Caching

var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-step-06011043';
var filesToCache = [
	'/',
	'/index.html',
	'/scripts/app.js',
	'/styles/inline.css',
	'/images/clear.png',
	'/images/cloudy-scattered-showers.png',
	'/images/cloudy.png',
	'/images/fog.png',
	'/images/ic_add_white_24px.svg',
	'/images/ic_refresh_white_24px.svg',
	'/images/partly-cloudy.png',
	'/images/rain.png',
	'/images/scattered-showers.png',
	'/images/sleet.png',
	'/images/snow.png',
	'/images/thunderstorm.png',
	'/images/wind.png'
];

self.addEventListener('install', function (e) {
	console.log('[ServiceWorker] Install');
	e.waitUntil(
		caches.open(cacheName).then(function (cache) {
			console.log('[ServiceWorker] Caching app shell');
			return cache.addAll(filesToCache);
		})
	)
});

self.addEventListener('activate', function (e) {
	console.log('[ServiceWorker] Activate');
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if(key !== cacheName && key !== dataCacheName) {
					console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
			}));
		})
	);
	return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
	console.log('[ServiceWorker] Fetch', e.request.url);
	var dataUrl = 'https://query.yahooapis.com/v1/public/yql';

	if(e.request.url.indexOf(dataUrl) > -1) {
		e.respondWith(
			caches.open(dataCacheName).then(function(cache) {
				return fetch(e.request).then(function(response) {
					cache.put(e.request.url, response.clone());
					return response;
				});
			})
		);
	} else {
		e.respondWith(
			caches.match(e.request).then(function(response) {
				return response || fetch(e.request);
			})
		)
	}
});

// Push Notifications

self.addEventListener('push', function(event) {
	console.log('[Service Worker] Push Received.');
	console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

	const title = 'Weather PWA';
	const options = {
		body: event.data.text(),
		icon: 'images/icons/icon-192x192.png',
		badge: 'images/icons/icon-192x192.png'
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
	console.log('[Service Worker] Notification click Received.');

	event.notification.close();

	event.waitUntil(
		clients.openWindow('https://developers.google.com/web/')
	);
});