/**
 * app.js — Expense Tracker (core layer, trilingual fa/en/ar).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        exp_title: 'مدیریت هزینه',
        exp_amount: 'مبلغ',
        exp_note: 'توضیح (اختیاری)',
        exp_add: 'افزودن',
        exp_month_total: 'جمع این ماه',
        exp_categories: 'دسته‌بندی',
        exp_list: 'هزینه‌ها',
        exp_count: '{n} هزینه',
        exp_empty: 'هنوز هزینه‌ای ثبت نشده',
        exp_clear: 'پاک کردن همه',
        exp_cat_food: 'خوراک',
        exp_cat_transport: 'حمل‌ونقل',
        exp_cat_shopping: 'خرید',
        exp_cat_bills: 'قبض‌ها',
        exp_cat_fun: 'تفریح',
        exp_cat_health: 'سلامت',
        exp_cat_other: 'سایر',
        exp_clear_confirm: 'همه‌ی هزینه‌ها پاک شوند؟',
        exp_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        exp_title: 'Expense Tracker',
        exp_amount: 'Amount',
        exp_note: 'Note (optional)',
        exp_add: 'Add',
        exp_month_total: 'This month',
        exp_categories: 'By category',
        exp_list: 'Expenses',
        exp_count: '{n} expenses',
        exp_empty: 'No expenses yet',
        exp_clear: 'Clear all',
        exp_cat_food: 'Food',
        exp_cat_transport: 'Transport',
        exp_cat_shopping: 'Shopping',
        exp_cat_bills: 'Bills',
        exp_cat_fun: 'Fun',
        exp_cat_health: 'Health',
        exp_cat_other: 'Other',
        exp_clear_confirm: 'Clear all expenses?',
        exp_back: 'Back to apps',
    });

    I18N.register('ar', {
        exp_title: 'متتبّع المصاريف',
        exp_amount: 'المبلغ',
        exp_note: 'ملاحظة (اختياري)',
        exp_add: 'إضافة',
        exp_month_total: 'إجمالي هذا الشهر',
        exp_categories: 'حسب الفئة',
        exp_list: 'المصاريف',
        exp_count: '{n} مصروفاً',
        exp_empty: 'لا مصاريف بعد',
        exp_clear: 'مسح الكل',
        exp_cat_food: 'طعام',
        exp_cat_transport: 'نقل',
        exp_cat_shopping: 'تسوق',
        exp_cat_bills: 'فواتير',
        exp_cat_fun: 'ترفيه',
        exp_cat_health: 'صحة',
        exp_cat_other: 'أخرى',
        exp_clear_confirm: 'مسح كل المصاريف؟',
        exp_back: 'العودة إلى التطبيقات',
    });

    const NS = 'expense-tracker';

    const CATEGORIES = [
        { id: 'food', icon: '🍔' },
        { id: 'transport', icon: '🚕' },
        { id: 'shopping', icon: '🛍️' },
        { id: 'bills', icon: '🧾' },
        { id: 'fun', icon: '🎮' },
        { id: 'health', icon: '💊' },
        { id: 'other', icon: '📦' },
    ];

    const App = {
        expenses: [],

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.expenses = Store.getJSON(NS, 'expenses', []);

            this.elements = {
                amount: document.getElementById('amount-input'),
                category: document.getElementById('category-select'),
                note: document.getElementById('note-input'),
                addBtn: document.getElementById('add-btn'),
                monthTotal: document.getElementById('month-total'),
                monthCount: document.getElementById('month-count'),
                chart: document.getElementById('chart'),
                chartBars: document.getElementById('chart-bars'),
                list: document.getElementById('expense-list'),
                clearAll: document.getElementById('clear-all'),
            };

            this.setupEvents();
            this.renderCategories();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('exp_title');
                this.renderCategories();
                this.render();
            });
            document.title = I18N.t('exp_title');
        },

        setupEvents() {
            const add = () => {
                const amount = parseFloat(this.elements.amount.value);
                if (!amount || amount <= 0) {
                    TG.toast(I18N.t('exp_amount') + ' ⚠️', 'error');
                    TG.haptic('error');
                    return;
                }
                this.expenses.push({
                    id: Store.id(),
                    amount: Math.round(amount * 100) / 100,
                    category: this.elements.category.value,
                    note: this.elements.note.value.trim(),
                    ts: Date.now(),
                });
                this.elements.amount.value = '';
                this.elements.note.value = '';
                this.save();
                this.render();
                TG.haptic('light');
            };
            this.elements.addBtn.addEventListener('click', add);
            this.elements.amount.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') add();
            });

            this.elements.clearAll.addEventListener('click', async () => {
                const ok = await TG.confirm(I18N.t('exp_clear_confirm'));
                if (ok) {
                    this.expenses = [];
                    this.save();
                    this.render();
                    TG.haptic('medium');
                }
            });
        },

        save() {
            Store.setJSON(NS, 'expenses', this.expenses);
        },

        renderCategories() {
            this.elements.category.innerHTML = CATEGORIES.map(c =>
                `<option value="${c.id}">${c.icon} ${I18N.t('exp_cat_' + c.id)}</option>`
            ).join('');
        },

        // ---- Monthly stats ----
        monthKey(ts) {
            const d = new Date(ts);
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        },

        thisMonth() {
            return this.monthKey(Date.now());
        },

        render() {
            const month = this.thisMonth();
            const monthItems = this.expenses.filter(e => this.monthKey(e.ts) === month);
            const total = monthItems.reduce((s, e) => s + e.amount, 0);
            const allTotal = this.expenses.reduce((s, e) => s + e.amount, 0);

            this.elements.monthTotal.textContent = this.formatNumber(total);
            this.elements.monthCount.textContent = I18N.t('exp_count', { n: monthItems.length });

            // Category chart (current month)
            const byCat = {};
            monthItems.forEach(e => {
                byCat[e.category] = (byCat[e.category] || 0) + e.amount;
            });
            const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
            const max = entries[0]?.[1] || 1;

            if (entries.length > 0) {
                this.elements.chart.classList.remove('hidden');
                this.elements.chartBars.innerHTML = entries.map(([catId, amt]) => {
                    const cat = CATEGORIES.find(c => c.id === catId);
                    return `
                        <div class="chart-row">
                            <span class="chart-label">${cat.icon} ${I18N.t('exp_cat_' + catId)}</span>
                            <div class="chart-track"><div class="chart-fill" style="width:${Math.round((amt / max) * 100)}%"></div></div>
                            <span class="chart-amount">${this.formatNumber(amt)}</span>
                        </div>
                    `;
                }).join('');
            } else {
                this.elements.chart.classList.add('hidden');
            }

            // Expense list (latest first, newest on top)
            if (this.expenses.length === 0) {
                this.elements.list.innerHTML = `<div class="empty-note">${I18N.t('exp_empty')}</div>`;
                return;
            }
            const sorted = [...this.expenses].sort((a, b) => b.ts - a.ts);
            this.elements.list.innerHTML = sorted.map(e => {
                const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[CATEGORIES.length - 1];
                return `
                    <div class="expense-item" data-id="${e.id}">
                        <span class="cat-icon">${cat.icon}</span>
                        <div class="exp-info">
                            <div class="exp-note">${e.note || I18N.t('exp_cat_' + cat.id)}</div>
                            <div class="exp-date">${Store.time(e.ts)}</div>
                        </div>
                        <span class="exp-amount">${this.formatNumber(e.amount)}</span>
                        <button class="del-btn">✕</button>
                    </div>
                `;
            }).join('');

            this.elements.list.querySelectorAll('.expense-item').forEach(item => {
                item.querySelector('.del-btn').addEventListener('click', () => {
                    this.expenses = this.expenses.filter(x => x.id !== item.dataset.id);
                    this.save();
                    this.render();
                    TG.haptic('light');
                });
            });

            // Keep total visible for "all time" if different — we only show monthly per label
            void allTotal;
        },

        formatNumber(n) {
            const locale = I18N.current === 'fa' ? 'fa-IR' : (I18N.current === 'ar' ? 'ar-EG' : 'en-US');
            return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();