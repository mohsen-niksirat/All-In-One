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
        cur_swap: '⇄ جابه‌جایی',
        cur_convert: 'تبدیل',
        cur_converting: 'در حال دریافت نرخ…',
        cur_err: 'دریافت نرخ ناموفق بود — اتصال را بررسی کنید',
        cur_rate: '۱ {from} = {rate} {to}',
        cur_market: 'نرخ بازار و طلا',
        cur_market_usd: 'دلار آمریکا',
        cur_market_gold: 'اونس جهانی طلا',
        cur_market_refresh: '↻ تازه‌سازی',
    });

    I18N.register('en', {
        cur_title: 'Currency',
        cur_back: 'Back to apps',
        cur_amount_ph: 'Amount',
        cur_swap: '⇄ Swap',
        cur_convert: 'Convert',
        cur_converting: 'Fetching rates…',
        cur_err: 'Could not fetch rates — check your connection',
        cur_rate: '1 {from} = {rate} {to}',
        cur_market: 'Market & gold',
        cur_market_usd: 'US Dollar',
        cur_market_gold: 'Global gold',
        cur_market_refresh: '↻ Refresh',
    });

    I18N.register('ar', {
        cur_title: 'أسعار العملات',
        cur_back: 'العودة إلى التطبيقات',
        cur_amount_ph: 'المبلغ',
        cur_swap: '⇄ تبديل',
        cur_convert: 'تحويل',
        cur_converting: 'جارٍ جلب الأسعار…',
        cur_err: 'تعذّر جلب الأسعار — تحقق من اتصالك',
        cur_rate: '1 {from} = {rate} {to}',
        cur_market: 'أسعار السوق والذهب',
        cur_market_usd: 'الدولار الأمريكي',
        cur_market_gold: 'الذهب العالمي',
        cur_market_refresh: '↻ تحديث',
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
        async fetchRates(base) {
            if (this.cache[base]) return this.cache[base];
            if (typeof fetch !== 'function') throw new Error('no fetch');
            const res = await fetch(`${API}/${base}`);
            if (!res.ok) throw new Error('http ' + res.status);
            const data = await res.json();
            if (data.result !== 'success' || !data.rates) throw new Error('bad payload');
            const entry = { rates: data.rates, updated: data.time_last_update_utc || '' };
            this.cache[base] = entry;
            return entry;
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
                this.setStatus('');
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
                const [fx, gold] = await Promise.all([
                    this.fetchRates('USD'),
                    typeof fetch === 'function'
                        ? fetch('https://api.gold-api.com/price/XAU').then(r => r.json())
                        : Promise.resolve(null),
                ]);
                const usdIrr = fx.rates.IRR;
                const goldUsd = gold && gold.price ? gold.price : null;
                if (!usdIrr) throw new Error('no IRR');

                els.mUsd.textContent = `1 USD = ${this.fmtRate(usdIrr)} IRR`;
                if (goldUsd) {
                    els.mXau.textContent = `1 oz = $${this.fmt(goldUsd, 0)}`;
                    els.mXauIrr.textContent = `1 oz = ${this.fmt(goldUsd * usdIrr, 0)} IRR`;
                }
            } catch (e) {
                els.market.classList.add('hidden');
            } finally {
                els.market.loading = false;
                ['mUsd', 'mXau', 'mXauIrr'].forEach(k => els[k].classList.remove('loading'));
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
