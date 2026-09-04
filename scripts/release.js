#!/usr/bin/env node
/**
 * scripts/release.js — bump the release version everywhere at once.
 *
 *   node scripts/release.js          # patch bump: 2.1.0 → 2.1.1
 *   node scripts/release.js 2.2.0    # explicit X.Y.Z version
 *
 * Updates:
 *   - core/tg.js  TG.APP_VERSION      (shown in the header badge on every page)
 *   - sw.js       const CACHE = 'allinone-<X.Y.Z>'  (invalidates old caches)
 *
 * The cache name deliberately carries the FULL version, so every release
 * force-refreshes repeat visitors (the SW is network-first anyway). After
 * bumping, run `node --test tests/` — the tests assert both files stay in sync.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function read(f) { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }
function write(f, s) { fs.writeFileSync(path.join(ROOT, f), s); }

const TG_FILE = 'core/tg.js';
const SW_FILE = 'sw.js';
const VERSION_RE = /^\d+\.\d+\.\d+$/;

// ---- Read the current version from core/tg.js (single source of truth) ----
const tgSrc = read(TG_FILE);
const match = tgSrc.match(/APP_VERSION:\s*'(\d+\.\d+\.\d+)'/);
if (!match) {
    console.error(`Could not read APP_VERSION from ${TG_FILE}.`);
    process.exit(1);
}
const current = match[1];

let next = process.argv[2];
if (next !== undefined) {
    if (!VERSION_RE.test(next)) {
        console.error(`Version must be X.Y.Z (got "${next}").`);
        process.exit(1);
    }
} else {
    const [maj, min, pat] = current.split('.').map(Number);
    next = `${maj}.${min}.${pat + 1}`;
}

if (next === current) {
    console.log(`Already at ${current} — nothing to do.`);
    process.exit(0);
}

// ---- 1. core/tg.js ----
const tgNext = tgSrc.replace(/APP_VERSION:\s*'[^']+'/, `APP_VERSION: '${next}'`);
if (tgNext === tgSrc) {
    console.error(`Could not rewrite APP_VERSION in ${TG_FILE}.`);
    process.exit(1);
}
write(TG_FILE, tgNext);

// ---- 2. sw.js (cache name = allinone-<X.Y.Z>) ----
const swSrc = read(SW_FILE);
const swNext = swSrc.replace(/const CACHE = 'allinone-[\d.]+'/, `const CACHE = 'allinone-${next}'`);
if (swNext === swSrc) {
    console.error(`Could not rewrite CACHE in ${SW_FILE}.`);
    process.exit(1);
}
write(SW_FILE, swNext);

console.log(`Released ${current} → ${next}`);
console.log(`  ${TG_FILE}: APP_VERSION = '${next}'`);
console.log(`  ${SW_FILE}:  CACHE = 'allinone-${next}'`);
console.log('Run `node --test tests/` to verify the sync.');
