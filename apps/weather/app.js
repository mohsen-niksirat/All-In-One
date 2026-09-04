/**
 * app.js — Weather (Open-Meteo — free, no API key, CORS enabled).
 * Works from a static GitHub Pages host with zero configuration.
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        wea_title: 'آب‌وهوا',
        wea_back: 'بازگشت به لیست اپ‌ها',
        wea_city_ph: 'نام شهر... (مثلاً تهران)',
        wea_search: 'جستجو',
        wea_searching: 'در حال جستجو…',
        wea_no_city: 'شهری پیدا نشد. نام را کامل‌تر بنویسید.',
        wea_saved_locs: 'شهرهای ذخیره‌شده:',
        wea_feels: 'احساس:',
        wea_humidity: 'رطوبت:',
        wea_wind: 'باد:',
        wea_precip: 'بارش:',
        wea_err: 'خطا در دریافت آب‌وهوا — اتصال اینترنت را بررسی کنید',
        wea_updated: 'آخرین به‌روزرسانی: {time}',
        wea_cached: '⚠️ آفلاین — نمایش آخرین دادهٔ ذخیره‌شده',
        wea_stamp: 'ذخیره {time}',
        wea_c0: 'آسمان صاف',
        wea_c1: 'کمی ابری',
        wea_c2: 'نیمه‌ابری',
        wea_c3: 'ابری',
        wea_cf: 'مه‌آلود',
        wea_cd: 'باران ریز',
        wea_cr: 'بارانی',
        wea_cs: 'برفی',
        wea_ct: 'رعدوبرق',
    });

    I18N.register('en', {
        wea_title: 'Weather',
        wea_back: 'Back to apps',
        wea_city_ph: 'City name... (e.g. Tehran)',
        wea_search: 'Search',
        wea_searching: 'Searching…',
        wea_no_city: 'No city found. Try a fuller name.',
        wea_saved_locs: 'Saved places:',
        wea_feels: 'Feels like:',
        wea_humidity: 'Humidity:',
        wea_wind: 'Wind:',
        wea_precip: 'Rain:',
        wea_err: 'Could not load weather — check your connection',
        wea_updated: 'Last updated: {time}',
        wea_cached: '⚠️ Offline — showing last saved data',
        wea_stamp: 'saved {time}',
        wea_c0: 'Clear sky',
        wea_c1: 'Mostly clear',
        wea_c2: 'Partly cloudy',
        wea_c3: 'Overcast',
        wea_cf: 'Fog',
        wea_cd: 'Drizzle',
        wea_cr: 'Rain',
        wea_cs: 'Snow',
        wea_ct: 'Thunderstorm',
    });

    I18N.register('ar', {
        wea_title: 'الطقس',
        wea_back: 'العودة إلى التطبيقات',
        wea_city_ph: 'اسم المدينة... (مثل: طهران)',
        wea_search: 'بحث',
        wea_searching: 'جارٍ البحث…',
        wea_no_city: 'لم يتم العثور على مدينة. جرّب اسماً أكمل.',
        wea_saved_locs: 'الأماكن المحفوظة:',
        wea_feels: 'الإحساس:',
        wea_humidity: 'الرطوبة:',
        wea_wind: 'الرياح:',
        wea_precip: 'المطر:',
        wea_err: 'تعذّر تحميل الطقس — تحقق من اتصالك',
        wea_updated: 'آخر تحديث: {time}',
        wea_cached: '⚠️ دون اتصال — عرض آخر بيانات محفوظة',
        wea_stamp: 'محفوظ {time}',
        wea_c0: 'سماء صافية',
        wea_c1: 'صافٍ غالباً',
        wea_c2: 'غائم جزئياً',
        wea_c3: 'غائم كلياً',
        wea_cf: 'ضباب',
        wea_cd: 'رذاذ',
        wea_cr: 'ممطر',
        wea_cs: 'ثلجي',
        wea_ct: 'عاصفة رعدية',
    });

    const NS = 'weather';

    const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
    const FC = 'https://api.open-meteo.com/v1/forecast';

    const App = {
        saved: [],
        loading: false,

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                city: document.getElementById('city'),
                searchBtn: document.getElementById('search-btn'),
                status: document.getElementById('status'),
                suggest: document.getElementById('suggest'),
                saved: document.getElementById('saved'),
                forecast: document.getElementById('forecast'),
                locName: document.getElementById('loc-name'),
                curCond: document.getElementById('cur-cond'),
                curIcon: document.getElementById('cur-icon'),
                curTemp: document.getElementById('cur-temp'),
                curMeta: document.getElementById('cur-meta'),
                daily: document.getElementById('daily'),
                updated: document.getElementById('updated'),
            };

            this.saved = Store.getJSON(NS, 'saved', []);

            this.setupEvents();
            this.renderSaved();
            this.setStatus('');

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('wea_title');
                this.renderSaved();
                if (this.lastLoc) this.loadForecast(this.lastLoc, true);
            });
            document.title = I18N.t('wea_title');
        },

        setupEvents() {
            const search = () => this.search(this.elements.city.value.trim());
            this.elements.searchBtn.addEventListener('click', search);
            this.elements.city.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') search();
            });
        },

        // ---- Helpers ----
        setStatus(msg, isError) {
            this.elements.status.textContent = msg;
            this.elements.status.classList.toggle('error', Boolean(isError));
        },

        escape(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        locale() {
            if (I18N.current === 'fa') return 'fa-IR';
            if (I18N.current === 'ar') return 'ar-EG';
            return 'en-US';
        },

        fmt(n, digits) {
            try {
                return new Intl.NumberFormat(this.locale(), {
                    maximumFractionDigits: digits === undefined ? 0 : digits,
                }).format(n);
            } catch (e) {
                return String(n);
            }
        },

        // ---- Search ----
        async search(q) {
            if (this.loading || !q) return;
            if (typeof fetch !== 'function') {
                this.setStatus(I18N.t('wea_err'), true);
                return;
            }
            this.loading = true;
            this.elements.suggest.innerHTML = '';
            this.setStatus(I18N.t('wea_searching'));
            try {
                const url = `${GEO}?name=${encodeURIComponent(q)}&count=5&language=en&format=json`;
                const res = await fetch(url);
                const data = await res.json();
                const results = (data.results || []).slice(0, 5);
                if (results.length === 0) {
                    this.setStatus(I18N.t('wea_no_city'), true);
                    return;
                }
                this.setStatus('');
                this.elements.suggest.innerHTML = results.map(r => {
                    const region = [r.admin1, r.country].filter(Boolean).join(', ');
                    const label = region ? `${r.name} — ${region}` : r.name;
                    return `<button type="button" class="city-chip" data-name="${this.escape(r.name)}" data-lat="${r.latitude}" data-lon="${r.longitude}">${this.escape(label)}</button>`;
                }).join('');
                this.elements.suggest.querySelectorAll('.city-chip').forEach(chip => {
                    chip.addEventListener('click', () => {
                        this.elements.suggest.innerHTML = '';
                        const loc = { name: chip.dataset.name, lat: parseFloat(chip.dataset.lat), lon: parseFloat(chip.dataset.lon) };
                        this.saveLocation(loc);
                        this.loadForecast(loc);
                    });
                });
            } catch (e) {
                this.setStatus(I18N.t('wea_err'), true);
            } finally {
                this.loading = false;
            }
        },

        saveLocation(loc) {
            this.saved = this.saved.filter(s => s.lat !== loc.lat || s.lon !== loc.lon);
            this.saved.unshift(loc);
            this.saved = this.saved.slice(0, 4);
            Store.setJSON(NS, 'saved', this.saved);
            this.renderSaved();
        },

        renderSaved() {
            if (this.saved.length === 0) {
                this.elements.saved.innerHTML = '';
                return;
            }
            this.elements.saved.innerHTML =
                `<span class="saved-label">${I18N.t('wea_saved_locs')}</span>` +
                this.saved.map(s =>
                    `<button type="button" class="city-chip" data-i="${this.saved.indexOf(s)}">${this.escape(s.name)}</button>`
                ).join('');
            this.elements.saved.querySelectorAll('.city-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const s = this.saved[parseInt(chip.dataset.i)];
                    if (s) this.loadForecast(s);
                });
            });
        },

        // ---- Forecast ----
        /** Cloud-safe cache key for a location (no ':' or '.' — CloudStorage
         *  keys allow only [A-Za-z0-9_-]). */
        locKey(loc) {
            return 'cache-' + String(loc.lat).replace(/\./g, '_') + '-' + String(loc.lon).replace(/\./g, '_');
        },

        fmtTime(ts) {
            try {
                return new Date(ts).toLocaleTimeString(this.locale(), { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                return String(ts);
            }
        },

        showUpdated(ts) {
            if (!this.elements.updated) return;
            this.elements.updated.textContent = I18N.t('wea_updated', { time: this.fmtTime(ts) });
            this.elements.updated.classList.remove('hidden');
        },

        /**
         * Forecast with offline fallback: render the last saved snapshot
         * instantly, then refresh from the network when possible. When the
         * network is down, the saved data stays on screen with a note.
         */
        async loadForecast(loc, silent) {
            this.lastLoc = loc;
            const cacheKey = this.locKey(loc);
            const cached = Store.getJSON(NS, cacheKey);

            const apply = (data, ts, savedTs) => {
                this.elements.locName.textContent = loc.name;
                this.elements.forecast.classList.remove('hidden');
                this.renderCurrent(data.current);
                this.renderDaily(data.daily, savedTs);
                this.showUpdated(ts);
            };

            // Instant render from the last saved snapshot — works fully offline.
            if (cached && cached.data && cached.data.current && cached.data.daily) {
                apply(cached.data, cached.ts, cached.ts);
            }

            if (typeof fetch !== 'function') {
                if (!silent && !cached) this.setStatus(I18N.t('wea_err'), true);
                return;
            }
            if (!silent) this.setStatus(I18N.t('wea_searching'));
            try {
                const url = `${FC}?latitude=${loc.lat}&longitude=${loc.lon}` +
                    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
                    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
                    '&timezone=auto&forecast_days=7';
                const res = await fetch(url);
                if (!res.ok) throw new Error('http ' + res.status);
                const data = await res.json();
                if (!data.current || !data.daily) throw new Error('bad payload');
                const ts = Date.now();
                apply(data, ts, null);
                Store.setJSON(NS, cacheKey, { ts, data });
                if (!silent) {
                    this.setStatus('');
                    TG.haptic('light');
                }
            } catch (e) {
                if (!silent) {
                    // Keep the saved snapshot visible (if any) instead of an error.
                    this.setStatus(cached ? I18N.t('wea_cached') : I18N.t('wea_err'), true);
                }
            }
        },

        cond(code) {
            if (code === 0) return { key: 'wea_c0', icon: '☀️' };
            if (code === 1) return { key: 'wea_c1', icon: '🌤️' };
            if (code === 2) return { key: 'wea_c2', icon: '⛅' };
            if (code === 3) return { key: 'wea_c3', icon: '☁️' };
            if (code >= 45 && code <= 48) return { key: 'wea_cf', icon: '🌫️' };
            if (code >= 51 && code <= 57) return { key: 'wea_cd', icon: '🌦️' };
            if (code >= 61 && code <= 67) return { key: 'wea_cr', icon: '🌧️' };
            if (code >= 71 && code <= 77) return { key: 'wea_cs', icon: '🌨️' };
            if (code >= 80 && code <= 82) return { key: 'wea_cr', icon: '🌧️' };
            if (code >= 85 && code <= 86) return { key: 'wea_cs', icon: '🌨️' };
            if (code >= 95) return { key: 'wea_ct', icon: '⛈️' };
            return { key: 'wea_c0', icon: '☀️' };
        },

        renderCurrent(cur) {
            const c = this.cond(cur.weather_code);
            this.elements.curIcon.textContent = c.icon;
            this.elements.curCond.textContent = I18N.t(c.key);
            this.elements.curTemp.textContent = this.fmt(Math.round(cur.temperature_2m));
            const feels = this.fmt(Math.round(cur.apparent_temperature));
            const hum = this.fmt(Math.round(cur.relative_humidity_2m));
            const wind = this.fmt(Math.round(cur.wind_speed_10m));
            this.elements.curMeta.innerHTML = `
                <span class="meta-pill">${I18N.t('wea_feels')} ${feels}°C</span>
                <span class="meta-pill">${I18N.t('wea_humidity')} ${hum}%</span>
                <span class="meta-pill">${I18N.t('wea_wind')} ${wind} km/h</span>
            `;
        },

        renderDaily(daily, savedTs) {
            const weekdayFmt = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
            this.elements.daily.innerHTML = daily.time.map((dateStr, i) => {
                const c = this.cond(daily.weather_code[i]);
                const max = this.fmt(Math.round(daily.temperature_2m_max[i]));
                const min = this.fmt(Math.round(daily.temperature_2m_min[i]));
                const rain = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;
                const today = i === 0;
                const name = weekdayFmt.format(new Date(dateStr + 'T12:00:00'));
                const stamp = savedTs
                    ? `<span class="day-stamp">🕓 ${I18N.t('wea_stamp', { time: this.fmtTime(savedTs) })}</span>`
                    : '';
                return `
                    <div class="day-row">
                        <span class="day-name">${today ? '• ' : ''}${name}</span>
                        <span class="day-icon">${c.icon}</span>
                        ${rain >= 10 ? `<span class="day-rain">${I18N.t('wea_precip')} ${rain}%</span>` : '<span class="day-rain"></span>'}
                        <span class="day-temps"><span class="day-max">${max}°</span><span class="day-min">${min}°</span></span>
                        ${stamp}
                    </div>
                `;
            }).join('');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();
