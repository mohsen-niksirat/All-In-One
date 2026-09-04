/**
 * sw.js — app-shell service worker.
 *
 * Strategy:
 *  - On install: precache the launcher + core layer (small, static).
 *  - Every successful same-origin GET is cached on the fly, so once you have
 *    visited an app it works offline too.
 *  - Navigations are network-first with cache fallback (falls back to the
 *    cached launcher if the exact page was never visited).
 *
 * Bump CACHE when you ship changes that must invalidate old cached assets.
 */
'use strict';

const CACHE = 'allinone-v1';

const PRECACHE = [
    './',
    './index.html',
    './core/ui.css',
    './core/tg.js',
    './core/store.js',
    './core/i18n.js',
    './launcher.css',
    './launcher.js',
    './apps/registry.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    if (req.mode === 'navigate') {
        // Network first; offline → cached copy of this page, else the launcher.
        event.respondWith(
            fetch(req)
                .then((res) => {
                    if (res && res.ok) cachePut(req, res.clone());
                    return res;
                })
                .catch(() =>
                    caches.match(req).then((hit) => hit || caches.match('./index.html'))
                )
        );
        return;
    }

    // Assets: cache-first with background refresh.
    event.respondWith(
        caches.match(req).then((hit) => {
            const fresh = fetch(req)
                .then((res) => {
                    if (res && res.ok) cachePut(req, res.clone());
                    return res;
                })
                .catch(() => hit);
            return hit || fresh;
        })
    );
});

function cachePut(req, res) {
    try {
        caches.open(CACHE).then((cache) => cache.put(req, res));
    } catch (e) {
        // ignore
    }
}
