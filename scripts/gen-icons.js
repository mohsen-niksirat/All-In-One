/**
 * scripts/gen-icons.js — generates the PWA icons (pure Node, no deps).
 *
 * Draws a 2×2 “app tiles” glyph (matching the 🧩 launcher identity) on the
 * dark hub background, anti-aliased by 2×2 supersampling, and writes
 * lossless PNGs into icons/:
 *   icon-192.png  icon-512.png       (purpose: any)
 *   maskable-192.png  maskable-512.png (purpose: maskable, art in safe zone)
 *
 * Run: node scripts/gen-icons.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---- Minimal PNG encoder ----
const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c >>> 0;
    }
    return t;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const t = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
}

function encodePNG(size, rgba) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 6;   // color type: RGBA
    const raw = Buffer.alloc(size * (size * 4 + 1));
    for (let y = 0; y < size; y++) {
        raw[y * (size * 4 + 1)] = 0; // filter: none
        rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
    }
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

// ---- Drawing ----
// Tile palette (matches core/ui.css accent + status colors).
const TILES = [
    [0x50, 0xa9, 0xe8], // accent blue
    [0x22, 0xc5, 0x5e], // success green
    [0xf5, 0x9e, 0x0b], // amber
    [0xef, 0x44, 0x44], // red
];
const BG = [0x0b, 0x12, 0x20];

/** rounded-rect coverage in [0,1] at subpixel (x, y) on a size×size canvas. */
function roundRectCoverage(x, y, cx, cy, half, rad) {
    const dx = Math.abs(x - cx) - (half - rad);
    const dy = Math.abs(y - cy) - (half - rad);
    const d = Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - rad;
    return Math.min(1, Math.max(0, 0.5 - d));
}

/**
 * @param inset  art inset from the edge (fraction of size) — larger for maskable
 */
function makeIcon(size, inset, tileScale) {
    const rgba = Buffer.alloc(size * size * 4);
    const S = size;
    const I = S * inset;
    const content = S - 2 * I;
    const gap = S * 0.045;
    const tile = (content - gap) / 2 * tileScale;
    const off = (S - (tile * 2 + gap)) / 2; // re-centre after scaling
    const centers = [
        [off + tile / 2, off + tile / 2],
        [off + tile * 1.5 + gap, off + tile / 2],
        [off + tile / 2, off + tile * 1.5 + gap],
        [off + tile * 1.5 + gap, off + tile * 1.5 + gap],
    ];
    const rad = tile * 0.22;

    for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
            // 2×2 supersampling
            let r = 0, g = 0, b = 0, a = 0;
            for (const sx of [0.25, 0.75]) {
                for (const sy of [0.25, 0.75]) {
                    const px = x + sx;
                    const py = y + sy;
                    let cr = BG[0], cg = BG[1], cb = BG[2], ca = 1;
                    for (let t = 0; t < 4; t++) {
                        const cov = roundRectCoverage(px, py, centers[t][0], centers[t][1], tile / 2, rad);
                        if (cov > 0) {
                            // blend tile over background
                            cr = cr + (TILES[t][0] - cr) * cov;
                            cg = cg + (TILES[t][1] - cg) * cov;
                            cb = cb + (TILES[t][2] - cb) * cov;
                        }
                    }
                    r += cr; g += cg; b += cb; a += ca;
                }
            }
            const i = (y * S + x) * 4;
            rgba[i] = Math.round(r / 4);
            rgba[i + 1] = Math.round(g / 4);
            rgba[i + 2] = Math.round(b / 4);
            rgba[i + 3] = 255;
        }
    }
    return encodePNG(size, rgba);
}

const OUT = path.join(__dirname, '..', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
    ['icon-192.png', 192, 0.12, 1.0],
    ['icon-512.png', 512, 0.12, 1.0],
    ['maskable-192.png', 192, 0.22, 0.9],
    ['maskable-512.png', 512, 0.22, 0.9],
];

for (const [name, size, inset, tileScale] of jobs) {
    fs.writeFileSync(path.join(OUT, name), makeIcon(size, inset, tileScale));
    console.log('wrote icons/' + name);
}
console.log('done');
