const SHARE_CACHE = 'bridgik-share-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const files = formData
            .getAll('files')
            .filter((f) => f && typeof f !== 'string');
          const title = formData.get('title') || '';
          const text = formData.get('text') || '';
          const sharedUrl = formData.get('url') || '';

          const cache = await caches.open(SHARE_CACHE);
          const meta = {
            title: String(title),
            text: String(text),
            url: String(sharedUrl),
            files: [],
          };

          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const key = `/__shared_file_${i}`;
            meta.files.push({
              key,
              name: file.name || `shared-file-${i}`,
              type: file.type || 'application/octet-stream',
            });
            await cache.put(
              key,
              new Response(file, {
                headers: { 'Content-Type': file.type || 'application/octet-stream' },
              })
            );
          }

          await cache.put(
            '/__shared_meta__',
            new Response(JSON.stringify(meta), {
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('SW share-target error:', err);
        }
        return Response.redirect('/?shared=1', 303);
      })()
    );
  }
});