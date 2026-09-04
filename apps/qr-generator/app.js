/**
 * app.js — QR Generator (core layer, trilingual fa/en/ar).
 * Uses the vendored qrcode-generator library (MIT, Kazuhiko Arase).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        qr_title: 'کد QR',
        qr_placeholder: 'متن یا لینک...',
        qr_generate: 'ساخت کد',
        qr_download: 'دانلود PNG',
        qr_share: 'ارسال',
        qr_downloaded: 'دانلود شد!',
        qr_error: 'متن خیلی طولانی است یا نامعتبر است',
        qr_empty: 'چیزی برای ساخت وارد کنید',
        qr_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        qr_title: 'QR Generator',
        qr_placeholder: 'Text or link...',
        qr_generate: 'Generate',
        qr_download: 'Download PNG',
        qr_share: 'Share',
        qr_downloaded: 'Downloaded!',
        qr_error: 'Text too long or invalid',
        qr_empty: 'Enter something to encode',
        qr_back: 'Back to apps',
    });

    I18N.register('ar', {
        qr_title: 'رمز QR',
        qr_placeholder: 'نص أو رابط...',
        qr_generate: 'إنشاء',
        qr_download: 'تنزيل PNG',
        qr_share: 'مشاركة',
        qr_downloaded: 'تم التنزيل!',
        qr_error: 'النص طويل جداً أو غير صالح',
        qr_empty: 'أدخل شيئاً لترميزه',
        qr_back: 'العودة إلى التطبيقات',
    });

    const App = {
        elements: {},
        lastDataUrl: null,

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                input: document.getElementById('qr-input'),
                generateBtn: document.getElementById('generate-btn'),
                downloadBtn: document.getElementById('download-btn'),
                shareBtn: document.getElementById('share-btn'),
                output: document.getElementById('qr-output'),
                svg: document.getElementById('qr-svg'),
            };

            this.setupEvents();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('qr_title');
            });
            document.title = I18N.t('qr_title');
        },

        setupEvents() {
            this.elements.generateBtn.addEventListener('click', () => this.generate());

            this.elements.downloadBtn.addEventListener('click', () => this.download());
            this.elements.shareBtn.addEventListener('click', () => this.share());

            // Regenerate while typing (debounced)
            let timer = null;
            this.elements.input.addEventListener('input', () => {
                clearTimeout(timer);
                timer = setTimeout(() => this.generate(), 400);
            });
        },

        generate() {
            const text = this.elements.input.value.trim();
            if (!text) {
                this.elements.output.classList.add('hidden');
                this.elements.downloadBtn.classList.add('hidden');
                this.elements.shareBtn.classList.add('hidden');
                TG.toast(I18N.t('qr_empty'), 'error');
                return;
            }

            try {
                // typeNumber 0 = auto-size, error correction level M
                const qr = qrcode(0, 'M');
                qr.addData(text);
                qr.make();

                this.elements.svg.innerHTML = qr.createSvgTag(5, 4);
                this.elements.output.classList.remove('hidden');

                // PNG data URL for download / sharing
                this.lastDataUrl = qr.createDataURL(5, 8);
                this.elements.downloadBtn.classList.remove('hidden');
                this.elements.shareBtn.classList.remove('hidden');

                TG.haptic('light');
            } catch (e) {
                this.elements.output.classList.add('hidden');
                this.elements.downloadBtn.classList.add('hidden');
                this.elements.shareBtn.classList.add('hidden');
                TG.toast(I18N.t('qr_error'), 'error');
                TG.haptic('error');
            }
        },

        download() {
            if (!this.lastDataUrl) return;
            const a = document.createElement('a');
            a.href = this.lastDataUrl;
            a.download = 'qr-code.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            TG.haptic('light');
        },

        /** Native share (sends the PNG as a file); falls back to download. */
        async share() {
            if (!this.lastDataUrl) return;
            try {
                const blob = await (await fetch(this.lastDataUrl)).blob();
                const file = new File([blob], 'qr-code.png', { type: 'image/png' });
                if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], text: this.elements.input.value.trim() });
                    TG.haptic('light');
                    return;
                }
            } catch (e) {
                if (e && e.name === 'AbortError') return; // user cancelled — do nothing
            }
            this.download();
            TG.toast(I18N.t('qr_downloaded'), 'success');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();