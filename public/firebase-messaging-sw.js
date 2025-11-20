// Empty service worker to prevent 404 errors
// This file is requested by browsers but not actively used
// If you need Firebase Cloud Messaging in the future, implement it here

self.addEventListener('install', () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Take control of all pages immediately
  return self.clients.claim();
});

