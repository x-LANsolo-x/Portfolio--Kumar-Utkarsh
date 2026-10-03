/**
 * The service worker.
 *
 * ── What it is for ──────────────────────────────────────────────────────
 *
 * A second visit to this site currently re-fetches the same fingerprinted
 * bundles, the same four fonts and the same images. They are all cacheable and
 * the HTTP cache does hold them, but it is evictable, per-origin and out of our
 * hands. This keeps the parts that never change under our own key, and gives
 * the site something to show when the network is gone entirely.
 *
 * ── The rules, and why each one is what it is ───────────────────────────
 *
 * NAVIGATIONS are network-first. A cached page is the one thing that can make
 * a deploy invisible — the reader would keep seeing yesterday's site with no
 * way to ask for today's. The cache is only the answer when the network has
 * none, which is the offline case it exists for.
 *
 * /assets/* is cache-first because it is immutable by construction: Vite
 * fingerprints every asset, so a change is a new filename rather than new
 * bytes at the same one. A hit there can never be stale.
 *
 * /fonts/* shares the cache-first rule but NOT the reason — font files live
 * in public/ under stable names, so they are only immutable by convention.
 * Swapping a font file (the Breathney demo cut for the licensed one, say) is
 * new bytes at the same URL, and needs a VERSION bump exactly as a re-encoded
 * image does. v10 exists because of precisely this.
 *
 * IMAGES are cache-first with a cap. This site ships about 88MB of them and
 * caching all of it would be rude; the cap keeps only what has actually been
 * looked at.
 *
 * CROSS-ORIGIN requests are not touched at all — analytics, the Unicorn runtime
 * and its scene data all go straight to the network. A service worker sitting
 * in front of someone else's endpoint is a debugging problem waiting to happen.
 *
 * ── The kill switch ─────────────────────────────────────────────────────
 *
 * A bad service worker is sticky: it can keep serving a broken site to people
 * who have already visited, and they have no obvious way out. Two escapes are
 * built in. Loading any page with `?nosw` unregisters this worker and clears
 * its caches (see the registration snippet in the page head). And bumping
 * VERSION below drops every cache from the previous one on activate.
 */

/*
 * ── Bump this when images are re-encoded ────────────────────────────────
 *
 * v1 -> v2 because a set of case-study images was re-exported and the new
 * files never reached anyone who had already visited. Vite fingerprints
 * /assets, so those are safe at any version, but IMAGE filenames are stable
 * by design — okx-simple-entry-2400.avif keeps its name when the picture
 * behind it changes. Cache-first plus a stable name meant the old bytes were
 * served for good, and a hard reload does not help: it bypasses the HTTP
 * cache, not the worker sitting in front of it.
 *
 * v11 -> v12 with the case-study images: their URLs now carry a content
 * stamp (see .case-src/media-version.mjs), so a re-encoded picture arrives
 * under a name this cache has never seen and staleness here is over as a
 * class. The bump clears what the old unversioned names left behind rather
 * than waiting for the cap to evict it.
 *
 * Changing VERSION drops every cache from the previous one on activate.
 */
const VERSION = 'v12';
const SHELL = `shell-${VERSION}`;
const MEDIA = `media-${VERSION}`;
const MEDIA_MAX = 220;                 // entries, not bytes: ~60-80MB of AVIF

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (!key.endsWith(VERSION)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(SHELL);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const hit = await caches.match(request);
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const fresh = await fetch(request);
  /* Opaque and error responses are not worth a cache entry — an opaque one
     cannot be read back usefully and an error would be served as though it
     were the file. */
  if (fresh.ok && fresh.type === 'basic') {
    const cache = await caches.open(cacheName);
    await cache.put(request, fresh.clone());
    if (cacheName === MEDIA) trim(cache);
  }
  return fresh;
}

/**
 * Serve the cached image immediately, and refresh it in the background.
 *
 * ── Why images cannot be cache-first ────────────────────────────────────
 *
 * Cache-first is correct for /assets and /fonts because Vite fingerprints
 * them: different bytes always means a different URL, so a hit can never be
 * stale. Image URLs are NOT fingerprinted — okx-hero-2400.avif is the hero
 * whatever the hero currently is — so cache-first pinned the first version a
 * reader ever saw. Re-encoding the OKX set proved it: the files were on the
 * server and correct, and every returning visitor still saw the old ones,
 * with no way to ask for the new ones short of clearing site data.
 *
 * Stale-while-revalidate keeps the reason the cache exists — the image is on
 * screen instantly, no network on the critical path — while letting an
 * updated file actually arrive. The cost is that a changed image shows up one
 * view later, which for a portfolio is the right trade: bumping VERSION is
 * there for when it needs to be immediate.
 */
async function staleWhileRevalidate(request, cacheName) {
  const hit = await caches.match(request);

  const update = fetch(request).then(async (fresh) => {
    if (fresh.ok && fresh.type === 'basic') {
      const cache = await caches.open(cacheName);
      await cache.put(request, fresh.clone());
      if (cacheName === MEDIA) trim(cache);
    }
    return fresh;
  }).catch(() => null);

  /* A hit answers now and the refresh continues on its own. Without the miss
     branch awaiting `update`, a first view would have nothing to return. */
  if (hit) return hit;
  const fresh = await update;
  if (fresh) return fresh;
  throw new Error('offline and not cached');
}

/** Oldest-first, and deliberately not awaited by the response path. */
async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MEDIA_MAX; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /*
   * ── Range requests are none of this worker's business ──────────────────
   *
   * Video elements fetch with `Range: bytes=…`, and both halves of the cache
   * dance break on them. Cache.match ignores Range semantics, so a stored
   * full response would be handed back whole to an element that asked for a
   * slice — which media decoding treats as an error. And Cache.put REJECTS
   * partial responses outright, while `fresh.ok` is true for a 206 — so the
   * store attempt threw, the chain's catch turned the response into null, and
   * the miss branch then threw "offline and not cached" AT the video. Every
   * first-load range fetch for the Pangeam clips died inside this worker;
   * the panels sat at readyState 0 while curl said 200, because curl does
   * not go through a service worker.
   *
   * Let the network answer these. It already does ranges correctly.
   */
  if (request.headers.has('range')) return;

  /*
   * /admin is the CMS, and it is not part of this site's shell.
   *
   * It is a third-party application that loads its own code, talks to the
   * GitHub API and holds an auth token — none of which should be served from
   * a cache this worker manages. Left to the navigate branch below it would be
   * kept in SHELL and handed back whenever the network hiccuped, which is how
   * an editor ends up looking at a stale build of the CMS with a token that
   * no longer matches it. Nothing about /admin is worth offline support.
   */
  if (url.pathname.startsWith('/admin')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/fonts/')) {
    event.respondWith(cacheFirst(request, SHELL));
    return;
  }
  /* mp4 removed from this route: video goes to the network, always. The range
     bail above already covers the streaming case; this covers any non-range
     fetch of a 5.6MB file that has no business displacing images in a capped
     cache. */
  if (/\.(avif|webp|png|jpe?g|svg)$/i.test(url.pathname)) {
    /* Not cache-first: these filenames are stable across re-encodes, so a
       cached hit can be genuinely out of date. See staleWhileRevalidate. */
    event.respondWith(staleWhileRevalidate(request, MEDIA));
  }
});
