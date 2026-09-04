/**
 * app.js — Wheel of Actions: spin a canvas wheel to pick randomly.
 * Fully offline. Animation is pure CSS transition on the canvas element.
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        whl_title: 'چرخ شانس',
        whl_back: 'بازگشت به لیست اپ‌ها',
        whl_ph: 'هر گزینه در یک خط',
        whl_demo: 'نمونه',
        whl_spin: 'بچرخان',
        whl_need: 'حداقل دو گزینه وارد کنید',
        whl_winner: '🎉 برنده: {name}',
        whl_recent: 'برنده‌های اخیر:',
    });

    I18N.register('en', {
        whl_title: 'Wheel of Actions',
        whl_back: 'Back to apps',
        whl_ph: 'One option per line',
        whl_demo: 'Load sample',
        whl_spin: 'Spin',
        whl_need: 'Enter at least two options',
        whl_winner: '🎉 Winner: {name}',
        whl_recent: 'Recent winners:',
    });

    I18N.register('ar', {
        whl_title: 'عجلة الحظ',
        whl_back: 'العودة إلى التطبيقات',
        whl_ph: 'خيار واحد في كل سطر',
        whl_demo: 'مثال',
        whl_spin: 'دوّر',
        whl_need: 'أدخل خيارين على الأقل',
        whl_winner: '🎉 الفائز: {name}',
        whl_recent: 'آخر الفائزين:',
    });

    const NS = 'wheel-of-actions';

    const DEMO = {
        fa: ['پیتزا', 'سوشی', 'برگر', 'سالاد', 'کباب'],
        en: ['Pizza', 'Sushi', 'Burger', 'Salad', 'Kebab'],
        ar: ['بيتزا', 'سوشي', 'برغر', 'سلطة', 'كباب'],
    };

    const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    const App = {
        items: [],
        rot: 0,          // cumulative CSS rotation in degrees
        spinning: false,

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                items: document.getElementById('items'),
                demo: document.getElementById('demo'),
                spin: document.getElementById('spin'),
                inner: document.getElementById('wheel-inner'),
                canvas: document.getElementById('wheel-canvas'),
                result: document.getElementById('result'),
                recentLabel: document.getElementById('recent-label'),
                recent: document.getElementById('recent'),
            };

            this.recent = Store.getJSON(NS, 'recent', []);

            const last = Store.getJSON(NS, 'items', null);
            this.elements.items.value = last ? last.join('\n') : '';

            this.setupEvents();
            this.syncItems();
            this.renderRecent();
            document.title = I18N.t('whl_title');

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('whl_title');
                this.renderRecent();
                if (this.lastWinner !== undefined) {
                    this.elements.result.textContent = I18N.t('whl_winner', { name: this.items[this.lastWinner] });
                }
            });
        },

        setupEvents() {
            this.elements.demo.addEventListener('click', () => {
                this.elements.items.value = (DEMO[I18N.current] || DEMO.en).join('\n');
                this.syncItems();
                TG.haptic('light');
            });
            this.elements.items.addEventListener('input', () => this.syncItems());
            this.elements.spin.addEventListener('click', () => this.spin());
        },

        currentItems() {
            return this.elements.items.value.split('\n')
                .map(s => s.trim())
                .filter(Boolean);
        },

        syncItems() {
            this.items = this.currentItems();
            Store.setJSON(NS, 'items', this.items);
            this.draw();
            if (this.items.length < 2) {
                this.elements.result.classList.add('hidden');
            }
        },

        // ---- Canvas ----
        draw() {
            const cv = this.elements.canvas;
            if (typeof cv.getContext !== 'function') return; // DOM shim / unsupported
            const ctx = cv.getContext('2d');
            if (!ctx) return;
            const n = this.items.length;
            const cx = 300;
            const cy = 300;
            const r = 290;

            ctx.clearRect(0, 0, 600, 600);
            if (n < 2) {
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fillStyle = '#e5e7eb';
                ctx.fill();
                ctx.strokeStyle = '#c7ccd6';
                ctx.lineWidth = 2;
                ctx.stroke();
                return;
            }

            const slice = (Math.PI * 2) / n;
            for (let i = 0; i < n; i++) {
                const start = -Math.PI / 2 + i * slice;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, r, start, start + slice);
                ctx.closePath();
                ctx.fillStyle = COLORS[i % COLORS.length];
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.55)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Labels along the radius
            ctx.font = '700 24px -apple-system, "Segoe UI", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.direction = I18N.dirs[I18N.current] === 'rtl' ? 'rtl' : 'ltr';
            for (let i = 0; i < n; i++) {
                const mid = -Math.PI / 2 + i * slice + slice / 2;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(mid);
                const label = this.fit(ctx, this.items[i], 150);
                ctx.fillText(label, r - 20, 8);
                ctx.restore();
            }

            // Hub
            ctx.beginPath();
            ctx.arc(cx, cy, 34, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, cy, 30, 0, Math.PI * 2);
            ctx.fillStyle = COLORS[0];
            ctx.fill();
        },

        fit(ctx, text, maxW) {
            let t = text;
            while (t.length > 1 && ctx.measureText(t).width > maxW) {
                t = t.slice(0, -1);
            }
            return t.length < text.length ? t + '…' : t;
        },

        // ---- Spin ----
        spin() {
            this.syncItems();
            const n = this.items.length;
            if (n < 2 || this.spinning) {
                if (n < 2) {
                    this.elements.result.textContent = I18N.t('whl_need');
                    this.elements.result.classList.remove('hidden');
                    TG.haptic('error');
                }
                return;
            }
            this.spinning = true;
            this.elements.spin.disabled = true;
            this.elements.result.classList.add('hidden');

            const i = Math.floor(Math.random() * n);
            const sliceDeg = 360 / n;
            const turns = 4 + Math.floor(Math.random() * 4); // 4–7 full turns
            const want = (360 - ((i * sliceDeg + sliceDeg / 2) % 360)) % 360;
            const target = this.rot + turns * 360 + ((want - (this.rot % 360) + 360) % 360) + (Math.random() * sliceDeg * 0.4);

            this.rot = target;
            this.elements.inner.style.transition = 'transform 4s cubic-bezier(0.12, 0.8, 0.16, 1)';
            this.elements.inner.style.transform = `rotate(${target}deg)`;

            const finish = () => this.finishSpin(i);
            this.elements.inner.addEventListener('transitionend', finish, { once: true });
            // Safety net (e.g. hidden tab drops transitionend)
            setTimeout(finish, 4400);
        },

        finishSpin(i) {
            if (!this.spinning) return;
            this.spinning = false;
            this.elements.spin.disabled = false;
            this.lastWinner = i;
            this.elements.result.textContent = I18N.t('whl_winner', { name: this.items[i] });
            this.elements.result.classList.remove('hidden');
            this.recent.unshift(this.items[i]);
            this.recent = this.recent.slice(0, 8);
            Store.setJSON(NS, 'recent', this.recent);
            this.renderRecent();
            TG.haptic('medium');
        },

        renderRecent() {
            if (this.recent.length === 0) {
                this.elements.recentLabel.classList.add('hidden');
                this.elements.recent.innerHTML = '';
                return;
            }
            this.elements.recentLabel.classList.remove('hidden');
            this.elements.recent.innerHTML = this.recent
                .map(w => `<span class="chip">${this.escape(w)}</span>`)
                .join('');
        },

        escape(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();
