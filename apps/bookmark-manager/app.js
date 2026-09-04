/**
 * app.js — Bookmark Manager (core layer, trilingual fa/en/ar).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        bm_title: 'نشانک‌ها',
        bm_title_ph: 'عنوان',
        bm_url_ph: 'https://...',
        bm_tags_ph: 'برچسب‌ها، با کاما جدا کنید',
        bm_add: 'افزودن',
        bm_search: 'جستجو...',
        bm_empty: 'نشانکی نیست',
        bm_open: 'باز کردن',
        bm_copy: 'کپی',
        bm_copied: 'کپی شد!',
        bm_delete: 'حذف',
        bm_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        bm_title: 'Bookmarks',
        bm_title_ph: 'Title',
        bm_url_ph: 'https://...',
        bm_tags_ph: 'Tags, comma separated',
        bm_add: 'Add',
        bm_search: 'Search...',
        bm_empty: 'No bookmarks yet',
        bm_open: 'Open',
        bm_copy: 'Copy',
        bm_copied: 'Copied!',
        bm_delete: 'Delete',
        bm_back: 'Back to apps',
    });

    I18N.register('ar', {
        bm_title: 'العلامات المرجعية',
        bm_title_ph: 'العنوان',
        bm_url_ph: 'https://...',
        bm_tags_ph: 'وسوم مفصولة بفواصل',
        bm_add: 'إضافة',
        bm_search: 'ابحث...',
        bm_empty: 'لا علامات بعد',
        bm_open: 'فتح',
        bm_copy: 'نسخ',
        bm_copied: 'تم النسخ!',
        bm_delete: 'حذف',
        bm_back: 'العودة إلى التطبيقات',
    });

    const NS = 'bookmark-manager';

    const App = {
        bookmarks: [],
        tagFilter: '',
        query: '',

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.bookmarks = Store.getJSON(NS, 'bookmarks', []);

            this.elements = {
                title: document.getElementById('bm-title'),
                url: document.getElementById('bm-url'),
                tags: document.getElementById('bm-tags'),
                addBtn: document.getElementById('add-btn'),
                search: document.getElementById('bm-search'),
                tagChips: document.getElementById('tag-chips'),
                list: document.getElementById('bm-list'),
                count: document.getElementById('count'),
            };

            this.setupEvents();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('bm_title');
                this.render();
            });
            document.title = I18N.t('bm_title');
        },

        setupEvents() {
            const add = () => {
                const url = this.elements.url.value.trim();
                if (!url) {
                    this.elements.url.focus();
                    TG.haptic('error');
                    return;
                }
                const cleanUrl = /^https?:\/\//i.test(url) ? url : 'https://' + url;
                this.bookmarks.unshift({
                    id: Store.id(),
                    title: this.elements.title.value.trim() || cleanUrl.replace(/^https?:\/\//i, '').split('/')[0],
                    url: cleanUrl,
                    tags: this.elements.tags.value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
                    ts: Date.now(),
                });
                this.elements.url.value = '';
                this.elements.tags.value = '';
                this.save();
                this.render();
                TG.haptic('light');
            };
            this.elements.addBtn.addEventListener('click', add);
            this.elements.url.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') add();
            });

            this.elements.search.addEventListener('input', () => {
                this.query = this.elements.search.value.trim().toLowerCase();
                this.render();
            });
        },

        save() {
            Store.setJSON(NS, 'bookmarks', this.bookmarks);
        },

        allTags() {
            const set = new Set();
            this.bookmarks.forEach(b => b.tags.forEach(t => set.add(t)));
            return [...set].sort();
        },

        remove(id) {
            this.bookmarks = this.bookmarks.filter(b => b.id !== id);
            this.save();
            this.render();
            TG.haptic('light');
        },

        async copyUrl(url) {
            try {
                await navigator.clipboard.writeText(url);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            TG.toast(I18N.t('bm_copied'), 'success');
            TG.haptic('light');
        },

        render() {
            // Tag chips
            const tags = this.allTags();
            const chips = [
                `<button class="tag-chip${this.tagFilter === '' ? ' active' : ''}" data-tag="">${I18N.t('bm_title')}</button>`,
                ...tags.map(t =>
                    `<button class="tag-chip${this.tagFilter === t ? ' active' : ''}" data-tag="${this.escapeAttr(t)}">#${this.escape(t)}</button>`
                ),
            ];
            this.elements.tagChips.innerHTML = chips.join('');
            this.elements.tagChips.querySelectorAll('.tag-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    this.tagFilter = chip.dataset.tag;
                    this.render();
                    TG.haptic('light');
                });
            });

            // Filter + sort
            const filtered = this.bookmarks
                .filter(b => this.tagFilter === '' || b.tags.includes(this.tagFilter))
                .filter(b => {
                    if (!this.query) return true;
                    return (b.title + ' ' + b.url + ' ' + b.tags.join(' ')).toLowerCase().includes(this.query);
                });

            this.elements.count.textContent = filtered.length;
            if (filtered.length === 0) {
                this.elements.list.innerHTML = `<div class="empty-note">${I18N.t('bm_empty')}</div>`;
                return;
            }

            this.elements.list.innerHTML = filtered.map(b => {
                const host = b.url.replace(/^https?:\/\//i, '').split('/')[0];
                return `
                    <div class="bm-item" data-id="${b.id}">
                        <div class="bm-top">
                            <div class="bm-fav">🌐</div>
                            <div class="bm-main">
                                <div class="bm-title">${this.escape(b.title)}</div>
                                <div class="bm-host">${this.escape(host)}</div>
                            </div>
                            <div class="bm-actions">
                                <button class="act copy" data-i18n-title="bm_copy" title="Copy">📋</button>
                                <button class="act open" data-i18n-title="bm_open" title="Open">↗</button>
                                <button class="act del" data-i18n-title="bm_delete" title="Delete">✕</button>
                            </div>
                        </div>
                        ${b.tags.length ? `<div class="bm-tags">${b.tags.map(t => `<span class="chip">#${this.escape(t)}</span>`).join('')}</div>` : ''}
                    </div>
                `;
            }).join('');

            this.elements.list.querySelectorAll('.bm-item').forEach(item => {
                const bm = this.bookmarks.find(b => b.id === item.dataset.id);
                if (!bm) return;
                item.querySelector('.act.copy').addEventListener('click', () => this.copyUrl(bm.url));
                item.querySelector('.act.open').addEventListener('click', () => {
                    window.open(bm.url, '_blank');
                    TG.haptic('light');
                });
                item.querySelector('.act.del').addEventListener('click', () => this.remove(bm.id));
            });
        },

        escape(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        escapeAttr(text) {
            return this.escape(text).replace(/"/g, '&quot;');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();