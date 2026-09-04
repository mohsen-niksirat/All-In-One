/**
 * app.js — News Reader (GNews — free key, CORS enabled).
 * Key is entered once in the in-app settings screen and stored on-device
 * (mirrored to Telegram CloudStorage inside Telegram), exactly like AI Chat.
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        nws_title: 'خواننده اخبار',
        nws_back: 'بازگشت به لیست اپ‌ها',
        nws_settings: 'تنظیمات',
        nws_set_title: 'تنظیمات',
        nws_key_label: 'کلید API گنیوز (GNews)',
        nws_key_ph: 'کلید را اینجا جای‌گذاری کنید',
        nws_key_hint: 'کلید رایگان از gnews.io — ۱۰۰ درخواست در روز',
        nws_save: 'ذخیره',
        nws_close: 'بستن',
        nws_saved: 'کلید ذخیره شد!',
        nws_need_key_title: 'کلید API لازم است',
        nws_need_key_text: 'این اپ برای دریافت اخبار به کلید رایگان GNews نیاز دارد. کلید را یک‌بار در تنظیمات وارد کنید تا همیشه ذخیره بماند.',
        nws_open_settings: 'باز کردن تنظیمات',
        nws_search: 'جستجو',
        nws_search_ph: 'جستجوی خبر...',
        nws_refresh: 'تازه‌سازی',
        nws_loading: 'در حال دریافت اخبار…',
        nws_no_articles: 'خبری پیدا نشد. عبارت یا دسته را عوض کنید.',
        nws_error_key: 'کلید نامعتبر یا محدودیت روزانه (۱۰۰ درخواست) — در تنظیمات بررسی کنید',
        nws_error_net: 'خطا در دریافت اخبار — اتصال را بررسی کنید',
        nws_error_http: 'خطای سرویس ({code})',
        nws_open: 'باز کردن خبر',
        nws_cat_general: 'عمومی',
        nws_cat_world: 'جهان',
        nws_cat_business: 'اقتصاد',
        nws_cat_technology: 'فناوری',
        nws_cat_sports: 'ورزش',
        nws_cat_science: 'علم',
        nws_cat_health: 'سلامت',
        nws_cat_entertainment: 'سرگرمی',
    });

    I18N.register('en', {
        nws_title: 'News Reader',
        nws_back: 'Back to apps',
        nws_settings: 'Settings',
        nws_set_title: 'Settings',
        nws_key_label: 'GNews API key',
        nws_key_ph: 'paste key here',
        nws_key_hint: 'Free key at gnews.io — 100 requests/day',
        nws_save: 'Save',
        nws_close: 'Close',
        nws_saved: 'Key saved!',
        nws_need_key_title: 'API key required',
        nws_need_key_text: 'This app needs a free GNews API key to fetch headlines. Enter it once in the settings and it stays saved.',
        nws_open_settings: 'Open settings',
        nws_search: 'Search',
        nws_search_ph: 'Search news...',
        nws_refresh: 'Refresh',
        nws_loading: 'Loading news…',
        nws_no_articles: 'No articles found. Try a different query or category.',
        nws_error_key: 'Invalid key or daily limit reached (100/day) — check the settings',
        nws_error_net: 'Could not load news — check your connection',
        nws_error_http: 'Service error ({code})',
        nws_open: 'Open article',
        nws_cat_general: 'General',
        nws_cat_world: 'World',
        nws_cat_business: 'Business',
        nws_cat_technology: 'Technology',
        nws_cat_sports: 'Sports',
        nws_cat_science: 'Science',
        nws_cat_health: 'Health',
        nws_cat_entertainment: 'Entertainment',
    });

    I18N.register('ar', {
        nws_title: 'قارئ الأخبار',
        nws_back: 'العودة إلى التطبيقات',
        nws_settings: 'الإعدادات',
        nws_set_title: 'الإعدادات',
        nws_key_label: 'مفتاح GNews',
        nws_key_ph: 'الصق المفتاح هنا',
        nws_key_hint: 'مفتاح مجاني من gnews.io — 100 طلب يومياً',
        nws_save: 'حفظ',
        nws_close: 'إغلاق',
        nws_saved: 'تم حفظ المفتاح!',
        nws_need_key_title: 'مطلوب مفتاح API',
        nws_need_key_text: 'يحتاج هذا التطبيق إلى مفتاح GNews مجاني لجلب العناوين. أدخله مرة واحدة في الإعدادات وسيبقى محفوظاً.',
        nws_open_settings: 'فتح الإعدادات',
        nws_search: 'بحث',
        nws_search_ph: 'ابحث في الأخبار...',
        nws_refresh: 'تحديث',
        nws_loading: 'جارٍ تحميل الأخبار…',
        nws_no_articles: 'لا توجد مقالات. جرّب كلمة أو فئة أخرى.',
        nws_error_key: 'مفتاح غير صالح أو تم بلوغ الحد اليومي (100) — تحقق من الإعدادات',
        nws_error_net: 'تعذّر تحميل الأخبار — تحقق من اتصالك',
        nws_error_http: 'خطأ في الخدمة ({code})',
        nws_open: 'فتح المقال',
        nws_cat_general: 'عام',
        nws_cat_world: 'العالم',
        nws_cat_business: 'أعمال',
        nws_cat_technology: 'تقنية',
        nws_cat_sports: 'رياضة',
        nws_cat_science: 'علوم',
        nws_cat_health: 'صحة',
        nws_cat_entertainment: 'ترفيه',
    });

    const NS = 'news-reader';

    // GNews content languages (Persian is not offered by GNews yet).
    const LANG_OPTS = [
        ['en', 'English'], ['ar', 'العربية'], ['fr', 'Français'], ['de', 'Deutsch'],
        ['es', 'Español'], ['ru', 'Русский'], ['hi', 'हिन्दी'], ['zh', '中文'], ['ja', '日本語'],
    ];

    const CATS = ['general', 'world', 'business', 'technology', 'sports', 'science', 'health', 'entertainment'];

    const App = {
        state: { cat: 'general', q: '', lang: 'en', fetching: false },

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                needKey: document.getElementById('need-key'),
                controls: document.getElementById('controls'),
                settingsBtn: document.getElementById('settings-btn'),
                modal: document.getElementById('settings-modal'),
                closeModal: document.getElementById('close-modal'),
                saveKey: document.getElementById('save-key'),
                keyInput: document.getElementById('api-key-input'),
                nkOpen: document.getElementById('nk-open-settings'),
                cats: document.getElementById('cats'),
                q: document.getElementById('q'),
                qBtn: document.getElementById('q-btn'),
                refresh: document.getElementById('refresh'),
                lang: document.getElementById('lang'),
                status: document.getElementById('status'),
                feed: document.getElementById('feed'),
            };

            this.setupSettings();
            this.renderCats();
            this.setupLang();
            this.setupQuery();
            this.elements.refresh.addEventListener('click', () => this.fetch());

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('nws_title');
                this.renderCats();
                if (this.hasKey()) this.fetch(true);
            });
            document.title = I18N.t('nws_title');

            this.checkKey();
        },

        hasKey() {
            return Boolean(Store.get(NS, 'gnewsKey', ''));
        },

        // ---- Key gate + settings modal (same pattern as AI Chat) ----
        checkKey() {
            const has = this.hasKey();
            this.elements.needKey.classList.toggle('hidden', has);
            this.elements.controls.classList.toggle('hidden', !has);
            if (has) this.fetch();
        },

        setupSettings() {
            const open = () => {
                this.elements.keyInput.value = Store.get(NS, 'gnewsKey', '');
                this.elements.modal.classList.remove('hidden');
            };
            this.elements.settingsBtn.addEventListener('click', open);
            this.elements.nkOpen.addEventListener('click', open);
            this.elements.closeModal.addEventListener('click', () => {
                this.elements.modal.classList.add('hidden');
            });
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) this.elements.modal.classList.add('hidden');
            });
            this.elements.saveKey.addEventListener('click', () => {
                const key = this.elements.keyInput.value.trim();
                if (key) {
                    Store.set(NS, 'gnewsKey', key);
                    this.elements.modal.classList.add('hidden');
                    this.checkKey();
                    TG.toast(I18N.t('nws_saved'), 'success');
                    TG.haptic('medium');
                } else {
                    TG.haptic('error');
                }
            });
        },

        // ---- Categories ----
        renderCats() {
            this.elements.cats.innerHTML = CATS.map(c =>
                `<button type="button" class="cat-pill${c === this.state.cat ? ' active' : ''}" data-cat="${c}">${I18N.t('nws_cat_' + c)}</button>`
            ).join('');
            this.elements.cats.querySelectorAll('.cat-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    if (pill.dataset.cat === this.state.cat) return;
                    this.state.cat = pill.dataset.cat;
                    this.state.q = '';
                    this.elements.q.value = '';
                    this.renderCats();
                    this.fetch();
                });
            });
        },

        // ---- Language + query ----
        setupLang() {
            this.elements.lang.innerHTML = LANG_OPTS.map(([code, label]) =>
                `<option value="${code}"${code === this.state.lang ? ' selected' : ''}>${label}</option>`
            ).join('');
            this.elements.lang.addEventListener('change', () => {
                this.state.lang = this.elements.lang.value;
                this.fetch();
            });
        },

        setupQuery() {
            const go = () => {
                const q = this.elements.q.value.trim();
                if (!q) return;
                this.state.q = q;
                this.renderCats();
                this.fetch();
            };
            this.elements.qBtn.addEventListener('click', go);
            this.elements.q.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') go();
            });
        },

        // ---- Fetching ----
        setStatus(msg, isError) {
            this.elements.status.textContent = msg;
            this.elements.status.classList.toggle('error', Boolean(isError));
        },

        async fetch(silent) {
            const key = Store.get(NS, 'gnewsKey', '');
            if (!key || this.state.fetching) return;
            if (typeof fetch !== 'function') {
                this.setStatus(I18N.t('nws_error_net'), true);
                return;
            }
            this.state.fetching = true;
            if (!silent) this.setStatus(I18N.t('nws_loading'));
            try {
                const base = this.state.q
                    ? 'https://gnews.io/api/v4/search'
                    : 'https://gnews.io/api/v4/top-headlines';
                const params = new URLSearchParams({
                    lang: this.state.lang,
                    max: '10',
                    apikey: key,
                });
                if (this.state.q) params.set('q', this.state.q);
                else params.set('category', this.state.cat);

                const res = await fetch(`${base}?${params}`);
                if (res.status === 401 || res.status === 403) {
                    this.setStatus(I18N.t('nws_error_key'), true);
                    return;
                }
                if (!res.ok) {
                    this.setStatus(I18N.t('nws_error_http', { code: res.status }), true);
                    return;
                }
                const data = await res.json();
                this.renderFeed(data.articles || []);
                this.setStatus('');
            } catch (e) {
                this.setStatus(I18N.t('nws_error_net'), true);
            } finally {
                this.state.fetching = false;
            }
        },

        // ---- Rendering ----
        timeAgo(iso) {
            if (!iso) return '';
            const then = new Date(iso).getTime();
            const diff = Math.max(0, Date.now() - then);
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return 'now';
            if (mins < 60) return mins + 'm';
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return hrs + 'h';
            return Math.floor(hrs / 24) + 'd';
        },

        escape(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        openArticle(url) {
            TG.haptic('light');
            if (TG.webApp && typeof TG.webApp.openLink === 'function') {
                TG.webApp.openLink(url);
            } else {
                window.open(url, '_blank');
            }
        },

        renderFeed(articles) {
            if (articles.length === 0) {
                this.elements.feed.innerHTML =
                    `<div class="empty-state"><div class="empty-icon">📰</div><p>${I18N.t('nws_no_articles')}</p></div>`;
                return;
            }
            this.elements.feed.innerHTML = articles.map(a => {
                const img = a.image
                    ? `<img src="${this.escape(a.image)}" alt="" loading="lazy">`
                    : '';
                return `
                    <button type="button" class="article${a.image ? '' : ' noimg'}" data-url="${this.escape(a.url || '')}">
                        ${img}
                        <div class="art-body">
                            <div class="art-title">${this.escape(a.title || '')}</div>
                            ${a.description ? `<p class="art-desc">${this.escape(a.description)}</p>` : ''}
                            <div class="art-meta">
                                <span class="art-src">${this.escape((a.source && a.source.name) || '')}</span>
                                <span class="art-time">${this.timeAgo(a.publishedAt)}</span>
                            </div>
                        </div>
                    </button>
                `;
            }).join('');
            this.elements.feed.querySelectorAll('.article').forEach(art => {
                art.addEventListener('click', () => {
                    if (art.dataset.url) this.openArticle(art.dataset.url);
                });
            });
            this.elements.feed.querySelectorAll('img').forEach(img => {
                img.addEventListener('error', () => {
                    const card = img.closest ? img.closest('.article') : null;
                    if (card) card.classList.add('noimg');
                    img.remove();
                });
            });
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();
