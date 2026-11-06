const CACHE = "u10-search-4f0b9791b9";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // 画面は通信できれば常に最新を取得し、保存済みはオフライン時のみ使う
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch("./index.html", {cache: "no-cache"}).then(resp => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy));
        }
        return resp;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(() => caches.match("./index.html")))
  );
});
