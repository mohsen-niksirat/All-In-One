/**
 * app.js — Stopwatch (core layer, bilingual).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        stop_title: 'کرنومتر',
        stop_start: 'شروع',
        stop_pause: 'توقف',
        stop_reset: 'ریست',
        stop_lap: 'دور',
        stop_laps: 'دورها',
        stop_clear_laps: 'پاک کردن دورها',
        stop_no_laps: 'هنوز دوری ثبت نشده',
        stop_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        stop_title: 'Stopwatch',
        stop_start: 'Start',
        stop_pause: 'Pause',
        stop_reset: 'Reset',
        stop_lap: 'Lap',
        stop_laps: 'Laps',
        stop_clear_laps: 'Clear laps',
        stop_no_laps: 'No laps yet',
        stop_back: 'Back to apps',
    });

    const App = {
        running: false,
        startedAt: 0,      // timestamp when the current run started
        elapsedBase: 0,    // accumulated ms before the current run
        timerId: null,
        laps: [],

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                timeDisplay: document.getElementById('time-display'),
                startBtn: document.getElementById('start-btn'),
                lapBtn: document.getElementById('lap-btn'),
                resetBtn: document.getElementById('reset-btn'),
                lapList: document.getElementById('lap-list'),
                clearLaps: document.getElementById('clear-laps'),
            };

            this.setupEvents();
            this.renderTime(0);
            this.renderLaps();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('stop_title');
                this.renderStartBtn();
                this.renderLaps();
            });
            document.title = I18N.t('stop_title');
        },

        setupEvents() {
            this.elements.startBtn.addEventListener('click', () => {
                if (this.running) {
                    this.pause();
                } else {
                    this.start();
                }
            });

            this.elements.lapBtn.addEventListener('click', () => {
                if (!this.running) return;
                this.laps.unshift({ time: this.elapsed() });
                this.renderLaps();
                TG.haptic('light');
            });

            this.elements.resetBtn.addEventListener('click', () => {
                this.running = false;
                clearInterval(this.timerId);
                this.elapsedBase = 0;
                this.laps = [];
                this.renderTime(0);
                this.renderStartBtn();
                this.renderLaps();
                TG.haptic('medium');
            });

            this.elements.clearLaps.addEventListener('click', () => {
                this.laps = [];
                this.renderLaps();
            });
        },

        start() {
            if (this.running) return;
            this.running = true;
            this.startedAt = Date.now();
            this.timerId = setInterval(() => this.renderTime(this.elapsed()), 33);
            this.renderStartBtn();
            TG.haptic('light');
        },

        pause() {
            if (!this.running) return;
            this.elapsedBase = this.elapsed();
            this.running = false;
            clearInterval(this.timerId);
            this.renderStartBtn();
        },

        elapsed() {
            return this.elapsedBase + (this.running ? Date.now() - this.startedAt : 0);
        },

        renderTime(ms) {
            const totalTenths = Math.floor(ms / 100);
            const tenths = totalTenths % 10;
            const totalSecs = Math.floor(totalTenths / 10);
            const secs = totalSecs % 60;
            const totalMins = Math.floor(totalSecs / 60);
            const mins = totalMins % 60;
            const hours = Math.floor(totalMins / 60);

            this.elements.timeDisplay.textContent =
                String(hours).padStart(2, '0') + ':' +
                String(mins).padStart(2, '0') + ':' +
                String(secs).padStart(2, '0') + '.' + tenths;
        },

        renderStartBtn() {
            this.elements.startBtn.innerHTML =
                (this.running ? '⏸ ' : '▶ ') + '<span>' + I18N.t(this.running ? 'stop_pause' : 'stop_start') + '</span>';
        },

        renderLaps() {
            if (this.laps.length === 0) {
                this.elements.lapList.innerHTML =
                    `<div class="empty-note">${I18N.t('stop_no_laps')}</div>`;
                return;
            }
            this.elements.lapList.innerHTML = this.laps.map((lap, i) => `
                <div class="lap-item">
                    <span class="lap-num">#${this.laps.length - i}</span>
                    <span class="lap-time">${this.format(lap.time)}</span>
                </div>
            `).join('');
        },

        format(ms) {
            const totalTenths = Math.floor(ms / 100);
            const tenths = totalTenths % 10;
            const totalSecs = Math.floor(totalTenths / 10);
            const secs = totalSecs % 60;
            const mins = Math.floor(totalSecs / 60) % 60;
            const hours = Math.floor(totalSecs / 3600);
            return String(hours).padStart(2, '0') + ':' +
                String(mins).padStart(2, '0') + ':' +
                String(secs).padStart(2, '0') + '.' + tenths;
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();