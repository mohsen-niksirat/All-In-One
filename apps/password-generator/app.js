/**
 * app.js — Password Generator (core layer, bilingual).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        pass_title: 'تولید رمز عبور',
        pass_length: 'طول رمز',
        pass_options: 'گزینه‌ها',
        pass_upper: 'حروف بزرگ (A–Z)',
        pass_lower: 'حروف کوچک (a–z)',
        pass_digits: 'اعداد (0–9)',
        pass_symbols: 'نمادها (!@#)',
        pass_generate: 'تولید رمز',
        pass_copy: 'کپی',
        pass_copied: 'کپی شد!',
        pass_strength: 'امنیت',
        pass_weak: 'ضعیف',
        pass_medium: 'متوسط',
        pass_strong: 'قوی',
        pass_history: 'تاریخچه',
        pass_empty: 'هنوز رمزی تولید نشده',
        pass_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        pass_title: 'Password Generator',
        pass_length: 'Password length',
        pass_options: 'Options',
        pass_upper: 'Uppercase (A–Z)',
        pass_lower: 'Lowercase (a–z)',
        pass_digits: 'Numbers (0–9)',
        pass_symbols: 'Symbols (!@#)',
        pass_generate: 'Generate',
        pass_copy: 'Copy',
        pass_copied: 'Copied!',
        pass_strength: 'Strength',
        pass_weak: 'Weak',
        pass_medium: 'Medium',
        pass_strong: 'Strong',
        pass_history: 'History',
        pass_empty: 'No passwords yet',
        pass_back: 'Back to apps',
    });

    const NS = 'password-generator';
    const CHARSETS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    const App = {
        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                output: document.getElementById('password-output'),
                copyBtn: document.getElementById('copy-btn'),
                lengthSlider: document.getElementById('length-slider'),
                lengthValue: document.getElementById('length-value'),
                generateBtn: document.getElementById('generate-btn'),
                strengthFill: document.getElementById('strength-fill'),
                strengthLabel: document.getElementById('strength-label'),
                historyList: document.getElementById('history-list'),
            };

            this.setupEvents();
            this.generate();
            this.renderHistory();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('pass_title');
                this.renderStrength(this.currentPassword);
                this.renderHistory();
            });
            document.title = I18N.t('pass_title');
        },

        setupEvents() {
            this.elements.lengthSlider.addEventListener('input', () => {
                this.elements.lengthValue.textContent = this.elements.lengthSlider.value;
                this.generate();
            });

            ['upper', 'lower', 'digits', 'symbols'].forEach(k => {
                document.getElementById('opt-' + k).addEventListener('change', () => {
                    if (this.selectedSets().length === 0) {
                        // keep at least one set enabled
                        document.getElementById('opt-upper').checked = true;
                    }
                    this.generate();
                });
            });

            this.elements.generateBtn.addEventListener('click', () => {
                this.generate();
                TG.haptic('light');
            });

            this.elements.copyBtn.addEventListener('click', () => this.copy());
        },

        selectedSets() {
            return ['upper', 'lower', 'digits', 'symbols'].filter(k =>
                document.getElementById('opt-' + k).checked
            );
        },

        generate() {
            const sets = this.selectedSets();
            const length = parseInt(this.elements.lengthSlider.value) || 16;
            const allChars = sets.map(k => CHARSETS[k]).join('');

            // Secure random via crypto
            const randomInt = (max) => {
                const buf = new Uint32Array(1);
                crypto.getRandomValues(buf);
                return buf[0] % max;
            };

            // Guarantee at least one char from each selected set
            const chars = sets.map(k => CHARSETS[k][randomInt(CHARSETS[k].length)]);
            for (let i = chars.length; i < length; i++) {
                chars.push(allChars[randomInt(allChars.length)]);
            }

            // Shuffle (Fisher–Yates)
            for (let i = chars.length - 1; i > 0; i--) {
                const j = randomInt(i + 1);
                [chars[i], chars[j]] = [chars[j], chars[i]];
            }

            this.currentPassword = chars.join('');
            this.elements.output.textContent = this.currentPassword;
            this.renderStrength(this.currentPassword);

            // Save history
            const history = Store.getJSON(NS, 'history', []);
            history.unshift(this.currentPassword);
            Store.setJSON(NS, 'history', history.slice(0, 5));
            this.renderHistory();
        },

        renderStrength(password) {
            const length = password.length;
            const sets = this.selectedSets();
            const charsetSize = sets.reduce((sum, k) => sum + CHARSETS[k].length, 0);
            const entropy = length * Math.log2(charsetSize || 1);

            let level, labelKey, color;
            if (entropy < 40) {
                level = 'weak';
                color = 'var(--danger-color)';
            } else if (entropy < 70) {
                level = 'medium';
                color = 'var(--warning-color)';
            } else {
                level = 'strong';
                color = 'var(--success-color)';
            }
            labelKey = 'pass_' + level;

            this.elements.strengthFill.style.width = Math.min(100, (entropy / 90) * 100) + '%';
            this.elements.strengthFill.style.background = color;
            this.elements.strengthLabel.textContent = I18N.t(labelKey);
            this.elements.strengthLabel.className = 'strength-label ' + level;
        },

        async copy() {
            if (!this.currentPassword) return;
            try {
                await navigator.clipboard.writeText(this.currentPassword);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = this.currentPassword;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            TG.toast(I18N.t('pass_copied'), 'success');
            TG.haptic('light');
        },

        renderHistory() {
            const history = Store.getJSON(NS, 'history', []);
            if (history.length === 0) {
                this.elements.historyList.innerHTML =
                    `<div class="empty-note">${I18N.t('pass_empty')}</div>`;
                return;
            }
            this.elements.historyList.innerHTML = history.map(p =>
                `<div class="history-item">${p}
                    <button data-p="${p}" title="copy">📋</button>
                </div>`
            ).join('');

            this.elements.historyList.querySelectorAll('[data-p]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    try { await navigator.clipboard.writeText(btn.dataset.p); } catch {}
                    TG.toast(I18N.t('pass_copied'), 'success');
                });
            });
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();