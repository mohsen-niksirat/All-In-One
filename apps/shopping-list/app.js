/**
 * app.js — Shopping List (core layer, trilingual fa/en/ar).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        shop_title: 'لیست خرید',
        shop_add_ph: 'مورد جدید...',
        shop_add: 'افزودن',
        shop_clear_done: 'پاک کردن خریداری‌شده‌ها',
        shop_progress: '{done} از {total} خریداری شده',
        shop_empty: 'لیست خرید خالی است',
        shop_delete: 'حذف',
        shop_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        shop_title: 'Shopping List',
        shop_add_ph: 'Add item...',
        shop_add: 'Add',
        shop_clear_done: 'Clear checked',
        shop_progress: '{done} of {total} bought',
        shop_empty: 'Your shopping list is empty',
        shop_delete: 'Delete',
        shop_back: 'Back to apps',
    });

    I18N.register('ar', {
        shop_title: 'قائمة التسوق',
        shop_add_ph: 'أضف عنصراً...',
        shop_add: 'إضافة',
        shop_clear_done: 'مسح المشترى',
        shop_progress: '{done} من {total} تم شراؤها',
        shop_empty: 'قائمة التسوق فارغة',
        shop_delete: 'حذف',
        shop_back: 'العودة إلى التطبيقات',
    });

    const NS = 'shopping-list';
    const QUICK_ITEMS = ['🍞', '🥛', '🥚', '🍎', '🧀', '🧻'];

    const App = {
        items: [],

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.items = Store.getJSON(NS, 'items', []);

            this.elements = {
                input: document.getElementById('item-input'),
                addBtn: document.getElementById('add-btn'),
                quickRow: document.getElementById('quick-row'),
                list: document.getElementById('item-list'),
                progress: document.getElementById('progress'),
                clearDone: document.getElementById('clear-done'),
                checkCount: document.getElementById('check-count'),
            };

            this.setupEvents();
            this.renderQuick();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('shop_title');
                this.render();
            });
            document.title = I18N.t('shop_title');
        },

        setupEvents() {
            const add = (name) => {
                const text = (name ?? this.elements.input.value).trim();
                if (!text) return;
                this.items.unshift({
                    id: Store.id(),
                    name: text,
                    done: false,
                    ts: Date.now(),
                });
                this.elements.input.value = '';
                this.save();
                this.render();
                TG.haptic('light');
            };
            this.elements.addBtn.addEventListener('click', () => add());
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') add();
            });

            this.elements.clearDone.addEventListener('click', () => {
                this.items = this.items.filter(i => !i.done);
                this.save();
                this.render();
                TG.haptic('medium');
            });
        },

        renderQuick() {
            this.elements.quickRow.innerHTML = QUICK_ITEMS.map(e =>
                `<button class="quick-chip" data-name="${e}">${e}</button>`
            ).join('');
            this.elements.quickRow.querySelectorAll('.quick-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    // Prepend the item and quickly add it
                    const e = chip.dataset.name;
                    this.items.unshift({ id: Store.id(), name: e, done: false, ts: Date.now() });
                    this.save();
                    this.render();
                    TG.haptic('light');
                });
            });
        },

        save() {
            Store.setJSON(NS, 'items', this.items);
        },

        toggle(id) {
            const item = this.items.find(i => i.id === id);
            if (item) {
                item.done = !item.done;
                this.save();
                this.render();
                TG.haptic('light');
            }
        },

        remove(id) {
            this.items = this.items.filter(i => i.id !== id);
            this.save();
            this.render();
            TG.haptic('light');
        },

        render() {
            const done = this.items.filter(i => i.done).length;
            const total = this.items.length;

            this.elements.checkCount.textContent = done ? `${done}/${total}` : '';
            this.elements.progress.textContent = total > 0 ? I18N.t('shop_progress', { done, total }) : '';

            if (total === 0) {
                this.elements.list.innerHTML = `<div class="empty-note">${I18N.t('shop_empty')}</div>`;
                return;
            }
            this.elements.list.innerHTML = this.items.map(i => `
                <div class="item${i.done ? ' checked' : ''}" data-id="${i.id}">
                    <input type="checkbox" ${i.done ? 'checked' : ''}>
                    <span class="item-name">${this.escape(i.name)}</span>
                    <span class="item-time">${Store.time(i.ts)}</span>
                    <button class="del-btn" data-i18n-title="shop_delete" title="Delete">✕</button>
                </div>
            `).join('');

            this.elements.list.querySelectorAll('.item').forEach(item => {
                const id = item.dataset.id;
                item.querySelector('input[type="checkbox"]').addEventListener('change', () => this.toggle(id));
                item.querySelector('.del-btn').addEventListener('click', () => this.remove(id));
            });
        },

        escape(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();