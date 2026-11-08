const VERSION = 'travel-v4';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* 快取策略
   - first：有快取就直接用，完全不再連網（圖檔、字型檔、Firebase SDK 的網址都帶版本或內容固定）。
     改了這類檔案的內容時，要把 VERSION 加一才會更新。
   - swr：先給快取、同時背景更新（manifest、Google Fonts 的 CSS）。
   - null：不快取。跨網站的圖片（手繪、動態風格）是「不透明回應」，瀏覽器會把每一張當成很大的檔案
     計入儲存配額，所以不存。 */
function strategy(u){
  if (u.origin === self.location.origin) return /\.(webp|svg|png)$/.test(u.pathname) ? 'first' : 'swr';
  if (u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/')) return 'first';
  if (u.hostname === 'fonts.gstatic.com') return u.pathname.startsWith('/s/e/notoemoji') ? null : 'first';
  if (u.hostname === 'fonts.googleapis.com') return 'swr';
  return null;
}
function store(req, res, allowOpaque){
  if (res && (res.ok || (allowOpaque && res.type === 'opaque'))) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {}); }
  return res;
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (req.mode === 'navigate') {
    // 只有成功的回應才更新離線備份，避免 404／500 頁面蓋掉好的 index.html
    e.respondWith(fetch(req).then(res => store('./index.html', res, false))
      .catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
    return;
  }
  const how = strategy(u);
  if (!how) return;
  if (how === 'first') {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => store(req, res, false))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => store(req, res, true)).catch(() => hit);
    return hit || net;
  }));
});
