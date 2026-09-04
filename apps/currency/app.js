/**
 * app.js — Currency (open.er-api.com — free, no key, CORS enabled, 160+ codes incl. IRR).
 * Rates are ECB/official-ish market reference rates updated daily.
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        cur_title: 'نرخ ارز',
        cur_back: 'بازگشت به لیست اپ‌ها',
        cur_amount_ph: 'مبلغ',
        cur_from_label: 'ارز مبدأ',
        cur_to_label: 'ارز مقصد',
        cur_swap: '⇄ جابه‌جایی',
        cur_convert: 'تبدیل',
        cur_converting: 'در حال دریافت نرخ…',
        cur_err: 'دریافت نرخ ناموفق بود — اتصال را بررسی کنید',
        cur_rate: '۱ {from} = {rate} {to}',
        cur_market: 'نرخ بازار و طلا',
        cur_market_usd: 'دلار آمریکا',
        cur_market_gold: 'اونس جهانی طلا',
        cur_market_refresh: '↻ تازه‌سازی',
        cur_updated: 'آخرین به‌روزرسانی: {time}',
        cur_cached: '⚠️ آفلاین — نمایش نرخ‌های ذخیره‌شده',
    });

    I18N.register('en', {
        cur_title: 'Currency',
        cur_back: 'Back to apps',
        cur_amount_ph: 'Amount',
        cur_from_label: 'From currency',
        cur_to_label: 'To currency',
        cur_swap: '⇄ Swap',
        cur_convert: 'Convert',
        cur_converting: 'Fetching rates…',
        cur_err: 'Could not fetch rates — check your connection',
        cur_rate: '1 {from} = {rate} {to}',
        cur_market: 'Market & gold',
        cur_market_usd: 'US Dollar',
        cur_market_gold: 'Global gold',
        cur_market_refresh: '↻ Refresh',
        cur_updated: 'Last updated: {time}',
        cur_cached: '⚠️ Offline — showing saved rates',
    });

    I18N.register('ar', {
        cur_title: 'أسعار العملات',
        cur_back: 'العودة إلى التطبيقات',
        cur_amount_ph: 'المبلغ',
        cur_from_label: 'العملة المصدر',
        cur_to_label: 'العملة الهدف',
        cur_swap: '⇄ تبديل',
        cur_convert: 'تحويل',
        cur_converting: 'جارٍ جلب الأسعار…',
        cur_err: 'تعذّر جلب الأسعار — تحقق من اتصالك',
        cur_rate: '1 {from} = {rate} {to}',
        cur_market: 'أسعار السوق والذهب',
        cur_market_usd: 'الدولار الأمريكي',
        cur_market_gold: 'الذهب العالمي',
        cur_market_refresh: '↻ تحديث',
        cur_updated: 'آخر تحديث: {time}',
        cur_cached: '⚠️ دون اتصال — عرض الأسعار المحفوظة',
    });

    const NS = 'currency';

    // Curated list: code → flag + English/common name (universally readable).
    const CURRENCIES = [
        ['USD', '🇺🇸 US Dollar'], ['EUR', '🇪🇺 Euro'], ['IRR', '🇮🇷 Iranian Rial'],
        ['GBP', '🇬🇧 British Pound'], ['TRY', '🇹🇷 Turkish Lira'], ['AED', '🇦🇪 UAE Dirham'],
        ['SAR', '🇸🇦 Saudi Riyal'], ['IQD', '🇮🇶 Iraqi Dinar'], ['AFN', '🇦🇫 Afghan Afghani'],
        ['PKR', '🇵🇰 Pakistani Rupee'], ['INR', '🇮🇳 Indian Rupee'], ['CNY', '🇨🇳 Chinese Yuan'],
        ['JPY', '🇯🇵 Japanese Yen'], ['KRW', '🇰🇷 South Korean Won'], ['RUB', '🇷🇺 Russian Ruble'],
        ['CAD', '🇨🇦 Canadian Dollar'], ['AUD', '🇦🇺 Australian Dollar'], ['CHF', '🇨🇭 Swiss Franc'],
        ['SEK', '🇸🇪 Swedish Krona'], ['NOK', '🇳🇴 Norwegian Krone'], ['BRL', '🇧🇷 Brazilian Real'],
        ['EGP', '🇪🇬 Egyptian Pound'], ['KWD', '🇰🇼 Kuwaiti Dinar'], ['QAR', '🇶🇦 Qatari Riyal'],
        ['MYR', '🇲🇾 Malaysian Ringgit'], ['AZN', '🇦🇿 Azerbaijani Manat'], ['AMD', '🇦🇲 Armenian Dram'],
        ['GEL', '🇬🇪 Georgian Lari'],
    ];

    // Popular pairs shown as quick chips.
    const QUICK = [['USD', 'IRR'], ['EUR', 'IRR'], ['USD', 'EUR'], ['USD', 'TRY'], ['AED', 'IRR'], ['GBP', 'USD']];

    const API = 'https://open.er-api.com/v6/latest';

    const App = {
        cache: {},          // base code → { rates, updated }
        fetching: false,

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                amount: document.getElementById('amount'),
                from: document.getElementById('from'),
                to: document.getElementById('to'),
                swap: document.getElementById('swap'),
                convertBtn: document.getElementById('convert-btn'),
                status: document.getElementById('status'),
                result: document.getElementById('result'),
                resFrom: document.getElementById('res-from'),
                resTo: document.getElementById('res-to'),
                resRate: document.getElementById('res-rate'),
                quick: document.getElementById('quick'),
                market: document.getElementById('market'),
                mUsd: document.getElementById('m-usd'),
                mXau: document.getElementById('m-xau'),
                mXauIrr: document.getElementById('m-xau-irr'),
                mRefresh: document.getElementById('m-refresh'),
                mUpdated: document.getElementById('m-updated'),
            };
            this.elements.market.loading = false;

            const last = Store.getJSON(NS, 'last', { from: 'USD', to: 'IRR' });
            this.fillSelect(this.elements.from, last.from);
            this.fillSelect(this.elements.to, last.to);
            this.elements.amount.value = '1';

            this.setupEvents();
            this.renderQuick();

            this.elements.mRefresh.addEventListener('click', () => this.marketRefresh());
            this.marketRefresh();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('cur_title');
                if (this.lastShown) this.showResult(this.lastShown);
            });
            document.title = I18N.t('cur_title');
        },

        fillSelect(select, code) {
            select.innerHTML = CURRENCIES.map(([c, label]) =>
                `<option value="${c}"${c === code ? ' selected' : ''}>${label}</option>`
            ).join('');
        },

        setupEvents() {
            this.elements.convertBtn.addEventListener('click', () => this.convert());
            this.elements.amount.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.convert();
            });
            this.elements.swap.addEventListener('click', () => {
                const a = this.elements.from.value;
                this.elements.from.value = this.elements.to.value;
                this.elements.to.value = a;
                this.elements.result.classList.add('hidden');
                this.saveLast();
                TG.haptic('light');
                this.convert();
            });
            this.elements.from.addEventListener('change', () => this.saveLast());
            this.elements.to.addEventListener('change', () => this.saveLast());
        },

        saveLast() {
            Store.setJSON(NS, 'last', {
                from: this.elements.from.value,
                to: this.elements.to.value,
            });
        },

        // ---- Helpers ----
        setStatus(msg, isError) {
            this.elements.status.textContent = msg;
            this.elements.status.classList.toggle('error', Boolean(isError));
        },

        locale() {
            if (I18N.current === 'fa') return 'fa-IR';
            if (I18N.current === 'ar') return 'ar-EG';
            return 'en-US';
        },

        fmt(n, digits) {
            try {
                return new Intl.NumberFormat(this.locale(), {
                    maximumFractionDigits: digits === undefined ? 2 : digits,
                }).format(n);
            } catch (e) {
                return String(n);
            }
        },

        fmtRate(n) {
            // Large rates (IRR) need fewer decimals; small ones more.
            if (n >= 1000) return this.fmt(n, 0);
            if (n >= 1) return this.fmt(n, 4);
            return this.fmt(n, 6);
        },

        // ---- Conversion ----
        /**
         * Rates with offline fallback: fetch live, persist to Store on success,
         * and fall back to the last saved snapshot when offline. Session cache
         * (30 min) avoids hammering the API on every tap.
         */
        async fetchRates(base) {
            const KEY = 'rates-' + base;
            const sess = this.cache[base];
            if (sess && Date.now() - (sess.fetchedAt || 0) < 30 * 60 * 1000) return sess;

            if (typeof fetch === 'function') {
                try {
                    const res = await fetch(`${API}/${base}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.result === 'success' && data.rates) {
                            const entry = {
                                rates: data.rates,
                                updated: data.time_last_update_utc || '',
                                fetchedAt: Date.now(),
                            };
                            this.cache[base] = entry;
                            if (this.savedTs) delete this.savedTs[base];
                            Store.setJSON(NS, KEY, { ts: Date.now(), entry });
                            return entry;
                        }
                    }
                } catch (e) {
                    // offline — fall back to the last saved snapshot
                }
            }

            const saved = Store.getJSON(NS, KEY);
            if (saved && saved.entry && saved.entry.rates) {
                saved.entry.fetchedAt = Date.now(); // fresh for this session
                this.cache[base] = saved.entry;
                this.savedTs = this.savedTs || {};
                this.savedTs[base] = saved.ts || 0;
                return saved.entry;
            }
            throw new Error('no rates');
        },

        async convert(silent) {
            const amount = parseFloat(this.elements.amount.value);
            if (isNaN(amount) || amount < 0) {
                this.setStatus(I18N.t('cur_err'), true);
                return;
            }
            if (this.fetching) return;
            const from = this.elements.from.value;
            const to = this.elements.to.value;
            this.fetching = true;
            this.saveLast();
            if (!silent) this.setStatus(I18N.t('cur_converting'));
            this.elements.result.classList.add('hidden');
            try {
                const entry = await this.fetchRates(from);
                const rate = entry.rates[to];
                if (!rate) throw new Error('no target');
                this.showResult({ from, to, amount, rate, value: amount * rate });
                this.setStatus(this.savedTs && this.savedTs[from]
                    ? I18N.t('cur_cached')
                    : '');
                if (!silent) TG.haptic('light');
            } catch (e) {
                this.setStatus(I18N.t('cur_err'), true);
            } finally {
                this.fetching = false;
            }
        },

        showResult(r) {
            this.lastShown = r;
            this.elements.result.classList.remove('hidden');
            this.elements.resFrom.textContent = `${this.fmt(r.amount)} ${r.from}`;
            this.elements.resTo.textContent = `${this.fmt(r.value)} ${r.to}`;
            this.elements.resRate.textContent = I18N.t('cur_rate', {
                from: r.from, rate: this.fmtRate(r.rate), to: r.to,
            });
        },

        // ---- Market ticker (USD/IRR + XAU via free APIs) ----
        async marketRefresh() {
            const els = this.elements;
            if (els.market.loading) return;
            els.market.loading = true;
            els.market.classList.remove('hidden');
            ['mUsd', 'mXau', 'mXauIrr'].forEach(k => {
                els[k].textContent = '…';
                els[k].classList.add('loading');
            });
            try {
                // Gold spot (USD per troy ounce) — free, no key, CORS enabled.
                // Fetched separately so a gold outage never kills the FX panel.
                let gold = null;
                if (typeof fetch === 'function') {
                    try {
                        gold = await fetch('https://api.gold-api.com/price/XAU').then(r => r.json());
                    } catch (e) {
                        gold = null;
                    }
                }
                const fx = await this.fetchRates('USD');
                const usdIrr = fx.rates.IRR;
                if (!usdIrr) throw new Error('no IRR');

                const snapshot = { ts: Date.now(), usdIrr, goldUsd: gold && gold.price ? gold.price : null };
                Store.setJSON(NS, 'market', snapshot);
                this.showMarket(snapshot.usdIrr, snapshot.goldUsd, snapshot.ts);
            } catch (e) {
                // Offline → last saved market snapshot (stale but useful).
                const saved = Store.getJSON(NS, 'market');
                if (saved && saved.usdIrr) {
                    this.showMarket(saved.usdIrr, saved.goldUsd || null, saved.ts || 0);
                } else {
                    els.market.classList.add('hidden');
                }
            } finally {
                els.market.loading = false;
                ['mUsd', 'mXau', 'mXauIrr'].forEach(k => els[k].classList.remove('loading'));
            }
        },

        showMarket(usdIrr, goldUsd, ts) {
            const els = this.elements;
            els.mUsd.textContent = `1 USD = ${this.fmtRate(usdIrr)} IRR`;
            if (goldUsd) {
                els.mXau.textContent = `1 oz = $${this.fmt(goldUsd, 0)}`;
                els.mXauIrr.textContent = `1 oz = ${this.fmt(goldUsd * usdIrr, 0)} IRR`;
            }
            if (ts && els.mUpdated) {
                const t = new Date(ts).toLocaleTimeString(this.locale(), { hour: '2-digit', minute: '2-digit' });
                els.mUpdated.textContent = I18N.t('cur_updated', { time: t });
                els.mUpdated.classList.remove('hidden');
            }
        },

        renderQuick() {
            this.elements.quick.innerHTML = QUICK.map(([a, b], i) =>
                `<button type="button" class="q-chip" data-i="${i}">${a} → ${b}</button>`
            ).join('');
            this.elements.quick.classList.remove('hidden');
            this.elements.quick.querySelectorAll('.q-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const [a, b] = QUICK[parseInt(chip.dataset.i)];
                    this.elements.from.value = a;
                    this.elements.to.value = b;
                    this.elements.amount.value = '1';
                    this.saveLast();
                    this.convert();
                    TG.haptic('light');
                });
            });
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();
