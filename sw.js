const CACHE = "rhefeed-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/constants.js",
  "./js/units.js",
  "./js/energy.js",
  "./js/malnutrition.js",
  "./js/risk.js",
  "./js/plan.js",
  "./js/note.js",
  "./js/storage.js",
  "./js/zscore.js",
  "./js/refeeding.js",
  "./js/babyfood.js",
  "./js/settings.js",
  "./js/app.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
