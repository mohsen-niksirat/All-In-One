/**
 * app.js — Translator (MyMemory — free, no API key, CORS enabled).
 * Free anonymous tier: up to 450 chars per request, ~5,000 chars/day.
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        trs_title: 'مترجم',
        trs_back: 'بازگشت به لیست اپ‌ها',
        trs_swap: 'جابه‌جایی زبان‌ها',
        trs_ph: 'متن موردنظر برای ترجمه...',
        trs_note: 'سرویس رایگان — ۵,۰۰۰ نویسه در روز',
        trs_btn: 'ترجمه',
        trs_translating: 'در حال ترجمه…',
        trs_copy: 'کپی',
        trs_copied: 'کپی شد!',
        trs_listen: 'پخش',
        trs_too_long: 'متن بیش از حد طولانی است (حداکثر ۴۵۰ نویسه)',
        trs_net_err: 'خطا در اتصال به سرویس ترجمه',
        trs_svc_err: 'سرویس پاسخ نامعتبر داد — کمی بعد دوباره تلاش کنید',
        trs_limit_err: 'محدودیت روزانه سرویس رایگان پر شده — فردا دوباره تلاش کنید',
    });

    I18N.register('en', {
        trs_title: 'Translator',
        trs_back: 'Back to apps',
        trs_swap: 'Swap languages',
        trs_ph: 'Text to translate...',
        trs_note: 'Free service — 5,000 chars/day',
        trs_btn: 'Translate',
        trs_translating: 'Translating…',
        trs_copy: 'Copy',
        trs_copied: 'Copied!',
        trs_listen: 'Listen',
        trs_too_long: 'Text is too long (max 450 chars per request)',
        trs_net_err: 'Could not reach the translation service',
        trs_svc_err: 'The service returned an invalid response — try again shortly',
        trs_limit_err: 'Free daily limit reached — try again tomorrow',
    });

    I18N.register('ar', {
        trs_title: 'مترجم',
        trs_back: 'العودة إلى التطبيقات',
        trs_swap: 'تبديل اللغتين',
        trs_ph: 'النص المراد ترجمته...',
        trs_note: 'خدمة مجانية — 5,000 حرف يومياً',
        trs_btn: 'ترجمة',
        trs_translating: 'جارٍ الترجمة…',
        trs_copy: 'نسخ',
        trs_copied: 'تم النسخ!',
        trs_listen: 'استماع',
        trs_too_long: 'النص طويل جداً (الحد الأقصى 450 حرفاً للطلب)',
        trs_net_err: 'تعذّر الوصول إلى خدمة الترجمة',
        trs_svc_err: 'استجابة غير صالحة من الخدمة — حاول مجدداً بعد قليل',
        trs_limit_err: 'تم بلوغ الحد اليومي المجاني — حاول غداً',
    });

    const NS = 'translator';
    const MAX = 450;

    // MyMemory language codes, labelled with native names (no translation needed).
    const LANGS = [
        ['en', 'English'], ['fa', 'فارسی'], ['ar', 'العربية'],
        ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'],
        ['ru', 'Русский'], ['tr', 'Türkçe'], ['zh-CN', '中文 (简体)'],
        ['zh-TW', '中文 (繁體)'], ['hi', 'हिन्दी'], ['ur', 'اردو'],
        ['it', 'Italiano'], ['pt', 'Português'], ['ja', '日本語'],
        ['ko', '한국어'], ['nl', 'Nederlands'], ['sv', 'Svenska'],
        ['uk', 'Українська'], ['he', 'עברית'],
    ];

    const RTL = { fa: 1, ar: 1, ur: 1, he: 1 };

    const API = 'https://api.mymemory.translated.net/get';

    const App = {
        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                from: document.getElementById('from'),
                to: document.getElementById('to'),
                swap: document.getElementById('swap'),
                src: document.getElementById('src'),
                counter: document.getElementById('counter'),
                translateBtn: document.getElementById('translate-btn'),
                resultWrap: document.getElementById('result-wrap'),
                result: document.getElementById('result'),
                copyBtn: document.getElementById('copy-btn'),
                speakBtn: document.getElementById('speak-btn'),
                status: document.getElementById('status'),
            };

            // Last used pair + text are remembered on-device.
            const last = Store.getJSON(NS, 'last', { from: 'en', to: 'fa', text: '' });
            this.fillLang(this.elements.from, last.from);
            this.fillLang(this.elements.to, last.to);
            this.elements.src.value = last.text;

            this.setupEvents();
            this.updateCounter();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('trs_title');
            });
            document.title = I18N.t('trs_title');
        },

        fillLang(select, code) {
            select.innerHTML = LANGS.map(([c, label]) =>
                `<option value="${c}"${c === code ? ' selected' : ''}>${label}</option>`
            ).join('');
        },

        setupEvents() {
            this.elements.src.addEventListener('input', () => this.updateCounter());

            this.elements.swap.addEventListener('click', () => {
                const a = this.elements.from.value;
                this.elements.from.value = this.elements.to.value;
                this.elements.to.value = a;
                const t = this.elements.result.textContent;
                this.elements.src.value = t !== '' && t !== I18N.t('trs_translating') ? t : this.elements.src.value;
                this.elements.resultWrap.classList.add('hidden');
                this.elements.result.textContent = '';
                this.updateCounter();
                this.saveLast();
                TG.haptic('light');
            });

            this.elements.translateBtn.addEventListener('click', () => this.translate());
            this.elements.copyBtn.addEventListener('click', () => this.copy());
            this.elements.speakBtn.addEventListener('click', () => this.speak());
        },

        updateCounter() {
            const len = this.elements.src.value.length;
            this.elements.counter.textContent = `${len}/${MAX}`;
        },

        saveLast() {
            Store.setJSON(NS, 'last', {
                from: this.elements.from.value,
                to: this.elements.to.value,
                text: this.elements.src.value,
            });
        },

        setStatus(msg, isError) {
            this.elements.status.textContent = msg;
            this.elements.status.classList.toggle('error', Boolean(isError));
        },

        // ---- Translate ----
        async translate() {
            const text = this.elements.src.value.trim();
            if (!text) return;
            if (text.length > MAX) {
                this.setStatus(I18N.t('trs_too_long'), true);
                TG.haptic('error');
                return;
            }
            if (typeof fetch !== 'function') {
                this.setStatus(I18N.t('trs_net_err'), true);
                return;
            }

            const from = this.elements.from.value;
            const to = this.elements.to.value;
            this.saveLast();
            this.setStatus(I18N.t('trs_translating'));
            this.elements.resultWrap.classList.remove('hidden');
            this.elements.result.textContent = '…';
            TG.haptic('light');

            try {
                const url = `${API}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
                const res = await fetch(url);
                const data = await res.json();

                if (data.responseStatus !== 200) {
                    const msg = data.responseDetails || '';
                    if (/limit|quota|daily/i.test(msg)) {
                        this.setStatus(I18N.t('trs_limit_err'), true);
                    } else {
                        this.setStatus(I18N.t('trs_svc_err'), true);
                    }
                    this.elements.result.textContent = '';
                    return;
                }

                let out = (data.responseData && data.responseData.translatedText) || '';
                if (/^MYMEMORY WARNING/i.test(out) || out.toUpperCase() === text.toUpperCase()) {
                    // Anonymous usage warning or unhelpful echo — surface the service message.
                    out = '';
                    this.setStatus(I18N.t('trs_svc_err'), true);
                }

                this.elements.result.textContent = out;
                this.elements.result.setAttribute('dir', RTL[to] ? 'rtl' : 'ltr');
                this.elements.resultWrap.classList.remove('hidden');
                this.setStatus('');
            } catch (e) {
                this.setStatus(I18N.t('trs_net_err'), true);
                this.elements.result.textContent = '';
            }
        },

        // ---- Copy & speak ----
        copy() {
            const text = this.elements.result.textContent;
            if (!text) return;
            const done = () => {
                TG.toast(I18N.t('trs_copied'), 'success');
                TG.haptic('light');
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, () => this.fallbackCopy(text, done));
            } else {
                this.fallbackCopy(text, done);
            }
        },

        fallbackCopy(text, done) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                done();
            } catch (e) {
                TG.toast(I18N.t('trs_copied'), 'success');
            }
        },

        speak() {
            const text = this.elements.result.textContent;
            if (!text || typeof speechSynthesis === 'undefined') return;
            try {
                speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(text);
                u.lang = this.elements.to.value;
                speechSynthesis.speak(u);
            } catch (e) {
                // speech not available
            }
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();
