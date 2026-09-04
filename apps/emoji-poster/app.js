/**
 * app.js — Emoji Poster: turn one emoji + a headline into a shareable
 * 1080×1350 PNG poster. Fully offline, generated on a <canvas>.
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        emo_title: 'پوستر ایموجی',
        emo_back: 'بازگشت به لیست اپ‌ها',
        emo_text_label: 'متن عنوان',
        emo_text_ph: 'عنوان پوستر...',
        emo_emoji_label: 'ایموجی',
        emo_bg_label: 'پس‌زمینه',
        emo_make: 'ساخت پوستر',
        emo_download: '⬇ دانلود PNG',
        emo_downloaded: 'دانلود شد!',
        emo_rand: 'تصادفی',
    });

    I18N.register('en', {
        emo_title: 'Emoji Poster',
        emo_back: 'Back to apps',
        emo_text_label: 'Headline',
        emo_text_ph: 'Poster headline...',
        emo_emoji_label: 'Emoji',
        emo_bg_label: 'Background',
        emo_make: 'Create poster',
        emo_download: '⬇ Download PNG',
        emo_downloaded: 'Downloaded!',
        emo_rand: 'Random',
    });

    I18N.register('ar', {
        emo_title: 'ملصق إيموجي',
        emo_back: 'العودة إلى التطبيقات',
        emo_text_label: 'العنوان',
        emo_text_ph: 'عنوان الملصق...',
        emo_emoji_label: 'إيموجي',
        emo_bg_label: 'الخلفية',
        emo_make: 'إنشاء الملصق',
        emo_download: '⬇ تنزيل PNG',
        emo_downloaded: 'تم التنزيل!',
        emo_rand: 'عشوائي',
    });

    const NS = 'emoji-poster';

    const EMOJIS = ['🔥', '⚡', '🎉', '❤️', '🌍', '😎', '🚀', '💯', '🌈', '🍕', '🎯', '💎'];

    // Vertical gradient presets (dark enough for white text).
    const GRADS = [
        ['#ff5e62', '#ff9966'],
        ['#8e2de2', '#4a00e0'],
        ['#0f2027', '#2c5364'],
        ['#c31432', '#240b36'],
        ['#000428', '#004e92'],
        ['#7b2ff7', '#f107a3'],
    ];

    const W = 1080;
    const H = 1350;

    const App = {
        state: { text: '', emoji: '🎉', bg: 0 },

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                text: document.getElementById('text'),
                emojiOptions: document.getElementById('emoji-options'),
                emojiRand: document.getElementById('emoji-rand'),
                bgOptions: document.getElementById('bg-options'),
                make: document.getElementById('make'),
                download: document.getElementById('download'),
                previewWrap: document.getElementById('preview-wrap'),
                canvas: document.getElementById('poster'),
                status: document.getElementById('status'),
            };

            const saved = Store.getJSON(NS, 'last', null);
            if (saved) {
                this.state.text = saved.text || '';
                this.state.emoji = EMOJIS.includes(saved.emoji) ? saved.emoji : '🎉';
                this.state.bg = saved.bg >= 0 && saved.bg < GRADS.length ? saved.bg : 0;
            }
            this.elements.text.value = this.state.text;

            this.renderEmojiOptions();
            this.renderBgOptions();
            this.setupEvents();

            // Restore the last poster on open
            this.draw();

            document.title = I18N.t('emo_title');
            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('emo_title');
            });
        },

        setupEvents() {
            this.elements.text.addEventListener('input', () => {
                this.state.text = this.elements.text.value;
            });
            this.elements.make.addEventListener('click', () => {
                this.saveState();
                this.draw();
                TG.haptic('light');
            });
            this.elements.emojiRand.addEventListener('click', () => {
                this.state.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
                this.state.bg = Math.floor(Math.random() * GRADS.length);
                this.renderEmojiOptions();
                this.renderBgOptions();
                this.saveState();
                this.draw();
                TG.haptic('light');
            });
            this.elements.download.addEventListener('click', () => this.download());
        },

        saveState() {
            this.state.text = this.elements.text.value;
            Store.setJSON(NS, 'last', this.state);
        },

        renderEmojiOptions() {
            this.elements.emojiOptions.innerHTML = EMOJIS.map(e =>
                `<button type="button" class="emoji-opt${e === this.state.emoji ? ' active' : ''}" data-e="${e}">${e}</button>`
            ).join('');
            this.elements.emojiOptions.querySelectorAll('.emoji-opt').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.state.emoji = btn.dataset.e;
                    this.renderEmojiOptions();
                    TG.haptic('light');
                });
            });
        },

        renderBgOptions() {
            this.elements.bgOptions.innerHTML = GRADS.map((g, i) => `
                <button type="button" class="bg-opt${i === this.state.bg ? ' active' : ''}" data-i="${i}">
                    <span class="swatch" style="background:linear-gradient(180deg, ${g[0]}, ${g[1]})"></span>
                </button>
            `).join('');
            this.elements.bgOptions.querySelectorAll('.bg-opt').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.state.bg = parseInt(btn.dataset.i);
                    this.renderBgOptions();
                    TG.haptic('light');
                });
            });
        },

        // ---- Drawing ----
        wrap(ctx, text, maxWidth) {
            const words = String(text).split(/\s+/).filter(Boolean);
            const lines = [];
            let cur = '';
            for (const w of words) {
                const t = cur ? cur + ' ' + w : w;
                if (ctx.measureText(t).width > maxWidth && cur) {
                    lines.push(cur);
                    cur = w;
                } else {
                    cur = t;
                }
            }
            if (cur) lines.push(cur);
            return lines.slice(0, 3);
        },

        draw() {
            const cv = this.elements.canvas;
            if (typeof cv.getContext !== 'function') return; // DOM shim / unsupported
            const ctx = cv.getContext('2d');
            if (!ctx) return;

            const [c1, c2] = GRADS[this.state.bg];
            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, c1);
            g.addColorStop(1, c2);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);

            // Soft decorative circles
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(W - 90, 190, 260, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(70, H - 160, 300, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Main emoji
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '430px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
            ctx.fillText(this.state.emoji, W / 2, 520);

            // Headline (wrapped, centered)
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.35)';
            ctx.shadowBlur = 18;
            const text = this.state.text.trim();
            if (text) {
                ctx.font = 'bold 86px -apple-system, "Segoe UI", Roboto, sans-serif';
                ctx.direction = I18N.dirs[I18N.current] === 'rtl' ? 'rtl' : 'ltr';
                const lines = this.wrap(ctx, text, 880);
                const lh = 116;
                const startY = 940 - ((lines.length - 1) * lh) / 2;
                lines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lh));
            }
            ctx.shadowBlur = 0;

            // Footer brand + date
            ctx.direction = 'ltr';
            ctx.font = '600 40px -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.fillText('🧩 All-In-One', W / 2, H - 90);

            this.elements.previewWrap.classList.remove('hidden');
        },

        download() {
            const cv = this.elements.canvas;
            const href = cv.toDataURL ? cv.toDataURL('image/png') : null;
            if (!href) return;
            const a = document.createElement('a');
            a.href = href;
            a.download = 'poster.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            TG.toast(I18N.t('emo_downloaded'), 'success');
            TG.haptic('light');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();
