/**
 * app.js — Markdown Preview (core layer, trilingual fa/en/ar).
 * Ships a compact dependency-free markdown renderer.
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        md_title: 'پیش‌نمایش مارک‌داون',
        md_write: 'نوشتن',
        md_preview: 'پیش‌نمایش',
        md_placeholder: 'متن مارک‌داون بنویسید...',
        md_words: '{n} کلمه',
        md_empty_preview: 'هنوز چیزی ننوشته‌اید',
        md_copy_html: 'کپی HTML',
        md_copied: 'کپی شد!',
        md_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        md_title: 'Markdown Preview',
        md_write: 'Write',
        md_preview: 'Preview',
        md_placeholder: 'Write markdown here...',
        md_words: '{n} words',
        md_empty_preview: 'Nothing to preview yet',
        md_copy_html: 'Copy HTML',
        md_copied: 'Copied!',
        md_back: 'Back to apps',
    });

    I18N.register('ar', {
        md_title: 'معاينة ماركداون',
        md_write: 'كتابة',
        md_preview: 'معاينة',
        md_placeholder: 'اكتب ماركداون هنا...',
        md_words: '{n} كلمات',
        md_empty_preview: 'لا شيء للمعاينة بعد',
        md_copy_html: 'نسخ HTML',
        md_copied: 'تم النسخ!',
        md_back: 'العودة إلى التطبيقات',
    });

    // ---- Compact markdown renderer ----
    function inline(text) {
        return text
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            .replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    }

    function renderMarkdown(src) {
        let html = src
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const lines = html.split('\n');
        const out = [];
        let inCode = false;
        let codeBuf = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (/^```/.test(line.trim())) {
                if (inCode) {
                    out.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>');
                    codeBuf = [];
                    inCode = false;
                } else {
                    inCode = true;
                }
                continue;
            }
            if (inCode) {
                codeBuf.push(line);
                continue;
            }

            const h = line.match(/^(#{1,6})\s+(.*)$/);
            if (h) {
                const level = h[1].length;
                out.push(`<h${level}>${inline(h[2])}</h${level}>`);
                continue;
            }
            if (/^\s*---+\s*$/.test(line)) {
                out.push('<hr>');
                continue;
            }
            const bq = line.match(/^>\s?(.*)$/);
            if (bq) {
                out.push(`<blockquote>${inline(bq[1])}</blockquote>`);
                continue;
            }
            const ul = line.match(/^[-*+]\s+(.*)$/);
            if (ul) {
                out.push(`<ul><li>${inline(ul[1])}</li></ul>`);
                continue;
            }
            const ol = line.match(/^\d+\.\s+(.*)$/);
            if (ol) {
                out.push(`<ol><li>${inline(ol[1])}</li></ol>`);
                continue;
            }
            if (line.trim() === '') continue;

            out.push(`<p>${inline(line)}</p>`);
        }

        if (inCode && codeBuf.length) {
            out.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>');
        }

        return out.join('\n');
    }

    const App = {
        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                input: document.getElementById('md-input'),
                preview: document.getElementById('md-preview'),
                wordCount: document.getElementById('word-count'),
                copyHtml: document.getElementById('copy-html'),
                tabWrite: document.getElementById('tab-write'),
                tabPreview: document.getElementById('tab-preview'),
                paneWrite: document.getElementById('pane-write'),
                panePreview: document.getElementById('pane-preview'),
            };

            this.setupEvents();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('md_title');
                this.render();
            });
            document.title = I18N.t('md_title');
        },

        setupEvents() {
            this.elements.input.addEventListener('input', () => this.render());

            // Mobile tabs
            this.elements.tabWrite.addEventListener('click', () => this.showTab('write'));
            this.elements.tabPreview.addEventListener('click', () => this.showTab('preview'));

            this.elements.copyHtml.addEventListener('click', async () => {
                const html = renderMarkdown(this.elements.input.value);
                try {
                    await navigator.clipboard.writeText(html);
                } catch {
                    const ta = document.createElement('textarea');
                    ta.value = html;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }
                TG.toast(I18N.t('md_copied'), 'success');
                TG.haptic('light');
            });
        },

        showTab(name) {
            this.elements.tabWrite.classList.toggle('active', name === 'write');
            this.elements.tabPreview.classList.toggle('active', name === 'preview');
            this.elements.paneWrite.classList.toggle('hidden-mobile', name !== 'write');
            this.elements.panePreview.classList.toggle('hidden-mobile', name !== 'preview');
        },

        render() {
            const src = this.elements.input.value;

            if (!src.trim()) {
                this.elements.preview.innerHTML =
                    `<div class="empty-note">${I18N.t('md_empty_preview')}</div>`;
            } else {
                this.elements.preview.innerHTML = renderMarkdown(src);
            }

            const words = src.trim().split(/\s+/).filter(Boolean).length;
            this.elements.wordCount.textContent = I18N.t('md_words', { n: words });
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();