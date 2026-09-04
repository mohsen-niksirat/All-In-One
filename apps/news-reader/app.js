/**
 * app.js — News Reader with two modes:
 *  1. Free mode (no key): BBC RSS feeds via rss2json (fa / en / ar) — zero setup.
 *  2. GNews mode (free key entered in the in-app settings screen): categories,
 *     full-text search, more languages. Key stored on-device like AI Chat.
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
        nws_need_key_title: 'حالت رایگان — فیدهای BBC',
        nws_need_key_text: 'بدون کلید از فیدهای BBC استفاده می‌شود. برای دسته‌بندی و جستجو، کلید رایگان GNews را در تنظیمات اضافه کنید.',
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
        nws_time_now: 'همین حالا',
        nws_time_min: '{n} د',
        nws_time_hour: '{n} س',
        nws_time_day: '{n} ر',
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
        nws_need_key_title: 'Free mode — BBC feeds',
        nws_need_key_text: 'Reading free BBC feeds. Add a free GNews key in the settings to unlock categories & search.',
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
        nws_time_now: 'now',
        nws_time_min: '{n}m',
        nws_time_hour: '{n}h',
        nws_time_day: '{n}d',
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
        nws_need_key_title: 'الوضع المجاني — موجزات BBC',
        nws_need_key_text: 'تقرأ موجزات BBC المجانية. أضف مفتاح GNews المجاني في الإعدادات لتفعيل الفئات والبحث.',
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
        nws_time_now: 'الآن',
        nws_time_min: '{n} د',
        nws_time_hour: '{n} س',
        nws_time_day: '{n} ي',
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

    // Free-mode feeds (BBC): language → RSS url. Persian works here even though GNews lacks it.
    const FEEDS = {
        fa: 'https://feeds.bbci.co.uk/persian/rss.xml',
        en: 'https://feeds.bbci.co.uk/news/world/rss.xml',
        ar: 'https://feeds.bbci.co.uk/arabic/rss.xml',
    };

    // GNews content languages (fa is not offered by GNews).
    const LANG_OPTS = [
        ['en', 'English'], ['ar', 'العربية'], ['fr', 'Français'], ['de', 'Deutsch'],
        ['es', 'Español'], ['ru', 'Русский'], ['hi', 'हिन्दी'], ['zh', '中文'], ['ja', '日本語'],
    ];

    const CATS = ['general', 'world', 'business', 'technology', 'sports', 'science', 'health', 'entertainment'];

    const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

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
                searchRow: document.getElementById('search-row'),
                refresh: document.getElementById('refresh'),
                lang: document.getElementById('lang'),
                status: document.getElementById('status'),
                feed: document.getElementById('feed'),
            };

            this.setupSettings();
            this.setupLang();
            this.setupQuery();
            this.elements.refresh.addEventListener('click', () => this.fetch());

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('nws_title');
                this.renderCats();
                if (this.hasKey() && this.state.lang === 'fa') this.state.lang = 'en';
                this.renderLang();
                this.fetch(true);
            });
            document.title = I18N.t('nws_title');

            this.checkMode();
        },

        hasKey() {
            return Boolean(Store.get(NS, 'gnewsKey', ''));
        },

        // ---- Mode: keyless BBC RSS  vs  GNews ----
        checkMode() {
            const keyed = this.hasKey();
            this.elements.needKey.classList.toggle('hidden', keyed);
            if (keyed && this.state.lang === 'fa') this.state.lang = 'en';
            this.renderLang();
            this.renderCats();
            this.fetch();
        },

        // ---- Settings modal (same pattern as AI Chat) ----
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
                    this.checkMode();
                    TG.toast(I18N.t('nws_saved'), 'success');
                    TG.haptic('medium');
                } else {
                    TG.haptic('error');
                }
            });
        },

        // ---- Categories (GNews mode only) ----
        renderCats() {
            const keyed = this.hasKey();
            if (!keyed) {
                this.elements.cats.innerHTML = '';
                return;
            }
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
            this.renderLang();
            this.elements.lang.addEventListener('change', () => {
                this.state.lang = this.elements.lang.value;
                this.fetch();
            });
        },

        renderLang() {
            const keyed = this.hasKey();
            this.elements.searchRow.classList.toggle('hidden', !keyed);
            const opts = keyed
                ? LANG_OPTS
                : [['fa', 'فارسی'], ['en', 'English'], ['ar', 'العربية']];
            const current = opts.some(([c]) => c === this.state.lang)
                ? this.state.lang
                : (keyed ? 'en' : 'fa');
            this.state.lang = current;
            this.elements.lang.innerHTML = opts.map(([code, label]) =>
                `<option value="${code}"${code === current ? ' selected' : ''}>${label}</option>`
            ).join('');
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
            if (this.state.fetching) return;
            if (typeof fetch !== 'function') {
                this.setStatus(I18N.t('nws_error_net'), true);
                return;
            }
            this.state.fetching = true;
            if (!silent) this.setStatus(I18N.t('nws_loading'));
            try {
                if (this.hasKey()) {
                    await this.fetchGNews();
                } else {
                    await this.fetchRSS();
                }
            } catch (e) {
                this.setStatus(I18N.t('nws_error_net'), true);
            } finally {
                this.state.fetching = false;
            }
        },

        async fetchGNews() {
            const key = Store.get(NS, 'gnewsKey', '');
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
            this.renderFeed((data.articles || []).map(a => ({
                title: a.title, url: a.url, image: a.image,
                description: a.description,
                source: (a.source && a.source.name) || '',
                time: a.publishedAt,
            })));
            this.setStatus('');
        },

        async fetchRSS() {
            const url = `${RSS2JSON}?rss_url=${encodeURIComponent(FEEDS[this.state.lang] || FEEDS.en)}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data || data.status !== 'ok') {
                this.setStatus(I18N.t('nws_error_net'), true);
                return;
            }
            const feedTitle = data.feed && data.feed.title ? data.feed.title : 'BBC';
            this.renderFeed((data.items || []).slice(0, 15).map(it => ({
                title: it.title,
                url: it.link,
                image: it.thumbnail || (it.enclosure && it.enclosure.link) || '',
                description: this.stripHtml(it.description || '').slice(0, 200),
                source: feedTitle,
                time: it.pubDate,
            })));
            this.setStatus('');
        },

        stripHtml(html) {
            const div = document.createElement('div');
            div.innerHTML = html;
            return div.textContent || '';
        },

        // ---- Rendering ----
        timeAgo(str) {
            if (!str) return '';
            const then = new Date(str).getTime();
            if (isNaN(then)) return '';
            const mins = Math.floor(Math.max(0, Date.now() - then) / 60000);
            if (mins < 1) return I18N.t('nws_time_now');
            if (mins < 60) return I18N.t('nws_time_min', { n: mins });
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return I18N.t('nws_time_hour', { n: hrs });
            return I18N.t('nws_time_day', { n: Math.floor(hrs / 24) });
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
                                <span class="art-src">${this.escape(a.source)}</span>
                                <span class="art-time">${this.timeAgo(a.time)}</span>
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
