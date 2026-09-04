/**
 * app.js — Todo List (core layer, bilingual).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        todo_title: 'مدیریت کارها',
        todo_add_placeholder: 'کار جدید...',
        todo_add: 'افزودن',
        todo_priority: 'اولویت',
        todo_prio_low: 'کم',
        todo_prio_medium: 'متوسط',
        todo_prio_high: 'زیاد',
        todo_all: 'همه',
        todo_active: 'فعال',
        todo_done: 'انجام‌شده',
        todo_clear_done: 'پاک کردن انجام‌شده‌ها',
        todo_empty: 'کاری باقی نمانده 🎉',
        todo_no_tasks: 'هنوز کاری اضافه نکرده‌اید',
        todo_active_count: '{n} کار فعال',
        todo_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        todo_title: 'Todo List',
        todo_add_placeholder: 'New task...',
        todo_add: 'Add',
        todo_priority: 'Priority',
        todo_prio_low: 'Low',
        todo_prio_medium: 'Medium',
        todo_prio_high: 'High',
        todo_all: 'All',
        todo_active: 'Active',
        todo_done: 'Done',
        todo_clear_done: 'Clear completed',
        todo_empty: 'All done! 🎉',
        todo_no_tasks: 'No tasks yet',
        todo_active_count: '{n} active tasks',
        todo_back: 'Back to apps',
    });

    I18N.register('ar', {
        todo_title: 'قائمة المهام',
        todo_add_placeholder: 'مهمة جديدة...',
        todo_add: 'إضافة',
        todo_priority: 'الأولوية',
        todo_prio_low: 'منخفضة',
        todo_prio_medium: 'متوسطة',
        todo_prio_high: 'عالية',
        todo_all: 'الكل',
        todo_active: 'نشطة',
        todo_done: 'منجزة',
        todo_clear_done: 'مسح المنجزة',
        todo_empty: 'كل شيء منجز! 🎉',
        todo_no_tasks: 'لا توجد مهام بعد',
        todo_active_count: '{n} مهام نشطة',
        todo_back: 'العودة إلى التطبيقات',
    });

    const NS = 'todo-list';

    const App = {
        tasks: [],
        filter: 'all',
        priority: 'low',

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.tasks = Store.getJSON(NS, 'tasks', []);

            this.elements = {
                input: document.getElementById('task-input'),
                addBtn: document.getElementById('add-btn'),
                taskList: document.getElementById('task-list'),
                activeCount: document.getElementById('active-count'),
                clearDone: document.getElementById('clear-done'),
            };

            this.setupEvents();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('todo_title');
                this.render();
            });
            document.title = I18N.t('todo_title');
        },

        setupEvents() {
            // Priority chips
            document.querySelectorAll('.prio-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    this.priority = chip.dataset.prio;
                    document.querySelectorAll('.prio-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    TG.haptic('light');
                });
            });

            // Filters
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.filter = btn.dataset.filter;
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.render();
                    TG.haptic('light');
                });
            });

            // Add
            const add = () => {
                const text = this.elements.input.value.trim();
                if (!text) return;
                this.tasks.unshift({
                    id: Store.id(),
                    text: text,
                    done: false,
                    priority: this.priority,
                    ts: Date.now(),
                });
                this.elements.input.value = '';
                this.save();
                this.render();
                TG.haptic('light');
            };
            this.elements.addBtn.addEventListener('click', add);
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') add();
            });

            // Clear completed
            this.elements.clearDone.addEventListener('click', () => {
                this.tasks = this.tasks.filter(t => !t.done);
                this.save();
                this.render();
                TG.haptic('medium');
            });
        },

        save() {
            Store.setJSON(NS, 'tasks', this.tasks);
        },

        toggle(id) {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.done = !task.done;
                this.save();
                this.render();
                TG.haptic('light');
            }
        },

        remove(id) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.save();
            this.render();
            TG.haptic('light');
        },

        render() {
            const filtered = this.tasks.filter(t => {
                if (this.filter === 'active') return !t.done;
                if (this.filter === 'done') return t.done;
                return true;
            });

            if (filtered.length === 0) {
                const msg = this.tasks.length === 0 ? 'todo_no_tasks' : 'todo_empty';
                this.elements.taskList.innerHTML =
                    `<div class="empty-note">${I18N.t(msg)}</div>`;
            } else {
                this.elements.taskList.innerHTML = filtered.map(t => `
                    <div class="task-item${t.done ? ' done' : ''}" data-id="${t.id}">
                        <span class="prio-dot ${t.priority}"></span>
                        <input type="checkbox" ${t.done ? 'checked' : ''}>
                        <span class="task-text">${this.escape(t.text)}</span>
                        <button class="del-btn" title="✕">✕</button>
                    </div>
                `).join('');

                this.elements.taskList.querySelectorAll('.task-item').forEach(item => {
                    const id = item.dataset.id;
                    const cb = item.querySelector('input[type="checkbox"]');
                    cb.addEventListener('change', () => this.toggle(id));
                    item.querySelector('.del-btn').addEventListener('click', () => this.remove(id));
                });
            }

            const active = this.tasks.filter(t => !t.done).length;
            this.elements.activeCount.textContent = I18N.t('todo_active_count', { n: active });
        },

        escape(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();