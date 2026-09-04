/**
 * app.js — JSON Formatter (core layer, trilingual fa/en/ar).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        json_title: 'فرمت JSON',
        json_placeholder: 'JSON خود را اینجا بچسبانید...',
        json_format: 'مرتب‌سازی',
        json_minify: 'فشرده‌سازی',
        json_copy: 'کپی',
        json_copied: 'کپی شد!',
        json_output: 'خروجی',
        json_error: 'JSON نامعتبر است',
        json_ok: 'JSON معتبر است ✓',
        json_clear: 'پاک کردن',
        json_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        json_title: 'JSON Formatter',
        json_placeholder: 'Paste your JSON here...',
        json_format: 'Format',
        json_minify: 'Minify',
        json_copy: 'Copy',
        json_copied: 'Copied!',
        json_output: 'Output',
        json_error: 'Invalid JSON',
        json_ok: 'Valid JSON ✓',
        json_clear: 'Clear',
        json_back: 'Back to apps',
    });

    I18N.register('ar', {
        json_title: 'منسّق JSON',
        json_placeholder: 'الصق JSON هنا...',
        json_format: 'تنسيق',
        json_minify: 'تصغير',
        json_copy: 'نسخ',
        json_copied: 'تم النسخ!',
        json_output: 'المخرجات',
        json_error: 'JSON غير صالح',
        json_ok: 'JSON صالح ✓',
        json_clear: 'مسح',
        json_back: 'العودة إلى التطبيقات',
    });

    const App = {
        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                input: document.getElementById('json-input'),
                output: document.getElementById('json-output'),
                status: document.getElementById('status'),
                formatBtn: document.getElementById('format-btn'),
                minifyBtn: document.getElementById('minify-btn'),
                copyBtn: document.getElementById('copy-btn'),
                clearBtn: document.getElementById('clear-btn'),
            };

            this.setupEvents();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('json_title');
            });
            document.title = I18N.t('json_title');
        },

        setupEvents() {
            this.elements.formatBtn.addEventListener('click', () => this.transform('format'));
            this.elements.minifyBtn.addEventListener('click', () => this.transform('minify'));
            this.elements.clearBtn.addEventListener('click', () => {
                this.elements.input.value = '';
                this.elements.output.value = '';
                this.setStatus('', '');
                this.elements.input.focus();
            });
            this.elements.copyBtn.addEventListener('click', async () => {
                if (!this.elements.output.value) return;
                try {
                    await navigator.clipboard.writeText(this.elements.output.value);
                } catch {
                    const ta = document.createElement('textarea');
                    ta.value = this.elements.output.value;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }
                TG.toast(I18N.t('json_copied'), 'success');
                TG.haptic('light');
            });
        },

        transform(mode) {
            const raw = this.elements.input.value.trim();
            if (!raw) return;

            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                this.setStatus(I18N.t('json_error') + ' — ' + e.message, 'err');
                this.elements.output.value = '';
                TG.haptic('error');
                return;
            }

            try {
                this.elements.output.value = mode === 'minify'
                    ? JSON.stringify(parsed)
                    : JSON.stringify(parsed, null, 2);
                this.setStatus(I18N.t('json_ok'), 'ok');
                TG.haptic('light');
            } catch (e) {
                this.setStatus(I18N.t('json_error'), 'err');
            }
        },

        setStatus(text, cls) {
            this.elements.status.textContent = text;
            this.elements.status.className = 'status-line' + (cls ? ' ' + cls : '');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();