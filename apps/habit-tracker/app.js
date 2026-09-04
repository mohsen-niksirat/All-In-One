/**
 * app.js — Habit Tracker (core layer, bilingual).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        habit_title: 'عادت‌ساز',
        habit_add_placeholder: 'عادت جدید...',
        habit_add: 'افزودن',
        habit_empty: 'هنوز عادتی اضافه نکرده‌اید',
        habit_streak: '{n} روز',
        habit_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        habit_title: 'Habit Tracker',
        habit_add_placeholder: 'New habit...',
        habit_add: 'Add',
        habit_empty: 'No habits yet',
        habit_streak: '{n}d streak',
        habit_back: 'Back to apps',
    });

    I18N.register('ar', {
        habit_title: 'متتبّع العادات',
        habit_add_placeholder: 'عادة جديدة...',
        habit_add: 'إضافة',
        habit_empty: 'لم تضف عادات بعد',
        habit_streak: '{n} يوم',
        habit_back: 'العودة إلى التطبيقات',
    });

    const NS = 'habit-tracker';

    const App = {
        habits: [],

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.habits = Store.getJSON(NS, 'habits', []);

            this.elements = {
                input: document.getElementById('habit-input'),
                addBtn: document.getElementById('add-btn'),
                list: document.getElementById('habit-list'),
            };

            this.setupEvents();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('habit_title');
                this.render();
            });
            document.title = I18N.t('habit_title');
        },

        setupEvents() {
            const add = () => {
                const name = this.elements.input.value.trim();
                if (!name) return;
                this.habits.push({ id: Store.id(), name: name, dates: [] });
                this.elements.input.value = '';
                this.save();
                this.render();
                TG.haptic('light');
            };
            this.elements.addBtn.addEventListener('click', add);
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') add();
            });
        },

        save() {
            Store.setJSON(NS, 'habits', this.habits);
        },

        // ---- Date helpers (local timezone) ----
        dateKey(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        },

        todayKey() {
            return this.dateKey(new Date());
        },

        last7Days() {
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                days.push(d);
            }
            return days;
        },

        weekdayLabel(d) {
            const locale = I18N.current === 'fa' ? 'fa-IR' : 'en-US';
            return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(d);
        },

        // ---- Streak ----
        streak(habit) {
            const done = new Set(habit.dates);
            let count = 0;
            const cursor = new Date();
            // If today isn't done yet, a streak can still start yesterday
            if (!done.has(this.dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
            while (done.has(this.dateKey(cursor))) {
                count++;
                cursor.setDate(cursor.getDate() - 1);
            }
            return count;
        },

        toggle(habitId, key) {
            const habit = this.habits.find(h => h.id === habitId);
            if (!habit) return;
            const idx = habit.dates.indexOf(key);
            if (idx >= 0) {
                habit.dates.splice(idx, 1);
            } else {
                habit.dates.push(key);
            }
            this.save();
            this.render();
            TG.haptic('light');
        },

        remove(habitId) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.save();
            this.render();
            TG.haptic('light');
        },

        // ---- Render ----
        render() {
            if (this.habits.length === 0) {
                this.elements.list.innerHTML =
                    `<div class="empty-note">${I18N.t('habit_empty')}</div>`;
                return;
            }

            const days = this.last7Days();
            const today = this.todayKey();
            const labels = days.map(d =>
                `<span class="day-label${this.dateKey(d) === today ? ' today' : ''}">${this.weekdayLabel(d)}</span>`
            ).join('');

            this.elements.list.innerHTML = this.habits.map(habit => {
                const done = new Set(habit.dates);
                const cells = days.map(d => {
                    const key = this.dateKey(d);
                    const isFuture = key > today;
                    const cls = done.has(key) ? ' done' : (isFuture ? ' future' : '');
                    return `<button class="day-cell${cls}" data-id="${habit.id}" data-key="${key}">✓</button>`;
                }).join('');

                const st = this.streak(habit);
                const streakLabel = st > 0
                    ? `<span class="habit-streak${st >= 3 ? ' on-fire' : ''}">🔥 ${I18N.t('habit_streak', { n: st })}</span>`
                    : '';

                return `
                    <div class="habit-card">
                        <div class="habit-head">
                            <span class="habit-name">${this.escape(habit.name)}</span>
                            ${streakLabel}
                            <button class="habit-del" data-del="${habit.id}">✕</button>
                        </div>
                        <div class="week-grid">${labels}${cells}</div>
                    </div>
                `;
            }).join('');

            // Wire up events
            this.elements.list.querySelectorAll('.day-cell').forEach(cell => {
                cell.addEventListener('click', () => this.toggle(cell.dataset.id, cell.dataset.key));
            });
            this.elements.list.querySelectorAll('.habit-del').forEach(btn => {
                btn.addEventListener('click', () => this.remove(btn.dataset.del));
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