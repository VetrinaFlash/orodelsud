// Service worker: notifiche push + cache leggera di area clienti e pannello (il sito pubblico va sempre in rete).
const CACHE = 'ods-v1';
const SHELL = ['/area-clienti/', '/admin/', '/assets/app.css', '/assets/common.js', '/assets/shop.js', '/assets/admin.js', '/assets/pasta-art.js',
  '/assets/brand/logo-480.webp', '/icons/icon-192.png'];
const APP_PATHS = ['/area-clienti/', '/admin/', '/assets/', '/icons/'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// rete prima, cache come riserva (solo file dell'app; le API non vengono mai salvate)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || !APP_PATHS.some(p => url.pathname.startsWith(p))) return;
  const fallback = url.pathname.startsWith('/admin') ? '/admin/' : '/area-clienti/';
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match(fallback)))
  );
});

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { title: 'Aggiornamento', body: e.data && e.data.text() }; }
  const title = data.title || 'Pasta Oro del Sud';
  e.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: data.tag || undefined,
      renotify: Boolean(data.tag),
      data: { url: data.url || '/area-clienti/' },
    });
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(c => c.postMessage({ type: 'push', payload: data }));
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = new URL(e.notification.data?.url || '/area-clienti/', location.origin).href;
  const area = new URL(target).pathname.startsWith('/admin') ? '/admin' : '/area-clienti';
  e.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const sameApp = clients.find(c => new URL(c.url).pathname.startsWith(area));
    if (sameApp) { await sameApp.focus(); return sameApp.navigate(target).catch(() => {}); }
    return self.clients.openWindow(target);
  })());
});
