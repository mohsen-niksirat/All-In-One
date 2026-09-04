/**
 * launcher.js — renders the app grid from APP_REGISTRY, fully bilingual.
 * Tap a ready app to open it; tap the ⓘ badge (or any “soon” card) to see
 * its info sheet: what it does, its data/privacy note, and whether it needs
 * a free API key.
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        hub_title: 'مینی‌اپ‌ها',
        hub_sub: 'مجموعه اپلیکیشن‌های رایگان و سرورلس',
        hub_greeting: 'سلام {name} 👋 — همه‌چیز رایگان و بدون سرور',
        hub_search: 'جستجوی اپلیکیشن...',
        hub_stats: '{ready} اپ آماده · {soon} اپ به‌زودی',
        hub_soon: 'به‌زودی',
        hub_empty: 'اپلیکیشنی پیدا نشد',
        hub_info: 'درباره این اپ',
        hub_open: 'باز کردن اپ',
        hub_close: 'بستن',
        hub_keyed: '🔑 کلید API رایگان لازم است — داخل خود اپ وارد می‌شود',
        hub_note_offline: '🔒 کاملاً آفلاین — هیچ داده‌ای از دستگاه شما خارج نمی‌شود',
        hub_note_storage: '💾 داده‌ها روی دستگاه شما می‌ماند (و در تلگرام همگام می‌شود)',
        hub_note_freeapi: '📡 از یک API رایگان شخص‌ثالث استفاده می‌کند — اینترنت لازم است',
        hub_note_serverless: '⚡ کاملاً در مرورگر شما اجرا می‌شود — بدون سرور',
        hub_note_static: '⚡ کاملاً در مرورگر شما اجرا می‌شود — بدون سرور',
        hub_data_label: 'حریم خصوصی و داده‌ها',
        hub_coming: 'این اپ به‌زودی در دسترس می‌شود',
        tag_serverless: 'سرورلس',
        tag_freeapi: 'API رایگان',
        tag_offline: 'آفلاین',
        tag_storage: 'ذخیره‌سازی',
        tag_static: 'استاتیک',
    });

    I18N.register('en', {
        hub_title: 'Mini Apps',
        hub_sub: 'Free serverless mini apps',
        hub_greeting: 'Hi {name} 👋 — everything free & serverless',
        hub_search: 'Search apps...',
        hub_stats: '{ready} ready · {soon} coming soon',
        hub_soon: 'Soon',
        hub_empty: 'No apps found',
        hub_info: 'About this app',
        hub_open: 'Open app',
        hub_close: 'Close',
        hub_keyed: '🔑 Free API key required — enter it inside the app',
        hub_note_offline: '🔒 Fully offline — nothing leaves your device',
        hub_note_storage: '💾 Data stays on your device (and syncs in Telegram)',
        hub_note_freeapi: '📡 Uses a free third-party API — internet required',
        hub_note_serverless: '⚡ Runs entirely in your browser — no server',
        hub_note_static: '⚡ Runs entirely in your browser — no server',
        hub_data_label: 'Privacy & data',
        hub_coming: 'This app is coming soon',
        tag_serverless: 'Serverless',
        tag_freeapi: 'Free API',
        tag_offline: 'Offline',
        tag_storage: 'Storage',
        tag_static: 'Static',
    });

    I18N.register('ar', {
        hub_title: 'التطبيقات المصغّرة',
        hub_sub: 'مجموعة تطبيقات مجانية بدون خادم',
        hub_greeting: 'أهلاً {name} 👋 — كل شيء مجاني وبدون خادم',
        hub_search: 'ابحث عن تطبيق...',
        hub_stats: '{ready} جاهز · {soon} قريباً',
        hub_soon: 'قريباً',
        hub_empty: 'لم يتم العثور على تطبيقات',
        hub_info: 'عن هذا التطبيق',
        hub_open: 'فتح التطبيق',
        hub_close: 'إغلاق',
        hub_keyed: '🔑 يتطلب مفتاح API مجاني — أدخله داخل التطبيق',
        hub_note_offline: '🔒 دون اتصال تماماً — لا يغادر أي شيء جهازك',
        hub_note_storage: '💾 تبقى البيانات على جهازك (وتُزامن داخل تلغرام)',
        hub_note_freeapi: '📡 يستخدم واجهة خارجية مجانية — يتطلب إنترنت',
        hub_note_serverless: '⚡ يعمل بالكامل في متصفحك — بدون خادم',
        hub_note_static: '⚡ يعمل بالكامل في متصفحك — بدون خادم',
        hub_data_label: 'الخصوصية والبيانات',
        hub_coming: 'هذا التطبيق قادم قريباً',
        tag_serverless: 'بدون خادم',
        tag_freeapi: 'واجهة مجانية',
        tag_offline: 'دون اتصال',
        tag_storage: 'تخزين',
        tag_static: 'ثابت',
    });

    TG.init();
    I18N.init();

    const grid = document.getElementById('app-grid');
    const searchInput = document.getElementById('search');
    const statsEl = document.getElementById('stats');
    const greetingEl = document.getElementById('greeting');
    const sheet = document.getElementById('app-sheet');
    const sheetBox = document.getElementById('sheet-box');
    let sheetAppId = null;

    // ---- Localized app metadata ----
    function localize(app) {
        return app.i18n[I18N.current] || app.i18n.en || app.i18n.fa;
    }

    // ---- Rendering ----
    function cardHtml(app) {
        const meta = localize(app);
        const tags = (app.tags || [])
            .map(t => `<span class="chip">${I18N.t('tag_' + t)}</span>`)
            .join('');

        const inner = `
            <div class="app-icon">${app.icon}</div>
            <div class="app-info">
                <h3>${meta.name}</h3>
                <div class="name-en">${app.i18n.en.name}</div>
                <p>${meta.desc}</p>
                <div class="app-tags">${tags}</div>
            </div>
        `;

        if (app.status === 'ready') {
            return `
                <div class="app-card ready" role="button" tabindex="0" data-id="${app.id}" data-href="${app.path}">
                    ${inner}
                    <button type="button" class="info-btn" data-info title="${I18N.t('hub_info')}">ⓘ</button>
                </div>
            `;
        }
        return `
            <div class="app-card soon" role="button" tabindex="0" data-id="${app.id}">
                ${inner}
                <span class="soon-badge">${I18N.t('hub_soon')}</span>
            </div>
        `;
    }

    function render(list) {
        if (list.length === 0) {
            grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔎</div><p>${I18N.t('hub_empty')}</p></div>`;
        } else {
            grid.innerHTML = list.map(cardHtml).join('');
        }
    }

    function updateStats(list) {
        const ready = list.filter(a => a.status === 'ready').length;
        const soon = list.filter(a => a.status === 'soon').length;
        statsEl.textContent = I18N.t('hub_stats', { ready, soon });
    }

    function updateGreeting() {
        const user = TG.user();
        if (user?.first_name) {
            greetingEl.textContent = I18N.t('hub_greeting', { name: user.first_name });
        } else {
            greetingEl.textContent = I18N.t('hub_sub');
        }
    }

    function refresh() {
        updateGreeting();
        document.title = I18N.t('hub_title');
        applyFilter();
    }

    // ---- Search ----
    function applyFilter() {
        const q = searchInput.value.trim().toLowerCase();
        const list = APP_REGISTRY.filter(app => {
            if (!q) return true;
            const meta = localize(app);
            return (
                meta.name.toLowerCase().includes(q) ||
                (app.i18n.en.name || '').toLowerCase().includes(q) ||
                meta.desc.toLowerCase().includes(q) ||
                (app.tags || []).some(t => I18N.t('tag_' + t).toLowerCase().includes(q))
            );
        });
        render(list);
        updateStats(list);
    }

    // ---- App info sheet ----
    function noteFor(app) {
        const tags = app.tags || [];
        const order = ['offline', 'storage', 'freeapi'];
        for (const t of order) {
            if (tags.includes(t)) return 'hub_note_' + t;
        }
        return tags.includes('serverless') || tags.includes('static')
            ? 'hub_note_' + tags.find(t => t === 'serverless' || t === 'static')
            : 'hub_note_serverless';
    }

    function openSheet(app) {
        sheetAppId = app.id;
        const meta = localize(app);
        const ready = app.status === 'ready';
        const tags = (app.tags || [])
            .map(t => `<span class="chip">${I18N.t('tag_' + t)}</span>`)
            .join('');

        let notes = `<li>${I18N.t(noteFor(app))}</li>`;
        if (app.keyed) notes += `<li>${I18N.t('hub_keyed')}</li>`;

        const cta = ready
            ? `<a class="btn btn-primary btn-block" href="${app.path}">${I18N.t('hub_open')}</a>`
            : `<div class="soon-cta">⏳ ${I18N.t('hub_coming')}</div>`;

        sheetBox.innerHTML = `
            <div class="sheet-head">
                <div class="sheet-icon">${app.icon}</div>
                <div class="sheet-title">
                    <h3>${meta.name}</h3>
                    <div class="sheet-en">${app.i18n.en.name}</div>
                </div>
            </div>
            <p class="sheet-desc">${meta.desc}</p>
            <div class="sheet-tags">${tags}</div>
            <div class="sheet-sec-title">${I18N.t('hub_data_label')}</div>
            <ul class="sheet-notes">${notes}</ul>
            <div class="sheet-actions">
                ${cta}
                <button type="button" class="btn btn-secondary" id="sheet-close">${I18N.t('hub_close')}</button>
            </div>
        `;
        sheet.classList.remove('hidden');
        TG.haptic('light');

        const close = document.getElementById('sheet-close');
        if (close) close.addEventListener('click', closeSheet);
    }

    function closeSheet() {
        sheet.classList.add('hidden');
        sheetAppId = null;
    }

    // Card interaction (event delegation — cards are re-rendered often)
    grid.addEventListener('click', (e) => {
        const card = e.target.closest ? e.target.closest('.app-card') : null;
        if (!card) return;
        const app = APP_REGISTRY.find(a => a.id === card.dataset.id);
        if (!app) return;
        if (e.target.closest('[data-info]')) {
            openSheet(app);
            return;
        }
        if (app.status === 'ready') {
            TG.haptic('light');
            window.location.href = card.dataset.href;
        } else {
            openSheet(app);
        }
    });

    grid.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest ? e.target.closest('.app-card') : null;
        if (!card) return;
        const app = APP_REGISTRY.find(a => a.id === card.dataset.id);
        if (!app) return;
        e.preventDefault();
        if (app.status === 'ready' && !e.target.closest('[data-info]')) {
            window.location.href = card.dataset.href;
        } else {
            openSheet(app);
        }
    });

    sheet.addEventListener('click', (e) => {
        if (e.target === sheet) closeSheet();
    });

    searchInput.addEventListener('input', applyFilter);

    // Re-render when the language changes (keep an open sheet in sync)
    document.addEventListener('i18n:changed', () => {
        refresh();
        if (sheetAppId) {
            const app = APP_REGISTRY.find(a => a.id === sheetAppId);
            if (app) openSheet(app);
        }
        TG.haptic('light');
    });

    // ---- Init ----
    refresh();
})();
