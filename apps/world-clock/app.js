/**
 * app.js — World Clock (fully offline — no network, no key).
 * Times are computed locally with Intl time-zone data.
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        wcl_title: 'ساعت جهانی',
        wcl_back: 'بازگشت به لیست اپ‌ها',
        wcl_add: 'افزودن شهر',
        wcl_close: 'بستن',
        wcl_note: '⚡ کاملاً آفلاین — بدون نیاز به اینترنت',
        wcl_search_ph: 'جستجوی شهر...',
        wcl_empty: 'شهری انتخاب نشده است\nروی «＋» بزنید و شهرها را اضافه کنید',
        wcl_local: 'محلی شما',
    });

    I18N.register('en', {
        wcl_title: 'World Clock',
        wcl_back: 'Back to apps',
        wcl_add: 'Add city',
        wcl_close: 'Close',
        wcl_note: '⚡ Fully offline — no network needed',
        wcl_search_ph: 'Search city...',
        wcl_empty: 'No cities yet\ntap “＋” to add some',
        wcl_local: 'your location',
    });

    I18N.register('ar', {
        wcl_title: 'ساعة العالم',
        wcl_back: 'العودة إلى التطبيقات',
        wcl_add: 'إضافة مدينة',
        wcl_close: 'إغلاق',
        wcl_note: '⚡ دون اتصال تماماً — لا حاجة للإنترنت',
        wcl_search_ph: 'ابحث عن مدينة...',
        wcl_empty: 'لم تُحدَّد أي مدينة\nاضغط «＋» لإضافة مدن',
        wcl_local: 'موقعك',
    });

    const NS = 'world-clock';

    // id = IANA time-zone. Names are given in fa / en / ar.
    const CITIES = [
        { id: 'Asia/Tehran', flag: '🇮🇷', fa: 'تهران', en: 'Tehran', ar: 'طهران' },
        { id: 'Asia/Kabul', flag: '🇦🇫', fa: 'کابل', en: 'Kabul', ar: 'كابول' },
        { id: 'Asia/Baghdad', flag: '🇮🇶', fa: 'بغداد', en: 'Baghdad', ar: 'بغداد' },
        { id: 'Asia/Riyadh', flag: '🇸🇦', fa: 'ریاض', en: 'Riyadh', ar: 'الرياض' },
        { id: 'Asia/Dubai', flag: '🇦🇪', fa: 'دبی', en: 'Dubai', ar: 'دبي' },
        { id: 'Europe/Istanbul', flag: '🇹🇷', fa: 'استانبول', en: 'Istanbul', ar: 'إسطنبول' },
        { id: 'Africa/Cairo', flag: '🇪🇬', fa: 'قاهره', en: 'Cairo', ar: 'القاهرة' },
        { id: 'Asia/Karachi', flag: '🇵🇰', fa: 'کراچی', en: 'Karachi', ar: 'كراتشي' },
        { id: 'Asia/Kolkata', flag: '🇮🇳', fa: 'دهلی', en: 'New Delhi', ar: 'نيودلهي' },
        { id: 'Asia/Tokyo', flag: '🇯🇵', fa: 'توکیو', en: 'Tokyo', ar: 'طوكيو' },
        { id: 'Asia/Shanghai', flag: '🇨🇳', fa: 'شانگهای', en: 'Shanghai', ar: 'شنغهاي' },
        { id: 'Asia/Singapore', flag: '🇸🇬', fa: 'سنگاپور', en: 'Singapore', ar: 'سنغافورة' },
        { id: 'Europe/Moscow', flag: '🇷🇺', fa: 'مسکو', en: 'Moscow', ar: 'موسكو' },
        { id: 'Europe/London', flag: '🇬🇧', fa: 'لندن', en: 'London', ar: 'لندن' },
        { id: 'Europe/Paris', flag: '🇫🇷', fa: 'پاریس', en: 'Paris', ar: 'باريس' },
        { id: 'Europe/Berlin', flag: '🇩🇪', fa: 'برلین', en: 'Berlin', ar: 'برلين' },
        { id: 'America/New_York', flag: '🇺🇸', fa: 'نیویورک', en: 'New York', ar: 'نيويورك' },
        { id: 'America/Los_Angeles', flag: '🇺🇸', fa: 'لس‌آنجلس', en: 'Los Angeles', ar: 'لوس أنجلوس' },
        { id: 'America/Toronto', flag: '🇨🇦', fa: 'تورنتو', en: 'Toronto', ar: 'تورنتو' },
        { id: 'America/Sao_Paulo', flag: '🇧🇷', fa: 'سائوپائولو', en: 'São Paulo', ar: 'ساو باولو' },
        { id: 'Australia/Sydney', flag: '🇦🇺', fa: 'سیدنی', en: 'Sydney', ar: 'سيدني' },
    ];

    const App = {
        zones: [],          // selected IANA ids
        interval: null,

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                clocks: document.getElementById('clocks'),
                addBtn: document.getElementById('add-btn'),
                picker: document.getElementById('picker'),
                pickerClose: document.getElementById('picker-close'),
                pickerList: document.getElementById('picker-list'),
                citySearch: document.getElementById('city-search'),
            };

            const saved = Store.getJSON(NS, 'zones', []);
            this.zones = saved.filter(z => CITIES.some(c => c.id === z));

            this.setupEvents();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('wcl_title');
                this.render();
            });
            document.title = I18N.t('wcl_title');
        },

        setupEvents() {
            this.elements.addBtn.addEventListener('click', () => this.openPicker());
            this.elements.pickerClose.addEventListener('click', () => this.closePicker());
            this.elements.picker.addEventListener('click', (e) => {
                if (e.target === this.elements.picker) this.closePicker();
            });
            this.elements.citySearch.addEventListener('input', () => this.renderPicker());

            this.startTicker();
        },

        startTicker() {
            // Unref so a Node test process can exit (browser ignores unref).
            this.interval = setInterval(() => this.tick(), 1000);
            if (this.interval && typeof this.interval.unref === 'function') this.interval.unref();
        },

        // ---- TZ helpers ----
        cityName(c) {
            const lang = I18N.current;
            return c[lang] || c.en;
        },

        zoneParts(zone, date) {
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: zone,
                hour12: false,
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            });
            const p = {};
            fmt.formatToParts(date).forEach(part => { if (part.type !== 'literal') p[part.type] = part.value; });
            const h = parseInt(p.hour, 10) % 24; // en-US hour12:false can yield "24"
            return {
                h, min: parseInt(p.minute, 10), s: parseInt(p.second, 10),
                day: parseInt(p.day, 10), month: parseInt(p.month, 10), year: parseInt(p.year, 10),
            };
        },

        utcMs(parts) {
            return Date.UTC(parts.year, parts.month - 1, parts.day, parts.h, parts.min, parts.s);
        },

        /** Offset of `zone` right now, in minutes, e.g. 210 for +03:30. */
        zoneOffsetMin(zone, date) {
            const z = this.zoneParts(zone, date);
            const u = this.zoneParts('UTC', date);
            return Math.round((this.utcMs(z) - this.utcMs(u)) / 60000);
        },

        offsetLabel(min) {
            const sign = min < 0 ? '-' : '+';
            const a = Math.abs(min);
            const hh = String(Math.floor(a / 60)).padStart(2, '0');
            const mm = String(a % 60).padStart(2, '0');
            return `GMT${sign}${hh}:${mm}`;
        },

        pad(n) {
            return String(n).padStart(2, '0');
        },

        // ---- Render ----
        render() {
            if (this.zones.length === 0) {
                this.elements.clocks.innerHTML = `<div class="empty-note">${I18N.t('wcl_empty').replace(/\n/g, '<br>')}</div>`;
                return;
            }
            const now = new Date();
            this.elements.clocks.innerHTML = this.zones.map((zone, i) => {
                const c = CITIES.find(x => x.id === zone);
                const p = this.zoneParts(zone, now);
                const off = this.zoneOffsetMin(zone, now);
                const name = c ? this.cityName(c) : zone;
                const flag = c ? c.flag : '🌐';
                return `
                    <div class="clock-row" data-i="${i}">
                        <span class="c-flag">${flag}</span>
                        <div class="clock-info">
                            <div class="c-name">${name}</div>
                            <div class="c-sub">${this.dateLabel(zone, now)}</div>
                        </div>
                        <div class="c-time">
                            <span class="c-time-main">${this.pad(p.h)}:${this.pad(p.min)}:${this.pad(p.s)}</span>
                            <span class="c-offset">${this.offsetLabel(off)}</span>
                        </div>
                        <button class="c-remove" data-i18n-title="wcl_close" title="Remove">✕</button>
                    </div>
                `;
            }).join('');

            this.elements.clocks.querySelectorAll('.clock-row').forEach(row => {
                const i = parseInt(row.dataset.i);
                row.querySelector('.c-remove').addEventListener('click', () => this.remove(i));
            });
        },

        dateLabel(zone, now) {
            const locale = I18N.current === 'fa' ? 'fa-IR' : (I18N.current === 'ar' ? 'ar-EG' : 'en-US');
            try {
                return new Intl.DateTimeFormat(locale, {
                    timeZone: zone, weekday: 'short', month: 'short', day: 'numeric',
                }).format(now);
            } catch (e) {
                return '';
            }
        },

        tick() {
            if (this.zones.length === 0) return;
            const now = new Date();
            this.elements.clocks.querySelectorAll('.clock-row').forEach(row => {
                const i = parseInt(row.dataset.i);
                const p = this.zoneParts(this.zones[i], now);
                const el = row.querySelector('.c-time-main');
                if (el) el.textContent = `${this.pad(p.h)}:${this.pad(p.min)}:${this.pad(p.s)}`;
            });
        },

        remove(i) {
            this.zones.splice(i, 1);
            Store.setJSON(NS, 'zones', this.zones);
            this.render();
            TG.haptic('light');
        },

        // ---- Picker ----
        openPicker() {
            this.elements.picker.classList.remove('hidden');
            this.elements.citySearch.value = '';
            this.renderPicker();
        },

        closePicker() {
            this.elements.picker.classList.add('hidden');
        },

        renderPicker() {
            const q = this.elements.citySearch.value.trim().toLowerCase();
            const items = CITIES.filter(c => {
                if (!q) return true;
                return c.en.toLowerCase().includes(q) || c.fa.includes(q) || c.ar.includes(q);
            });
            this.elements.pickerList.innerHTML = items.map(c => {
                const added = this.zones.includes(c.id);
                return `
                    <button type="button" class="city-opt${added ? ' added' : ''}" data-id="${c.id}">
                        <span class="co-flag">${c.flag}</span>
                        <span class="co-name">${this.cityName(c)}</span>
                        <span class="co-tz">${c.id.replace('_', ' ')}</span>
                    </button>
                `;
            }).join('');
            this.elements.pickerList.querySelectorAll('.city-opt').forEach(opt => {
                opt.addEventListener('click', () => this.toggleCity(opt.dataset.id));
            });
        },

        toggleCity(id) {
            const i = this.zones.indexOf(id);
            if (i >= 0) {
                this.zones.splice(i, 1);
            } else {
                this.zones.push(id);
                // Always keep your local zone at the top when added.
                this.zones.sort((a, b) => CITIES.findIndex(c => c.id === a) - CITIES.findIndex(c => c.id === b));
            }
            Store.setJSON(NS, 'zones', this.zones);
            this.renderPicker();
            this.render();
            TG.haptic('light');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();
