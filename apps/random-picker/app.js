/**
 * app.js — Random Picker (core layer, bilingual).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        pick_title: 'انتخاب تصادفی',
        pick_list: 'لیست شما',
        pick_placeholder: 'هر مورد در یک خط...',
        pick_btn: 'انتخاب کن!',
        pick_again: 'انتخاب مجدد',
        pick_copy: 'کپی نتیجه',
        pick_copied: 'کپی شد!',
        pick_result: 'برنده',
        pick_nothing: 'چیزی برای انتخاب نیست',
        pick_history: 'انتخاب‌های قبلی',
        pick_clear: 'پاک کردن',
        pick_empty: 'هنوز انتخابی انجام نشده',
        pick_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        pick_title: 'Random Picker',
        pick_list: 'Your list',
        pick_placeholder: 'One item per line...',
        pick_btn: 'Pick!',
        pick_again: 'Pick again',
        pick_copy: 'Copy result',
        pick_copied: 'Copied!',
        pick_result: 'Winner',
        pick_nothing: 'Nothing to pick',
        pick_history: 'Past picks',
        pick_clear: 'Clear',
        pick_empty: 'No picks yet',
        pick_back: 'Back to apps',
    });

    const NS = 'random-picker';

    const App = {
        elements: {},
        picking: false,

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                itemsInput: document.getElementById('items-input'),
                pickBtn: document.getElementById('pick-btn'),
                againBtn: document.getElementById('again-btn'),
                resultBox: document.getElementById('result-box'),
                resultText: document.getElementById('result-text'),
                copyBtn: document.getElementById('copy-btn'),
                historyList: document.getElementById('history-list'),
                clearHistory: document.getElementById('clear-history'),
            };

            this.setupEvents();
            this.renderHistory();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('pick_title');
                this.renderHistory();
            });
            document.title = I18N.t('pick_title');
        },

        setupEvents() {
            this.elements.pickBtn.addEventListener('click', () => this.pick());

            this.elements.againBtn.addEventListener('click', () => this.pick());

            this.elements.copyBtn.addEventListener('click', () => this.copyResult());

            this.elements.clearHistory.addEventListener('click', () => {
                Store.remove(NS, 'history');
                this.renderHistory();
                TG.haptic('light');
            });
        },

        getItems() {
            return this.elements.itemsInput.value
                .split('\n')
                .map(s => s.trim())
                .filter(Boolean);
        },

        pick() {
            if (this.picking) return;

            const items = this.getItems();
            if (items.length === 0) {
                TG.toast(I18N.t('pick_nothing'), 'error');
                TG.haptic('error');
                return;
            }

            this.picking = true;
            this.elements.pickBtn.disabled = true;
            this.elements.resultBox.classList.remove('hidden');

            // Animated cycle before landing on the winner
            const duration = 1200;
            const start = Date.now();

            const step = () => {
                const randomItem = items[Math.floor(Math.random() * items.length)];
                this.elements.resultText.textContent = randomItem;

                if (Date.now() - start < duration) {
                    setTimeout(step, 60);
                } else {
                    this.finishPick(randomItem);
                }
            };

            step();
        },

        finishPick(winner) {
            this.picking = false;
            this.elements.pickBtn.disabled = false;
            this.elements.againBtn.classList.remove('hidden');
            this.elements.resultText.textContent = winner;
            TG.haptic('success');

            // Save history
            const history = Store.getJSON(NS, 'history', []);
            history.unshift({ item: winner, ts: Date.now() });
            Store.setJSON(NS, 'history', history.slice(0, 8));
            this.renderHistory();
        },

        async copyResult() {
            const text = this.elements.resultText.textContent;
            if (!text) return;
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            TG.toast(I18N.t('pick_copied'), 'success');
        },

        renderHistory() {
            const history = Store.getJSON(NS, 'history', []);
            if (history.length === 0) {
                this.elements.historyList.innerHTML =
                    `<div class="empty-note">${I18N.t('pick_empty')}</div>`;
                return;
            }
            this.elements.historyList.innerHTML = history.map(h =>
                `<div class="history-item">
                    <span>${h.item}</span>
                    <span class="time">${Store.time(h.ts)}</span>
                </div>`
            ).join('');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();