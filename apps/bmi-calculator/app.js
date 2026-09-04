/**
 * app.js — BMI Calculator (core layer, bilingual).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        bmi_title: 'محاسبه BMI',
        bmi_height: 'قد',
        bmi_weight: 'وزن',
        bmi_cm: 'سانتی‌متر',
        bmi_kg: 'کیلوگرم',
        bmi_calc: 'محاسبه',
        bmi_result: 'شاخص توده بدنی',
        bmi_underweight: 'کمبود وزن',
        bmi_normal: 'نرمال',
        bmi_overweight: 'اضافه وزن',
        bmi_obese: 'چاقی',
        bmi_history: 'تاریخچه',
        bmi_empty: 'هنوز محاسبه‌ای نشده',
        bmi_clear: 'پاک کردن',
        bmi_invalid: 'مقدار معتبر وارد کنید',
        bmi_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        bmi_title: 'BMI Calculator',
        bmi_height: 'Height',
        bmi_weight: 'Weight',
        bmi_cm: 'cm',
        bmi_kg: 'kg',
        bmi_calc: 'Calculate',
        bmi_result: 'Body Mass Index',
        bmi_underweight: 'Underweight',
        bmi_normal: 'Normal',
        bmi_overweight: 'Overweight',
        bmi_obese: 'Obese',
        bmi_history: 'History',
        bmi_empty: 'No calculations yet',
        bmi_clear: 'Clear',
        bmi_invalid: 'Enter valid values',
        bmi_back: 'Back to apps',
    });

    I18N.register('ar', {
        bmi_title: 'حاسبة كتلة الجسم',
        bmi_height: 'الطول',
        bmi_weight: 'الوزن',
        bmi_cm: 'سم',
        bmi_kg: 'كغ',
        bmi_calc: 'احسب',
        bmi_result: 'مؤشر كتلة الجسم',
        bmi_underweight: 'نقص وزن',
        bmi_normal: 'طبيعي',
        bmi_overweight: 'زيادة وزن',
        bmi_obese: 'سمنة',
        bmi_history: 'السجل',
        bmi_empty: 'لا حسابات بعد',
        bmi_clear: 'مسح',
        bmi_invalid: 'أدخل قيماً صحيحة',
        bmi_back: 'العودة إلى التطبيقات',
    });

    const NS = 'bmi-calculator';

    const CATEGORIES = [
        { max: 18.5, key: 'bmi_underweight', color: 'var(--warning-color)' },
        { max: 25, key: 'bmi_normal', color: 'var(--success-color)' },
        { max: 30, key: 'bmi_overweight', color: 'var(--warning-color)' },
        { max: Infinity, key: 'bmi_obese', color: 'var(--danger-color)' },
    ];

    const App = {
        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                height: document.getElementById('height-input'),
                weight: document.getElementById('weight-input'),
                calcBtn: document.getElementById('calc-btn'),
                resultBox: document.getElementById('result-box'),
                bmiValue: document.getElementById('bmi-value'),
                bmiCategory: document.getElementById('bmi-category'),
                marker: document.getElementById('bmi-marker'),
                historyList: document.getElementById('history-list'),
                clearHistory: document.getElementById('clear-history'),
            };

            this.setupEvents();
            this.renderHistory();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('bmi_title');
                this.renderHistory();
                // Re-render category label if a result is showing
                if (!this.elements.resultBox.classList.contains('hidden') && this.lastBmi != null) {
                    this.renderResult(this.lastBmi);
                }
            });
            document.title = I18N.t('bmi_title');
        },

        setupEvents() {
            this.elements.calcBtn.addEventListener('click', () => this.calculate());
            // Enter key on either input calculates
            [this.elements.height, this.elements.weight].forEach(input => {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') this.calculate();
                });
            });

            this.elements.clearHistory.addEventListener('click', () => {
                Store.remove(NS, 'history');
                this.renderHistory();
                TG.haptic('light');
            });
        },

        calculate() {
            const h = parseFloat(this.elements.height.value);
            const w = parseFloat(this.elements.weight.value);

            if (!h || !w || h < 30 || h > 300 || w < 10 || w > 500) {
                TG.toast(I18N.t('bmi_invalid'), 'error');
                TG.haptic('error');
                return;
            }

            const bmi = w / Math.pow(h / 100, 2);
            this.renderResult(bmi);

            // Save history
            const history = Store.getJSON(NS, 'history', []);
            history.unshift({ bmi: Math.round(bmi * 10) / 10, ts: Date.now() });
            Store.setJSON(NS, 'history', history.slice(0, 10));
            this.renderHistory();
            TG.haptic('medium');
        },

        renderResult(bmi) {
            this.lastBmi = bmi;
            this.elements.resultBox.classList.remove('hidden');

            const cat = CATEGORIES.find(c => bmi < c.max);
            const bmiText = I18N.current === 'fa'
                ? new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(bmi)
                : bmi.toFixed(1);

            this.elements.bmiValue.textContent = bmiText;
            this.elements.bmiCategory.textContent = I18N.t(cat.key);
            this.elements.bmiCategory.style.color = cat.color;

            // Marker position: 12 → 40 (BMI 12-40 spans the bar)
            const clamped = Math.min(40, Math.max(12, bmi));
            const pct = ((clamped - 12) / (40 - 12)) * 100;
            this.elements.marker.style.left = pct + '%';
        },

        renderHistory() {
            const history = Store.getJSON(NS, 'history', []);
            if (history.length === 0) {
                this.elements.historyList.innerHTML =
                    `<div class="empty-note">${I18N.t('bmi_empty')}</div>`;
                return;
            }
            this.elements.historyList.innerHTML = history.map(h => {
                const bmiText = I18N.current === 'fa'
                    ? new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(h.bmi)
                    : h.bmi.toFixed(1);
                return `
                    <div class="history-item">
                        <span class="bmi">${bmiText}</span>
                        <span class="time">${Store.time(h.ts)}</span>
                    </div>
                `;
            }).join('');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();