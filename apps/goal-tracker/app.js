/**
 * app.js — Goal Tracker (core layer, trilingual fa/en/ar).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        goal_title: 'ردیاب اهداف',
        goal_name_ph: 'نام هدف...',
        goal_target_ph: 'مقدار هدف',
        goal_add: 'افزودن',
        goal_achieved: 'دست یافتی! 🎉',
        goal_of: '{current} از {target}',
        goal_empty: 'هنوز هدفی تعریف نکرده‌اید',
        goal_delete: 'حذف',
        goal_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        goal_title: 'Goal Tracker',
        goal_name_ph: 'Goal name...',
        goal_target_ph: 'Target',
        goal_add: 'Add',
        goal_achieved: 'Achieved! 🎉',
        goal_of: '{current} of {target}',
        goal_empty: 'No goals yet',
        goal_delete: 'Delete',
        goal_back: 'Back to apps',
    });

    I18N.register('ar', {
        goal_title: 'متتبّع الأهداف',
        goal_name_ph: 'اسم الهدف...',
        goal_target_ph: 'الهدف (رقم)',
        goal_add: 'إضافة',
        goal_achieved: 'تم تحقيقه! 🎉',
        goal_of: '{current} من {target}',
        goal_empty: 'لا أهداف بعد',
        goal_delete: 'حذف',
        goal_back: 'العودة إلى التطبيقات',
    });

    const NS = 'goal-tracker';

    const App = {
        goals: [],

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.goals = Store.getJSON(NS, 'goals', []);

            this.elements = {
                name: document.getElementById('goal-name'),
                target: document.getElementById('goal-target'),
                addBtn: document.getElementById('add-btn'),
                list: document.getElementById('goal-list'),
            };

            this.setupEvents();
            this.setupBackup();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('goal_title');
                this.render();
            });
            document.title = I18N.t('goal_title');
        },

        setupEvents() {
            const add = () => {
                const name = this.elements.name.value.trim();
                const target = parseFloat(this.elements.target.value);
                if (!name || !target || target <= 0) {
                    TG.haptic('error');
                    return;
                }
                this.goals.unshift({
                    id: Store.id(),
                    name: name,
                    target: target,
                    current: 0,
                    created: Date.now(),
                });
                this.elements.name.value = '';
                this.elements.target.value = '';
                this.save();
                this.render();
                TG.haptic('light');
            };
            this.elements.addBtn.addEventListener('click', add);
            this.elements.target.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') add();
            });
        },

        save() {
            Store.setJSON(NS, 'goals', this.goals);
        },

        setupBackup() {
            const exportBtn = document.getElementById('export-btn');
            const importBtn = document.getElementById('import-btn');
            const importFile = document.getElementById('import-file');
            if (exportBtn) exportBtn.addEventListener('click', () => {
                Backup.download('goals-backup-' + new Date().toISOString().slice(0, 10) + '.json', {
                    app: 'goal-tracker',
                    items: this.goals,
                });
            });
            if (importBtn) importBtn.addEventListener('click', () => importFile.click());
            if (importFile) importFile.addEventListener('change', () => {
                if (importFile.files && importFile.files[0]) {
                    Backup.importList(importFile.files[0], this.goals, (merged) => {
                        this.goals = merged;
                        this.save();
                        this.render();
                    });
                }
                importFile.value = '';
            });
        },

        adjust(id, delta) {
            const goal = this.goals.find(g => g.id === id);
            if (!goal) return;
            const step = Math.max(1, Math.round(goal.target / 10));
            goal.current = Math.max(0, Math.round((goal.current + delta * step) * 100) / 100);
            goal.updated = Date.now();
            this.save();
            this.render();
            TG.haptic('light');
        },

        remove(id) {
            this.goals = this.goals.filter(g => g.id !== id);
            this.save();
            this.render();
            TG.haptic('light');
        },

        render() {
            if (this.goals.length === 0) {
                this.elements.list.innerHTML = `<div class="empty-note">${I18N.t('goal_empty')}</div>`;
                return;
            }

            this.elements.list.innerHTML = this.goals.map(g => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                const done = g.current >= g.target;
                const frac = I18N.current === 'fa'
                    ? new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(g.current)
                        + ' / ' + new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(g.target)
                    : `${g.current} / ${g.target}`;
                return `
                    <div class="goal-card${done ? ' done' : ''}" data-id="${g.id}">
                        <div class="goal-head">
                            <span class="goal-name">${this.escape(g.name)}</span>
                            ${done ? `<span class="goal-badge">${I18N.t('goal_achieved')}</span>` : ''}
                            <button class="goal-del" data-i18n-title="goal_delete" title="Delete">✕</button>
                        </div>
                        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
                        <div class="goal-meta">
                            <span class="goal-frac">${frac}</span>
                            <span class="goal-pct">${pct}%</span>
                        </div>
                        <div class="goal-actions">
                            <button class="btn btn-secondary" data-act="-">−</button>
                            <button class="btn btn-primary" data-act="+">+</button>
                        </div>
                    </div>
                `;
            }).join('');

            this.elements.list.querySelectorAll('.goal-card').forEach(card => {
                const id = card.dataset.id;
                card.querySelector('.goal-del').addEventListener('click', () => this.remove(id));
                card.querySelectorAll('[data-act]').forEach(btn => {
                    btn.addEventListener('click', () => this.adjust(id, btn.dataset.act === '+' ? 1 : -1));
                });
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