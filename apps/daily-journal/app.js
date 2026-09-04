/**
 * app.js — Daily Journal (core layer, trilingual fa/en/ar).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        jour_title: 'یادداشت روزانه',
        jour_today: 'امروز',
        jour_ph: 'امروز چه گذشت؟ حال‌وهوای امروزت چطور بود...',
        jour_save: 'ذخیره',
        jour_saved: 'ذخیره شد!',
        jour_streak: '{n} روز پیاپی',
        jour_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        jour_title: 'Journal',
        jour_today: 'Today',
        jour_ph: "How was your day? What's on your mind...",
        jour_save: 'Save',
        jour_saved: 'Saved!',
        jour_streak: '{n}-day streak',
        jour_back: 'Back to apps',
    });

    I18N.register('ar', {
        jour_title: 'اليوميات',
        jour_today: 'اليوم',
        jour_ph: 'كيف كان يومك؟ ما الذي في بالك...',
        jour_save: 'حفظ',
        jour_saved: 'تم الحفظ!',
        jour_streak: 'سلسلة {n} يوم',
        jour_back: 'العودة إلى التطبيقات',
    });

    const NS = 'daily-journal';

    const App = {
        entries: {},        // { 'YYYY-MM-DD': { mood: 0-4|-1, text, updated } }
        cursor: null,       // Date being viewed

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.entries = Store.getJSON(NS, 'entries', {});
            this.cursor = new Date();

            this.elements = {
                prevDay: document.getElementById('prev-day'),
                nextDay: document.getElementById('next-day'),
                dateLabel: document.getElementById('date-label'),
                todayBtn: document.getElementById('today-btn'),
                streak: document.getElementById('streak'),
                entry: document.getElementById('entry'),
                saveBtn: document.getElementById('save-btn'),
            };

            this.setupEvents();
            this.setupBackup();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('jour_title');
                this.render();
            });
            document.title = I18N.t('jour_title');
        },

        setupEvents() {
            this.elements.prevDay.addEventListener('click', () => {
                this.cursor.setDate(this.cursor.getDate() - 1);
                this.render();
            });
            this.elements.nextDay.addEventListener('click', () => {
                const today = new Date();
                if (this.dateKey(this.cursor) >= this.dateKey(today)) return;
                this.cursor.setDate(this.cursor.getDate() + 1);
                this.render();
            });
            this.elements.todayBtn.addEventListener('click', () => {
                this.cursor = new Date();
                this.render();
            });

            // Mood select
            document.querySelectorAll('.mood').forEach(moodBtn => {
                moodBtn.addEventListener('click', () => {
                    this.currentEntry().mood = parseInt(moodBtn.dataset.mood);
                    this.updateMoodUI();
                    this.save();
                    TG.haptic('light');
                });
            });

            this.elements.saveBtn.addEventListener('click', () => this.saveCurrent());
        },

        // ---- Date helpers ----
        dateKey(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        },

        isToday() {
            return this.dateKey(this.cursor) === this.dateKey(new Date());
        },

        // ---- Entry access ----
        currentEntry() {
            const key = this.dateKey(this.cursor);
            if (!this.entries[key]) {
                this.entries[key] = { mood: -1, text: '', updated: 0 };
            }
            return this.entries[key];
        },

        save() {
            Store.setJSON(NS, 'entries', this.entries);
        },

        // Journal entries live in a date-keyed object; backups serialize them
        // as an array of { id: 'YYYY-MM-DD', … } items (merge-by-date).
        serializeEntries() {
            return Object.entries(this.entries)
                .filter(([, e]) => (e && (e.text || (e.mood >= 0))))
                .map(([date, e]) => ({ id: date, date: date, mood: e.mood, text: e.text, updated: e.updated || 0 }));
        },

        setupBackup() {
            const exportBtn = document.getElementById('export-btn');
            const importBtn = document.getElementById('import-btn');
            const importFile = document.getElementById('import-file');
            if (exportBtn) exportBtn.addEventListener('click', () => {
                Backup.download('journal-backup-' + new Date().toISOString().slice(0, 10) + '.json', {
                    app: 'daily-journal',
                    items: this.serializeEntries(),
                });
            });
            if (importBtn) importBtn.addEventListener('click', () => importFile.click());
            if (importFile) importFile.addEventListener('change', () => {
                if (importFile.files && importFile.files[0]) {
                    Backup.importList(importFile.files[0], this.serializeEntries(), (merged) => {
                        const obj = {};
                        merged.forEach(it => {
                            obj[it.id] = { mood: it.mood === undefined ? -1 : it.mood, text: it.text || '', updated: it.updated || 0 };
                        });
                        this.entries = obj;
                        this.save();
                        this.render();
                    });
                }
                importFile.value = '';
            });
        },

        saveCurrent() {
            const entry = this.currentEntry();
            entry.text = this.elements.entry.value;
            entry.updated = Date.now();
            this.save();
            this.updateStreak();
            TG.toast(I18N.t('jour_saved'), 'success');
            TG.haptic('medium');
        },

        streakDays() {
            const todayKey = this.dateKey(new Date());
            const done = new Set(Object.keys(this.entries).filter(k => {
                const e = this.entries[k];
                return e.text || e.mood >= 0;
            }));
            let count = 0;
            const d = new Date();
            if (!done.has(this.dateKey(d))) d.setDate(d.getDate() - 1);
            while (done.has(this.dateKey(d))) {
                count++;
                d.setDate(d.getDate() - 1);
            }
            return count;
        },

        // ---- Render ----
        updateMoodUI() {
            const mood = this.currentEntry().mood;
            document.querySelectorAll('.mood').forEach(btn => {
                btn.classList.toggle('selected', parseInt(btn.dataset.mood) === mood);
            });
        },

        updateStreak() {
            const s = this.streakDays();
            this.elements.streak.textContent = s > 0 ? '🔥 ' + I18N.t('jour_streak', { n: s }) : '';
        },

        render() {
            const entry = this.currentEntry();

            // Date label
            const locale = I18N.current === 'fa' ? 'fa-IR' : (I18N.current === 'ar' ? 'ar-EG' : 'en-US');
            this.elements.dateLabel.textContent = new Intl.DateTimeFormat(locale, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            }).format(this.cursor);

            // Nav limits: not before 2000, not after today
            const today = new Date();
            this.elements.nextDay.disabled = this.dateKey(this.cursor) >= this.dateKey(today);
            this.elements.prevDay.disabled = this.cursor.getFullYear() < 2000;

            // Fill editor
            this.elements.entry.value = entry.text || '';
            this.updateMoodUI();
            this.updateStreak();
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();