/**
 * app.js — Color Picker (core layer, trilingual fa/en/ar).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        color_title: 'انتخاب رنگ',
        color_palette: 'پالت',
        color_history: 'تاریخچه',
        color_copy: 'کپی',
        color_copied: 'کپی شد!',
        color_empty: 'هنوز رنگی کپی نشده',
        color_clear: 'پاک کردن',
        color_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        color_title: 'Color Picker',
        color_palette: 'Palette',
        color_history: 'History',
        color_copy: 'Copy',
        color_copied: 'Copied!',
        color_empty: 'No colors copied yet',
        color_clear: 'Clear',
        color_back: 'Back to apps',
    });

    I18N.register('ar', {
        color_title: 'منتقي الألوان',
        color_palette: 'لوحة الألوان',
        color_history: 'السجل',
        color_copy: 'نسخ',
        color_copied: 'تم النسخ!',
        color_empty: 'لا ألوان منسوخة بعد',
        color_clear: 'مسح',
        color_back: 'العودة إلى التطبيقات',
    });

    const NS = 'color-picker';

    // ---- Color math ----
    function hexToRgb(hex) {
        const h = hex.replace('#', '');
        const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
        const n = parseInt(full, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(v => String(v).padStart(2, '0')).join('').toUpperCase();
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                default: h = (r - g) / d + 4;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
        };
    }

    function hslToHex(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s /= 100; l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; }
        else if (h < 120) { r = x; g = c; }
        else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; }
        else if (h < 300) { r = x; b = c; }
        else { r = c; b = x; }
        return rgbToHex(
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        );
    }

    const App = {
        elements: {},
        current: '#0088CC',

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                colorInput: document.getElementById('color-input'),
                hexInput: document.getElementById('hex-input'),
                swatch: document.getElementById('swatch'),
                paletteRow: document.getElementById('palette-row'),
                historyList: document.getElementById('history-list'),
                clearHistory: document.getElementById('clear-history'),
            };

            this.setupEvents();
            this.update(this.current, false);

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('color_title');
                this.renderHistory();
            });
            document.title = I18N.t('color_title');
        },

        setupEvents() {
            this.elements.colorInput.addEventListener('input', () => {
                this.update(this.elements.colorInput.value.toUpperCase(), true);
            });

            this.elements.hexInput.addEventListener('change', () => {
                const v = this.elements.hexInput.value.trim();
                if (/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(v)) {
                    const hex = (v.startsWith('#') ? v : '#' + v).toUpperCase();
                    const rgb = hexToRgb(hex);
                    this.update(rgbToHex(rgb.r, rgb.g, rgb.b), true);
                } else {
                    this.elements.hexInput.value = this.current;
                    TG.haptic('error');
                }
            });

            document.querySelectorAll('.value-copy').forEach(btn => {
                btn.addEventListener('click', () => this.copy(btn.dataset.copy));
            });

            this.elements.clearHistory.addEventListener('click', () => {
                Store.remove(NS, 'history');
                this.renderHistory();
                TG.haptic('light');
            });
        },

        update(hex, save) {
            this.current = hex;
            const rgb = hexToRgb(hex);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

            this.elements.colorInput.value = hex;
            this.elements.hexInput.value = hex;
            this.elements.swatch.style.background = hex;

            const rows = document.querySelectorAll('.value-copy');
            if (rows[0]) {
                rows[0].textContent = hex;
                rows[0].dataset.copy = hex;
            }
            if (rows[1]) {
                rows[1].textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                rows[1].dataset.copy = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            }
            if (rows[2]) {
                rows[2].textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                rows[2].dataset.copy = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
            }

            // Palette: base + hue rotations
            const palette = [hex, hslToHex(hsl.h + 30, hsl.s, hsl.l), hslToHex(hsl.h - 30, hsl.s, hsl.l), hslToHex(hsl.h + 180, hsl.s, hsl.l), hslToHex(hsl.h + 120, hsl.s, hsl.l)];
            this.elements.paletteRow.innerHTML = palette.map((c, i) =>
                `<button class="palette-swatch" data-color="${c}" style="background:${c}">${i === 0 ? '✦' : ''}</button>`
            ).join('');
            this.elements.paletteRow.querySelectorAll('.palette-swatch').forEach(sw => {
                sw.addEventListener('click', () => this.copy(sw.dataset.color));
            });

            if (save) {
                const history = Store.getJSON(NS, 'history', []);
                if (history[0] !== hex) {
                    history.unshift(hex);
                    Store.setJSON(NS, 'history', history.slice(0, 12));
                    this.renderHistory();
                }
                TG.haptic('light');
            }
        },

        async copy(text) {
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            TG.toast(I18N.t('color_copied'), 'success');
            TG.haptic('light');
        },

        renderHistory() {
            const history = Store.getJSON(NS, 'history', []);
            if (history.length === 0) {
                this.elements.historyList.innerHTML =
                    `<div class="empty-note">${I18N.t('color_empty')}</div>`;
                return;
            }
            this.elements.historyList.innerHTML = history.map(c =>
                `<button class="history-chip" data-color="${c}" style="background:${c}" title="${c}"></button>`
            ).join('');
            this.elements.historyList.querySelectorAll('.history-chip').forEach(chip => {
                chip.addEventListener('click', () => this.update(chip.dataset.color, true));
            });
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();