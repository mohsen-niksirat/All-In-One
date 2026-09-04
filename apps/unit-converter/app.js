/**
 * app.js — Unit Converter (core layer, bilingual).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        unit_title: 'تبدیل واحد',
        unit_value: 'مقدار',
        unit_from: 'از',
        unit_to: 'به',
        unit_result: 'نتیجه',
        unit_swap: 'جابه‌جایی',
        unit_back: 'بازگشت به لیست اپ‌ها',
        unit_cat_length: 'طول',
        unit_cat_weight: 'وزن',
        unit_cat_temp: 'دما',
        unit_cat_data: 'داده',
        unit_cat_speed: 'سرعت',
        unit_cat_time: 'زمان',
    });

    I18N.register('en', {
        unit_title: 'Unit Converter',
        unit_value: 'Value',
        unit_from: 'From',
        unit_to: 'To',
        unit_result: 'Result',
        unit_swap: 'Swap',
        unit_back: 'Back to apps',
        unit_cat_length: 'Length',
        unit_cat_weight: 'Weight',
        unit_cat_temp: 'Temperature',
        unit_cat_data: 'Data',
        unit_cat_speed: 'Speed',
        unit_cat_time: 'Time',
    });

    // ---- Units ----
    // factor: multiply to convert to the category's base unit
    const CATEGORIES = {
        length: {
            units: [
                { id: 'mm', fa: 'میلی‌متر', en: 'Millimeter', sym: 'mm', factor: 0.001 },
                { id: 'cm', fa: 'سانتی‌متر', en: 'Centimeter', sym: 'cm', factor: 0.01 },
                { id: 'm', fa: 'متر', en: 'Meter', sym: 'm', factor: 1 },
                { id: 'km', fa: 'کیلومتر', en: 'Kilometer', sym: 'km', factor: 1000 },
                { id: 'in', fa: 'اینچ', en: 'Inch', sym: 'in', factor: 0.0254 },
                { id: 'ft', fa: 'فوت', en: 'Foot', sym: 'ft', factor: 0.3048 },
                { id: 'yd', fa: 'یارد', en: 'Yard', sym: 'yd', factor: 0.9144 },
                { id: 'mi', fa: 'مایل', en: 'Mile', sym: 'mi', factor: 1609.344 },
            ],
        },
        weight: {
            units: [
                { id: 'mg', fa: 'میلی‌گرم', en: 'Milligram', sym: 'mg', factor: 1e-6 },
                { id: 'g', fa: 'گرم', en: 'Gram', sym: 'g', factor: 0.001 },
                { id: 'kg', fa: 'کیلوگرم', en: 'Kilogram', sym: 'kg', factor: 1 },
                { id: 'ton', fa: 'تن', en: 'Tonne', sym: 't', factor: 1000 },
                { id: 'lb', fa: 'پوند', en: 'Pound', sym: 'lb', factor: 0.45359237 },
                { id: 'oz', fa: 'اونس', en: 'Ounce', sym: 'oz', factor: 0.028349523125 },
            ],
        },
        temp: {
            // special-cased conversions (Celsius base)
            units: [
                { id: 'c', fa: 'سلسیوس', en: 'Celsius', sym: '°C', temp: true },
                { id: 'f', fa: 'فارنهایت', en: 'Fahrenheit', sym: '°F', temp: true },
                { id: 'k', fa: 'کلوین', en: 'Kelvin', sym: 'K', temp: true },
            ],
            toBase: { c: x => x, f: x => (x - 32) * 5 / 9, k: x => x - 273.15 },
            fromBase: { c: x => x, f: x => x * 9 / 5 + 32, k: x => x + 273.15 },
        },
        data: {
            units: [
                { id: 'b', fa: 'بیت', en: 'Bit', sym: 'bit', factor: 0.125 },
                { id: 'B', fa: 'بایت', en: 'Byte', sym: 'B', factor: 1 },
                { id: 'KB', fa: 'کیلوبایت', en: 'Kilobyte', sym: 'KB', factor: 1024 },
                { id: 'MB', fa: 'مگابایت', en: 'Megabyte', sym: 'MB', factor: 1024 ** 2 },
                { id: 'GB', fa: 'گیگابایت', en: 'Gigabyte', sym: 'GB', factor: 1024 ** 3 },
                { id: 'TB', fa: 'ترابایت', en: 'Terabyte', sym: 'TB', factor: 1024 ** 4 },
            ],
        },
        speed: {
            units: [
                { id: 'ms', fa: 'متر بر ثانیه', en: 'Meter/sec', sym: 'm/s', factor: 1 },
                { id: 'kmh', fa: 'کیلومتر بر ساعت', en: 'Km/hour', sym: 'km/h', factor: 1 / 3.6 },
                { id: 'mph', fa: 'مایل بر ساعت', en: 'Mile/hour', sym: 'mph', factor: 0.44704 },
                { id: 'knot', fa: 'گره', en: 'Knot', sym: 'kn', factor: 0.514444 },
            ],
        },
        time: {
            units: [
                { id: 'ms', fa: 'میلی‌ثانیه', en: 'Millisecond', sym: 'ms', factor: 0.001 },
                { id: 's', fa: 'ثانیه', en: 'Second', sym: 's', factor: 1 },
                { id: 'min', fa: 'دقیقه', en: 'Minute', sym: 'min', factor: 60 },
                { id: 'h', fa: 'ساعت', en: 'Hour', sym: 'h', factor: 3600 },
                { id: 'day', fa: 'روز', en: 'Day', sym: 'd', factor: 86400 },
                { id: 'week', fa: 'هفته', en: 'Week', sym: 'wk', factor: 604800 },
            ],
        },
    };

    const App = {
        category: 'length',

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                catTabs: document.getElementById('cat-tabs'),
                valueInput: document.getElementById('value-input'),
                fromSelect: document.getElementById('from-select'),
                toSelect: document.getElementById('to-select'),
                swapBtn: document.getElementById('swap-btn'),
                result: document.getElementById('result'),
            };

            this.renderCategoryTabs();
            this.renderUnitSelects();
            this.convert();

            this.elements.valueInput.addEventListener('input', () => this.convert());
            this.elements.fromSelect.addEventListener('change', () => this.convert());
            this.elements.toSelect.addEventListener('change', () => this.convert());

            this.elements.swapBtn.addEventListener('click', () => {
                const from = this.elements.fromSelect.value;
                this.elements.fromSelect.value = this.elements.toSelect.value;
                this.elements.toSelect.value = from;
                this.convert();
                TG.haptic('light');
            });

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('unit_title');
                this.renderCategoryTabs();
                this.renderUnitSelects();
                this.convert();
            });
            document.title = I18N.t('unit_title');
        },

        renderCategoryTabs() {
            this.elements.catTabs.innerHTML = Object.keys(CATEGORIES).map(cat => {
                const label = I18N.t('unit_cat_' + cat);
                return `<button class="cat-tab${cat === this.category ? ' active' : ''}" data-cat="${cat}">${label}</button>`;
            }).join('');

            this.elements.catTabs.querySelectorAll('.cat-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    this.category = tab.dataset.cat;
                    this.renderCategoryTabs();
                    this.renderUnitSelects();
                    this.convert();
                    TG.haptic('light');
                });
            });
        },

        renderUnitSelects() {
            const cat = CATEGORIES[this.category];
            const lang = I18N.current;
            const labelOf = u => `${lang === 'fa' ? u.fa : u.en} (${u.sym})`;

            const opts = cat.units.map(u =>
                `<option value="${u.id}">${labelOf(u)}</option>`
            ).join('');

            const prevFrom = this.elements.fromSelect.value;
            const prevTo = this.elements.toSelect.value;

            this.elements.fromSelect.innerHTML = opts;
            this.elements.toSelect.innerHTML = opts;

            // Try to keep the same units when switching category
            this.elements.fromSelect.value = cat.units.some(u => u.id === prevFrom) ? prevFrom : cat.units[0].id;
            this.elements.toSelect.value = cat.units.some(u => u.id === prevTo) ? prevTo : cat.units[1]?.id || cat.units[0].id;
        },

        convert() {
            const cat = CATEGORIES[this.category];
            const raw = parseFloat(this.elements.valueInput.value);

            if (isNaN(raw)) {
                this.elements.result.textContent = '—';
                return;
            }

            const from = this.elements.fromSelect.value;
            const to = this.elements.toSelect.value;
            let result;

            if (cat.temp) {
                // Temperature: special formulas (Celsius is the base)
                const base = cat.toBase[from](raw);
                result = cat.fromBase[to](base);
            } else {
                const fromUnit = cat.units.find(u => u.id === from);
                const toUnit = cat.units.find(u => u.id === to);
                result = (raw * fromUnit.factor) / toUnit.factor;
            }

            this.elements.result.textContent = this.format(result);
        },

        format(n) {
            if (!isFinite(n)) return '∞';
            if (Object.is(n, -0)) n = 0;
            const locale = I18N.current === 'fa' ? 'fa-IR' : 'en-US';
            return new Intl.NumberFormat(locale, { maximumSignificantDigits: 10 }).format(n);
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();