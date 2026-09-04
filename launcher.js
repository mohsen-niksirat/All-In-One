/**
 * launcher.js — renders the app grid from APP_REGISTRY, fully bilingual.
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
            return `<a class="app-card" href="${app.path}" onclick="TG.haptic('light')">${inner}</a>`;
        }
        return `<div class="app-card soon">${inner}<span class="soon-badge">${I18N.t('hub_soon')}</span></div>`;
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

    searchInput.addEventListener('input', applyFilter);

    // Re-render when the language changes
    document.addEventListener('i18n:changed', () => {
        refresh();
        TG.haptic('light');
    });

    // ---- Init ----
    refresh();
})();