/**
 * app.js — Pomodoro Timer (core layer, bilingual).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        pomo_title: 'تایمر پومودورو',
        pomo_work: 'کار',
        pomo_short: 'استراحت کوتاه',
        pomo_long: 'استراحت بلند',
        pomo_start: 'شروع',
        pomo_pause: 'توقف',
        pomo_reset: 'ریست',
        pomo_settings: 'تنظیمات',
        pomo_work_min: 'مدت کار (دقیقه)',
        pomo_short_min: 'استراحت کوتاه (دقیقه)',
        pomo_long_min: 'استراحت بلند (دقیقه)',
        pomo_save: 'ذخیره',
        pomo_sessions: 'جلسات امروز',
        pomo_focus: 'تمرکز',
        pomo_break: 'استراحت',
        pomo_done_work: 'وقت استراحت! 🎉',
        pomo_done_break: 'استراحت تمام شد! برگرد به کار 💪',
        pomo_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        pomo_title: 'Pomodoro Timer',
        pomo_work: 'Work',
        pomo_short: 'Short Break',
        pomo_long: 'Long Break',
        pomo_start: 'Start',
        pomo_pause: 'Pause',
        pomo_reset: 'Reset',
        pomo_settings: 'Settings',
        pomo_work_min: 'Work duration (min)',
        pomo_short_min: 'Short break (min)',
        pomo_long_min: 'Long break (min)',
        pomo_save: 'Save',
        pomo_sessions: 'Sessions today',
        pomo_focus: 'Focus',
        pomo_break: 'Break',
        pomo_done_work: 'Time for a break! 🎉',
        pomo_done_break: 'Break over! Back to work 💪',
        pomo_back: 'Back to apps',
    });

    I18N.register('ar', {
        pomo_title: 'مؤقّت بومودورو',
        pomo_work: 'عمل',
        pomo_short: 'استراحة قصيرة',
        pomo_long: 'استراحة طويلة',
        pomo_start: 'ابدأ',
        pomo_pause: 'إيقاف مؤقت',
        pomo_reset: 'إعادة',
        pomo_settings: 'الإعدادات',
        pomo_work_min: 'مدة العمل (دقيقة)',
        pomo_short_min: 'الاستراحة القصيرة (دقيقة)',
        pomo_long_min: 'الاستراحة الطويلة (دقيقة)',
        pomo_save: 'حفظ',
        pomo_sessions: 'جلسات اليوم',
        pomo_focus: 'تركيز',
        pomo_break: 'استراحة',
        pomo_done_work: 'حان وقت الاستراحة! 🎉',
        pomo_done_break: 'انتهت الاستراحة! عُد إلى العمل 💪',
        pomo_back: 'العودة إلى التطبيقات',
    });

    const NS = 'pomodoro';
    const RING_CIRCUMFERENCE = 2 * Math.PI * 120;

    const App = {
        mode: 'work',          // work | short | long
        running: false,
        endTime: null,
        timerId: null,
        durations: { work: 25, short: 5, long: 15 },

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.durations = Store.getJSON(NS, 'durations', this.durations);

            this.elements = {
                timeDisplay: document.getElementById('time-display'),
                sessionLabel: document.getElementById('session-label'),
                startBtn: document.getElementById('start-btn'),
                resetBtn: document.getElementById('reset-btn'),
                ringFg: document.getElementById('ring-fg'),
                sessionCount: document.getElementById('session-count'),
                settingsBtn: document.getElementById('settings-btn'),
                modal: document.getElementById('settings-modal'),
                durWork: document.getElementById('dur-work'),
                durShort: document.getElementById('dur-short'),
                durLong: document.getElementById('dur-long'),
                saveSettings: document.getElementById('save-settings'),
            };

            this.setupModeTabs();
            this.setupControls();
            this.setupSettings();
            this.setupRing();
            this.resetTimer(true);
            this.renderSessions();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('pomo_title');
                this.renderStartBtn();
                this.renderSessionLabel();
            });
            document.title = I18N.t('pomo_title');
        },

        // ---- Modes ----
        setupModeTabs() {
            document.querySelectorAll('.mode-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    if (tab.dataset.mode === this.mode && !this.running) return;
                    this.mode = tab.dataset.mode;
                    this.running = false;
                    clearInterval(this.timerId);
                    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.resetTimer(true);
                    this.renderStartBtn();
                    this.renderSessionLabel();
                    TG.haptic('light');
                });
            });
        },

        // ---- Timer math ----
        getDurationSeconds() {
            return this.durations[this.mode] * 60;
        },

        resetTimer(resetLabel) {
            this.running = false;
            clearInterval(this.timerId);
            this.secondsLeft = this.getDurationSeconds();
            if (resetLabel) this.renderSessionLabel();
            this.renderTime();
            this.renderStartBtn();
        },

        start() {
            if (this.running) return;
            this.running = true;
            this.endTime = Date.now() + this.secondsLeft * 1000;
            this.timerId = setInterval(() => this.tick(), 250);
            this.renderStartBtn();
            TG.haptic('light');
        },

        pause() {
            if (!this.running) return;
            // Recompute remaining time before stopping
            this.secondsLeft = Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
            this.running = false;
            clearInterval(this.timerId);
            this.renderStartBtn();
        },

        tick() {
            this.secondsLeft = Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
            this.renderTime();

            if (this.secondsLeft <= 0) {
                this.finishSession();
            }
        },

        finishSession() {
            clearInterval(this.timerId);
            this.running = false;

            const finishedMode = this.mode;
            if (finishedMode === 'work') {
                this.addSession();
                this.mode = (this.getTodaySessions() % 4 === 0) ? 'long' : 'short';
                TG.toast(I18N.t('pomo_done_work'), 'success');
            } else {
                this.mode = 'work';
                TG.toast(I18N.t('pomo_done_break'), 'success');
            }
            TG.haptic('success');

            document.querySelectorAll('.mode-tab').forEach(t => {
                t.classList.toggle('active', t.dataset.mode === this.mode);
            });
            this.resetTimer(true);
        },

        // ---- Sessions ----
        todayKey() {
            return new Date().toISOString().slice(0, 10);
        },

        getTodaySessions() {
            const data = Store.getJSON(NS, 'sessions', { date: '', count: 0 });
            return data.date === this.todayKey() ? data.count : 0;
        },

        addSession() {
            const key = this.todayKey();
            const count = this.getTodaySessions() + 1;
            Store.setJSON(NS, 'sessions', { date: key, count });
            this.renderSessions();
        },

        renderSessions() {
            this.elements.sessionCount.textContent = this.getTodaySessions();
        },

        // ---- Rendering ----
        renderTime() {
            const m = Math.floor(this.secondsLeft / 60);
            const s = this.secondsLeft % 60;
            this.elements.timeDisplay.textContent =
                String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');

            // Progress ring
            const fraction = this.secondsLeft / this.getDurationSeconds();
            this.elements.ringFg.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - fraction);
        },

        renderStartBtn() {
            this.elements.startBtn.textContent =
                (this.running ? '⏸ ' : '▶ ') + I18N.t(this.running ? 'pomo_pause' : 'pomo_start');
        },

        renderSessionLabel() {
            this.elements.sessionLabel.textContent = I18N.t(
                this.mode === 'work' ? 'pomo_focus' : 'pomo_break'
            );
        },

        setupRing() {
            this.elements.ringFg.style.strokeDasharray = String(RING_CIRCUMFERENCE);
            this.elements.ringFg.style.strokeDashoffset = '0';
        },

        // ---- Controls ----
        setupControls() {
            this.elements.startBtn.addEventListener('click', () => {
                if (this.running) {
                    this.pause();
                } else {
                    this.start();
                }
            });

            this.elements.resetBtn.addEventListener('click', () => {
                this.resetTimer(true);
                TG.haptic('medium');
            });
        },

        // ---- Settings ----
        setupSettings() {
            this.elements.settingsBtn.addEventListener('click', () => {
                this.elements.durWork.value = this.durations.work;
                this.elements.durShort.value = this.durations.short;
                this.elements.durLong.value = this.durations.long;
                this.elements.modal.classList.remove('hidden');
            });

            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.elements.modal.classList.add('hidden');
                }
            });

            this.elements.saveSettings.addEventListener('click', () => {
                this.durations = {
                    work: Math.max(1, parseInt(this.elements.durWork.value) || 25),
                    short: Math.max(1, parseInt(this.elements.durShort.value) || 5),
                    long: Math.max(1, parseInt(this.elements.durLong.value) || 15),
                };
                Store.setJSON(NS, 'durations', this.durations);
                this.elements.modal.classList.add('hidden');
                this.resetTimer(true);
                TG.toast(I18N.t('pomo_save') + ' ✓', 'success');
                TG.haptic('medium');
            });
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();