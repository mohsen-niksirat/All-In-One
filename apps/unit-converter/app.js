/**
 * app.js — Unit Converter (core layer, trilingual fa/en/ar).
 * Conversion math lives in the pure module converter.js.
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

    I18N.register('ar', {
        unit_title: 'محوّل الوحدات',
        unit_value: 'القيمة',
        unit_from: 'من',
        unit_to: 'إلى',
        unit_result: 'النتيجة',
        unit_swap: 'تبديل',
        unit_back: 'العودة إلى التطبيقات',
        unit_cat_length: 'الطول',
        unit_cat_weight: 'الوزن',
        unit_cat_temp: 'الحرارة',
        unit_cat_data: 'البيانات',
        unit_cat_speed: 'السرعة',
        unit_cat_time: 'الوقت',
    });

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
            this.elements.catTabs.innerHTML = Object.keys(UnitConverter.CATEGORIES).map(cat => {
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
            const cat = UnitConverter.CATEGORIES[this.category];
            const lang = I18N.current;
            const labelOf = u => `${UnitConverter.label(u, lang)} (${u.sym})`;

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
            const raw = parseFloat(this.elements.valueInput.value);

            if (isNaN(raw)) {
                this.elements.result.textContent = '—';
                return;
            }

            const result = UnitConverter.convert(
                this.category,
                raw,
                this.elements.fromSelect.value,
                this.elements.toSelect.value
            );

            this.elements.result.textContent = this.format(result);
        },

        format(n) {
            if (!isFinite(n)) return '∞';
            if (Object.is(n, -0)) n = 0;
            const locale = I18N.current === 'fa' ? 'fa-IR' : (I18N.current === 'ar' ? 'ar-EG' : 'en-US');
            return new Intl.NumberFormat(locale, { maximumSignificantDigits: 10 }).format(n);
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();