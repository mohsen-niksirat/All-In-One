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
        hub_update_ready: 'نسخهٔ جدید آماده است — در حال به‌روزرسانی…',
        hub_changelog_title: 'تازه‌های نسخه',
        hub_refresh_title: 'بررسی به‌روزرسانی',
        hub_pull_check: '↓ برای بررسی به‌روزرسانی بکشید',
        hub_release_check: 'رها کنید تا بررسی شود',
        hub_refresh_check: 'در حال بررسی به‌روزرسانی…',
        hub_up_to_date: 'بروز است ✓',
        hub_no_sw: 'در این مرورگر بررسی ممکن نیست',
        tag_serverless: 'سرورلس',
        tag_freeapi: 'API رایگان',
        tag_offline: 'آفلاین',
        tag_storage: 'ذخیره‌سازی',
        tag_static: 'استاتیک',
        hub_backup_btn: 'پشتیبان‌گیری و داده‌ها',
        hub_backup_title: 'پشتیبان‌گیری و داده‌ها',
        hub_backup_sub: 'از همهٔ اپ‌های دارای داده یک فایل بگیرید — ساده یا رمزنگاری‌شده با رمز عبور. بازیابی فقط ادغام می‌کند و چیزی حذف نمی‌شود.',
        hub_backup_all: 'پشتیبان همه (JSON)',
        hub_backup_enc: 'پشتیبان رمزنگاری‌شده',
        hub_backup_restore: 'بازیابی از فایل',
        hub_backup_none: 'داده‌ای برای پشتیبان نیست',
        hub_backup_never: 'هنوز پشتیبان نگرفته',
        hub_backup_last: 'آخرین پشتیبان: {date}',
        hub_backup_due: '{n} اپ داده‌ای دارند که مدت‌هاست پشتیبان نگرفته‌اند',
        hub_backup_now: 'همین حالا پشتیبان بگیر',
        hub_backup_dismiss: 'فعلاً نه',
        hub_backup_done: 'پشتیبان همهٔ اپ‌ها آماده شد ✓',
        hub_restore_preview: 'فایل شامل {n} اپ است ({a} مورد جدید، {u} به‌روزرسانی) — ادامه می‌دهید؟',
        hub_restored: 'دادهٔ {n} اپ ادغام شد ✓',
        hub_restore_bad: 'فایل پشتیبان شناخته‌شده نیست',
        hub_pw_set: 'رمز عبور فایل پشتیبان را انتخاب کنید',
        hub_pw_ask: 'رمز عبور فایل را وارد کنید',
        hub_pw_ph: 'رمز عبور',
        hub_pw_repeat_ph: 'تکرار رمز عبور',
        hub_pw_mismatch: 'رمزها یکی نیستند',
        hub_pw_short: 'رمز باید دست‌کم ۴ نویسه باشد',
        hub_pw_wrong: 'رمز اشتباه است یا فایل آسیب دیده',
        hub_pw_ok: 'تأیید',
        hub_pw_cancel: 'انصراف',
        hub_enc_unsupported: 'رمزنگاری در این مرورگر در دسترس نیست',
        hub_theme_btn: 'انتخاب تم',
        hub_theme_title: 'تم برنامه',
        hub_theme_sub: 'رنگ تم روی همهٔ اپ‌ها اعمال می‌شود؛ روشن/تیره همچنان با تلگرام هماهنگ است',
        hub_theme_saved: 'تم اعمال شد ✓',
        hub_restore_drop: 'فایل پشتیبان را رها کنید تا بازیابی شود',
        theme_default: 'پیش‌فرض (تلگرام)',
        theme_ocean: 'اقیانوس',
        theme_sunset: 'غروب',
        theme_forest: 'جنگل',
        theme_royal: 'سلطنتی',
        theme_candy: 'صورتی',
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
        hub_update_ready: 'New version ready — updating…',
        hub_changelog_title: "What's new",
        hub_refresh_title: 'Check for updates',
        hub_pull_check: '↓ Pull down to check for updates',
        hub_release_check: 'Release to check',
        hub_refresh_check: 'Checking for updates…',
        hub_up_to_date: "You're up to date ✓",
        hub_no_sw: 'Update check unavailable here',
        tag_serverless: 'Serverless',
        tag_freeapi: 'Free API',
        tag_offline: 'Offline',
        tag_storage: 'Storage',
        tag_static: 'Static',
        hub_backup_btn: 'Data & backups',
        hub_backup_title: 'Data & backups',
        hub_backup_sub: 'Back up every app that stores data into one file — plain or password-encrypted. Restoring merges and never deletes anything.',
        hub_backup_all: 'Back up all (JSON)',
        hub_backup_enc: 'Encrypted backup',
        hub_backup_restore: 'Restore from file',
        hub_backup_none: 'Nothing to back up yet',
        hub_backup_never: 'Never backed up',
        hub_backup_last: 'Last backup: {date}',
        hub_backup_due: '{n} app(s) with data haven’t been backed up recently',
        hub_backup_now: 'Back up now',
        hub_backup_dismiss: 'Not now',
        hub_backup_done: 'Backed up all apps ✓',
        hub_restore_preview: 'File covers {n} apps ({a} new items, {u} updates) — merge it in?',
        hub_restored: 'Merged data for {n} apps ✓',
        hub_restore_bad: 'Unrecognized backup file',
        hub_pw_set: 'Choose a password for the backup file',
        hub_pw_ask: 'Enter the backup password',
        hub_pw_ph: 'Password',
        hub_pw_repeat_ph: 'Repeat password',
        hub_pw_mismatch: 'Passwords do not match',
        hub_pw_short: 'Password must be at least 4 characters',
        hub_pw_wrong: 'Wrong password or damaged file',
        hub_pw_ok: 'OK',
        hub_pw_cancel: 'Cancel',
        hub_enc_unsupported: 'Encryption is not available in this browser',
        hub_theme_btn: 'Choose theme',
        hub_theme_title: 'Theme',
        hub_theme_sub: 'The accent color applies across all apps; light/dark still follows Telegram',
        hub_theme_saved: 'Theme applied ✓',
        hub_restore_drop: 'Drop the backup file here to restore',
        theme_default: 'Default (Telegram)',
        theme_ocean: 'Ocean',
        theme_sunset: 'Sunset',
        theme_forest: 'Forest',
        theme_royal: 'Royal',
        theme_candy: 'Candy',
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
        hub_update_ready: 'الإصدار الجديد جاهز — جارٍ التحديث…',
        hub_changelog_title: 'ما الجديد',
        hub_refresh_title: 'التحقق من التحديثات',
        hub_pull_check: '↓ اسحب للأسفل للتحقق من التحديثات',
        hub_release_check: 'أفلت للتحقق',
        hub_refresh_check: 'جارٍ التحقق من التحديثات…',
        hub_up_to_date: 'أنت على أحدث إصدار ✓',
        hub_no_sw: 'التحقق غير متاح في هذا المتصفح',
        tag_serverless: 'بدون خادم',
        tag_freeapi: 'واجهة مجانية',
        tag_offline: 'دون اتصال',
        tag_storage: 'تخزين',
        tag_static: 'ثابت',
        hub_backup_btn: 'النسخ الاحتياطي والبيانات',
        hub_backup_title: 'النسخ الاحتياطي والبيانات',
        hub_backup_sub: 'انسخ جميع التطبيقات التي تخزّن البيانات في ملف واحد — عادي أو مشفّر بكلمة مرور. الاستعادة تدمج ولا تحذف شيئاً.',
        hub_backup_all: 'نسخ الكل (JSON)',
        hub_backup_enc: 'نسخة مشفّرة',
        hub_backup_restore: 'استعادة من ملف',
        hub_backup_none: 'لا يوجد شيء للنسخ بعد',
        hub_backup_never: 'لم تُنشأ نسخة بعد',
        hub_backup_last: 'آخر نسخة: {date}',
        hub_backup_due: '{n} تطبيقات لديها بيانات لم تُنسخ منذ مدة',
        hub_backup_now: 'انسخ الآن',
        hub_backup_dismiss: 'ليس الآن',
        hub_backup_done: 'تم نسخ جميع التطبيقات ✓',
        hub_restore_preview: 'يغطي الملف {n} تطبيقات ({a} عناصر جديدة، {u} تحديثات) — هل ندمجها؟',
        hub_restored: 'تم دمج بيانات {n} تطبيقات ✓',
        hub_restore_bad: 'ملف نسخة احتياطية غير معروف',
        hub_pw_set: 'اختر كلمة مرور للملف الاحتياطي',
        hub_pw_ask: 'أدخل كلمة مرور الملف',
        hub_pw_ph: 'كلمة المرور',
        hub_pw_repeat_ph: 'أعد كتابة كلمة المرور',
        hub_pw_mismatch: 'كلمتا المرور غير متطابقتين',
        hub_pw_short: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل',
        hub_pw_wrong: 'كلمة مرور خاطئة أو ملف تالف',
        hub_pw_ok: 'موافق',
        hub_pw_cancel: 'إلغاء',
        hub_enc_unsupported: 'التشفير غير متاح في هذا المتصفح',
        hub_theme_btn: 'اختيار المظهر',
        hub_theme_title: 'المظهر',
        hub_theme_sub: 'يُطبَّق لون المظهر على جميع التطبيقات؛ الفاتح/الداكن يتبع تلغرام تلقائياً',
        hub_theme_saved: 'تم تطبيق المظهر ✓',
        hub_restore_drop: 'أفلت ملف النسخة الاحتياطية هنا للاستعادة',
        theme_default: 'الافتراضي (تلغرام)',
        theme_ocean: 'محيط',
        theme_sunset: 'غروب',
        theme_forest: 'غابة',
        theme_royal: 'ملكي',
        theme_candy: 'وردي',
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
        // Last-backup date for storage-backed apps that have one
        const bkTs = (app.status === 'ready' && typeof Backup !== 'undefined'
            && Backup.defById(app.id)) ? Backup.lastBackup(app.id) : 0;
        const bkChip = bkTs > 0
            ? `<div class="card-backup">💾 <span>${Backup.fmtDate(bkTs)}</span></div>`
            : '';

        const inner = `
            <div class="app-icon">${app.icon}</div>
            <div class="app-info">
                <h3>${meta.name}</h3>
                <div class="name-en">${app.i18n.en.name}</div>
                <p>${meta.desc}</p>
                <div class="app-tags">${tags}</div>
                ${bkChip}
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
        if (!changelogSheet.classList.contains('hidden')) openChangelog();
        if (typeof themeSheet !== 'undefined' && !themeSheet.classList.contains('hidden')) renderThemeSheet();
        refreshBackupUI();
        TG.haptic('light');
    });

    // ---- Version badge + update detection ----
    // The badge (vX.Y.Z) and the 'new version — reload' banner live in
    // core/tg.js so every page has them. Here we add the changelog sheet
    // opened by tapping the badge (only the launcher loads the data).
    const changelogSheet = document.getElementById('changelog-sheet');
    const changelogBox = document.getElementById('changelog-box');

    function openChangelog() {
        if (typeof APP_CHANGELOG === 'undefined') return;
        const entries = APP_CHANGELOG.map((entry) => {
            const lines = entry.i18n[I18N.current] || entry.i18n.en || [];
            const tryBtn = entry.link
                ? `<button type="button" class="btn btn-primary cl-link" data-app-link="${entry.link}">${I18N.t('hub_open')}</button>`
                : '';
            return `
                <div class="cl-entry">
                    <div class="cl-ver"><span class="cl-icon">${entry.icon || '✨'}</span> v${entry.version}</div>
                    <ul class="cl-lines">
                        ${lines.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                    ${tryBtn ? `<div class="cl-actions">${tryBtn}</div>` : ''}
                </div>
            `;
        }).join('');
        changelogBox.innerHTML = `
            <div class="sheet-head">
                <div class="sheet-icon">📣</div>
                <div class="sheet-title"><h3>${I18N.t('hub_changelog_title')}</h3></div>
            </div>
            <div class="cl-list">${entries}</div>
            <div class="sheet-actions">
                <button type="button" class="btn btn-secondary" id="changelog-close">${I18N.t('hub_close')}</button>
            </div>
        `;
        changelogSheet.classList.remove('hidden');
        TG.haptic('light');
        const close = document.getElementById('changelog-close');
        if (close) close.addEventListener('click', closeChangelog);
    }

    function closeChangelog() {
        changelogSheet.classList.add('hidden');
    }

    const badgeEl = document.getElementById('version-badge');
    if (badgeEl) badgeEl.addEventListener('click', openChangelog);

    changelogSheet.addEventListener('click', (e) => {
        if (e.target === changelogSheet) closeChangelog();
    });
    changelogBox.addEventListener('click', (e) => {
        const btn = e.target.closest ? e.target.closest('[data-app-link]') : null;
        if (btn) launchApp(btn.dataset.appLink);
    });

    // ---- Deep links ----
    // Open a specific app when the hub URL carries #<app-id> or when Telegram
    // starts the web app with ?startapp=<app-id> (start_param).
    function launchApp(id) {
        const app = APP_REGISTRY.find(a => a.id === id);
        if (!app) return;
        TG.haptic('light');
        if (app.status === 'ready' && app.path) {
            // Clear the hash so pressing Back lands on the launcher, not on a re-trigger.
            try {
                if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
            } catch (e) { /* ignore */ }
            location.assign(app.path);
        } else {
            openSheet(app); // “soon” apps open their info sheet
        }
    }

    function openDeepLink() {
        let id = '';
        try { id = decodeURIComponent((location.hash || '').replace(/^#/, '')); } catch (e) { id = ''; }
        if (!id) {
            try { id = (TG.webApp && TG.webApp.initDataUnsafe && TG.webApp.initDataUnsafe.start_param) || ''; } catch (e) { id = ''; }
        }
        if (id) launchApp(id);
    }

    // ---- Update check (manual button + pull-to-refresh) ----
    // Both paths just ask the service worker to re-fetch sw.js; if a newer
    // build exists, TG.init's controllerchange handler reloads automatically.
    function refreshCheck() {
        if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
            TG.toast(I18N.t('hub_no_sw'), 'info');
            return;
        }
        TG.toast(I18N.t('hub_refresh_check'));
        navigator.serviceWorker.ready
            .then((reg) => {
                let found = false;
                reg.addEventListener('updatefound', () => { found = true; });
                return reg.update()
                    .then(() => new Promise(res => setTimeout(res, 2000)))
                    .then(() => { if (!found) TG.toast(I18N.t('hub_up_to_date'), 'info'); });
            })
            .catch(() => TG.toast(I18N.t('hub_no_sw'), 'info'));
    }

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', refreshCheck);

    // ---- Pull-to-refresh (touch): pull down from the top past the threshold. ----
    const pullHint = document.getElementById('pull-hint');
    const PULL_THRESHOLD = 70;
    let pullStartY = 0;
    let pullActive = false;

    function setPull(dist, armed) {
        if (!pullHint) return;
        pullHint.style.height = Math.min(dist, 60) + 'px';
        pullHint.textContent = I18N.t(armed ? 'hub_release_check' : 'hub_pull_check');
        document.body.style.transform = dist > 0 ? `translateY(${Math.min(dist, 60)}px)` : '';
    }

    function endPull(dy) {
        pullActive = false;
        document.body.style.transform = '';
        if (pullHint) pullHint.style.height = '0px';
        if (dy >= PULL_THRESHOLD) refreshCheck();
    }

    if (window.addEventListener) {
        window.addEventListener('touchstart', (e) => {
            if ((window.scrollY || 0) > 0 || !e.touches || e.touches.length !== 1) return;
            pullStartY = e.touches[0].clientY;
            pullActive = true;
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (!pullActive || !e.touches || !pullHint) return;
            const dy = e.touches[0].clientY - pullStartY;
            if (dy <= 0) {
                setPull(0, false);
                return;
            }
            setPull(dy * 0.5, dy >= PULL_THRESHOLD);
        }, { passive: true });
        window.addEventListener('touchend', (e) => {
            if (!pullActive) return;
            const dy = e.changedTouches && e.changedTouches[0]
                ? e.changedTouches[0].clientY - pullStartY
                : 0;
            endPull(dy);
        }, { passive: true });
        window.addEventListener('touchcancel', () => endPull(0));
    }

    // ---- Keep your place across the update banner reload ----
    // When an update is detected ('sw:update' fires just before the banner
    // shows), snapshot the launcher state; after the Reload tap we restore
    // search text, the open sheet (info/changelog) and the scroll position.
    function saveHubSnapshot() {
        try {
            if (typeof sessionStorage === 'undefined') return;
            sessionStorage.setItem('hub:snapshot', JSON.stringify({
                search: searchInput.value,
                top: window.scrollY || 0,
                sheet: sheetAppId || (!changelogSheet.classList.contains('hidden') ? 'changelog' : null),
            }));
        } catch (e) { /* ignore */ }
    }

    document.addEventListener('sw:update', saveHubSnapshot);

    function restoreHubSnapshot() {
        let snap = null;
        try {
            if (typeof sessionStorage === 'undefined') return;
            snap = JSON.parse(sessionStorage.getItem('hub:snapshot') || 'null');
            sessionStorage.removeItem('hub:snapshot');
        } catch (e) { return; }
        if (!snap) return;
        if (snap.search) {
            searchInput.value = snap.search;
            applyFilter();
        }
        if (snap.sheet === 'changelog') {
            openChangelog();
        } else if (snap.sheet) {
            const app = APP_REGISTRY.find(a => a.id === snap.sheet);
            if (app) openSheet(app);
        }
        if (snap.top && window.scrollTo) window.scrollTo(0, snap.top);
    }

    // ---- Data & backups ----
    // One-tap export of every storage-backed app (plain or password-
    // encrypted JSON), restore with per-app merge-by-id, per-app last-backup
    // dates, and a reminder bar when an app with data is overdue.
    const DAY_MS = 86400000;
    const BACKUP_INTERVAL_DAYS = 7;
    const NUDGE_SUPPRESS_MS = 3 * DAY_MS;

    const backupBar = document.getElementById('backup-bar');
    const backupBarTitle = document.getElementById('backup-bar-title');
    const backupBarSub = document.getElementById('backup-bar-sub');
    const backupBarBtn = document.getElementById('backup-bar-btn');
    const backupBarX = document.getElementById('backup-bar-x');
    const backupSheet = document.getElementById('backup-sheet');
    const backupBox = document.getElementById('backup-box');
    const bkImportFile = document.getElementById('bk-import-file');

    function appMeta(id) {
        const app = APP_REGISTRY.find(a => a.id === id);
        return app ? localize(app) : null;
    }

    function defItemCount(def) {
        try {
            const list = def.read();
            return (list && list.length) ? list.length : 0;
        } catch (e) {
            return 0;
        }
    }

    /** Apps that have data but no backup in the last week. */
    function dueBackupApps() {
        const now = Date.now();
        const due = [];
        Backup.STORAGE_DEFS.forEach(def => {
            if (defItemCount(def) === 0) return;
            const last = Backup.lastBackup(def.id);
            if (last === 0 || (now - last) > BACKUP_INTERVAL_DAYS * DAY_MS) due.push(def.id);
        });
        return due;
    }

    function renderBackupBar() {
        const due = dueBackupApps();
        const suppressed = parseInt(Store.get('hub', 'backupNudge', 0), 10) || 0;
        const show = due.length > 0 && (Date.now() - suppressed) > NUDGE_SUPPRESS_MS;
        backupBar.classList.toggle('hidden', !show);
        if (!show) return;
        backupBarTitle.textContent = I18N.t('hub_backup_due', { n: due.length });
        const names = due
            .map(id => { const m = appMeta(id); return m && m.name ? m.name : id; })
            .slice(0, 3);
        backupBarSub.textContent = names.join(' · ') + (due.length > 3 ? '…' : '');
        backupBarBtn.textContent = I18N.t('hub_backup_now');
    }

    function openBackupSheet() {
        renderBackupSheet();
        backupSheet.classList.remove('hidden');
        TG.haptic('light');
    }

    function closeBackupSheet() {
        backupSheet.classList.add('hidden');
    }

    function lastBackupLine(id) {
        const ts = Backup.lastBackup(id);
        return ts > 0 ? I18N.t('hub_backup_last', { date: Backup.fmtDate(ts) }) : I18N.t('hub_backup_never');
    }

    function renderBackupSheet() {
        const rows = Backup.STORAGE_DEFS.map(def => {
            const meta = appMeta(def.id);
            const count = defItemCount(def);
            return `
                <div class="bk-row">
                    <div class="bk-ico">${meta && meta.icon ? meta.icon : '📦'}</div>
                    <div class="bk-meta">
                        <div class="bk-name">${meta && meta.name ? meta.name : def.id}</div>
                        <div class="bk-date">${count > 0 ? lastBackupLine(def.id) : I18N.t('hub_backup_none')}</div>
                    </div>
                    ${count > 0 ? `<span class="chip">${count}</span>` : ''}
                </div>`;
        }).join('');
        backupBox.innerHTML = `
            <div class="sheet-head">
                <div class="sheet-icon">💾</div>
                <div class="sheet-title"><h3>${I18N.t('hub_backup_title')}</h3></div>
            </div>
            <p class="sheet-desc">${I18N.t('hub_backup_sub')}</p>
            <div class="bk-list">${rows}</div>
            <div class="bk-actions">
                <button type="button" class="btn btn-primary" data-act="backup-all">${I18N.t('hub_backup_all')}</button>
                <button type="button" class="btn btn-primary" data-act="backup-enc">${I18N.t('hub_backup_enc')}</button>
                <button type="button" class="btn btn-secondary" data-act="restore">${I18N.t('hub_backup_restore')}</button>
            </div>
            <div id="pw-area" class="pw-area hidden">
                <div id="pw-title" class="pw-title"></div>
                <input type="password" id="pw-input" class="pw-input" placeholder="${I18N.t('hub_pw_ph')}" autocomplete="off">
                <input type="password" id="pw-input2" class="pw-input hidden" placeholder="${I18N.t('hub_pw_repeat_ph')}" autocomplete="off">
                <div id="pw-err" class="pw-err"></div>
                <div class="pw-btns">
                    <button type="button" class="btn btn-primary" data-act="pw-ok">${I18N.t('hub_pw_ok')}</button>
                    <button type="button" class="btn btn-secondary" data-act="pw-cancel">${I18N.t('hub_pw_cancel')}</button>
                </div>
            </div>
            <div class="sheet-actions">
                <button type="button" class="btn btn-secondary" data-act="backup-close">${I18N.t('hub_close')}</button>
            </div>`;
    }

    function refreshBackupUI() {
        renderBackupBar();
        if (!backupSheet.classList.contains('hidden')) renderBackupSheet();
    }

    /** Re-render the grid so last-backup chips stay fresh after actions. */
    function refreshBackupChips() {
        applyFilter();
    }

    // ---- Password area (used for encrypted export + encrypted restore) ----
    let pwMode = 'set';          // 'set' (new password) or 'ask' (restore)
    let pendingEncrypted = null; // encrypted envelope awaiting its password

    function openPasswordArea(mode) {
        pwMode = mode;
        pendingEncrypted = null;
        const area = document.getElementById('pw-area');
        const title = document.getElementById('pw-title');
        const pw1 = document.getElementById('pw-input');
        const pw2 = document.getElementById('pw-input2');
        const err = document.getElementById('pw-err');
        if (!area) return;
        title.textContent = I18N.t(mode === 'set' ? 'hub_pw_set' : 'hub_pw_ask');
        pw1.value = '';
        pw2.value = '';
        pw2.classList.toggle('hidden', mode !== 'set');
        err.textContent = '';
        area.classList.remove('hidden');
        pw1.focus();
    }

    function closePasswordArea() {
        const area = document.getElementById('pw-area');
        if (area) area.classList.add('hidden');
        pendingEncrypted = null;
    }

    function pwError(msg) {
        const err = document.getElementById('pw-err');
        if (err) err.textContent = msg;
    }

    function markAllBackedUp() {
        Backup.STORAGE_DEFS.forEach(d => Backup.markBackup(d.id));
    }

    function doBackupAll() {
        try {
            const date = new Date().toISOString().slice(0, 10);
            const multi = Backup.multiEnvelope();
            Backup.saveJSON('all-in-one-backup-' + date + '.json', multi);
            markAllBackedUp();
            TG.toast(I18N.t('hub_backup_done'), 'success');
            TG.haptic('medium');
            refreshBackupUI();
            refreshBackupChips();
        } catch (e) {
            TG.toast(I18N.t('core_import_fail'), 'error');
        }
    }

    async function doEncryptedBackup(password) {
        if (!Backup.cryptoAvailable()) {
            pwError(I18N.t('hub_enc_unsupported'));
            return;
        }
        try {
            const date = new Date().toISOString().slice(0, 10);
            const multi = Backup.multiEnvelope();
            const env = await Backup.encryptEnvelope(multi, password);
            Backup.saveJSON('all-in-one-backup-enc-' + date + '.json', env);
            markAllBackedUp();
            closePasswordArea();
            TG.toast(I18N.t('hub_backup_done'), 'success');
            TG.haptic('medium');
            refreshBackupUI();
            refreshBackupChips();
        } catch (e) {
            pwError(I18N.t('hub_pw_wrong'));
        }
    }

    // ---- Restore (plain or encrypted, single-app or multi-app files) ----
    async function restorePayload(data) {
        let envelopes = [];
        if (Array.isArray(data.apps)) {
            envelopes = data.apps;
        } else if (data.app && Backup.defById(data.app)) {
            envelopes = [data];
        } else {
            TG.toast(I18N.t('hub_restore_bad'), 'error');
            return;
        }

        const results = [];
        for (const env of envelopes) {
            const def = Backup.defById(env && env.app);
            if (!def) continue;
            const norm = Backup.normalize(env);
            if (norm.newer) continue;
            const ee = norm.env || env;
            const incoming = Array.isArray(ee[def.payload]) ? ee[def.payload] : [];
            const local = def.read() || [];
            results.push({ def, merged: Backup.mergeLists(local, incoming) });
        }
        if (results.length === 0) {
            TG.toast(I18N.t('hub_restore_bad'), 'error');
            return;
        }

        const added = results.reduce((s, r) => s + r.merged.added, 0);
        const updated = results.reduce((s, r) => s + r.merged.updated, 0);
        if (added === 0 && updated === 0) {
            TG.toast(I18N.t('core_import_none'), 'info');
            return;
        }

        let preview = I18N.t('hub_restore_preview', { n: results.length, a: added, u: updated });
        if (data.deviceId && data.deviceId === Backup.deviceId()) {
            preview += ' ' + I18N.t('core_import_same_device');
        }
        const ok = await TG.confirm(preview);
        if (!ok) return;
        results.forEach(r => r.def.write(r.merged.list));
        TG.toast(I18N.t('hub_restored', { n: results.length }), 'success');
        TG.haptic('medium');
        refreshBackupUI();
        refreshBackupChips();
    }

    async function submitPassword() {
        const pw1 = document.getElementById('pw-input');
        const pw2 = document.getElementById('pw-input2');
        if (!pw1 || !pw1.value) return;
        const password = pw1.value;
        if (pwMode === 'set') {
            if (!pw2 || password !== pw2.value) {
                pwError(I18N.t('hub_pw_mismatch'));
                return;
            }
            if (password.length < 4) {
                pwError(I18N.t('hub_pw_short'));
                return;
            }
            await doEncryptedBackup(password);
        } else if (pendingEncrypted) {
            const env = pendingEncrypted;
            closePasswordArea();
            try {
                const payload = await Backup.decryptEnvelope(env, password);
                await restorePayload(payload);
            } catch (e) {
                TG.toast(I18N.t('hub_pw_wrong'), 'error');
            }
        }
    }

    backupBox.addEventListener('click', (e) => {
        const btn = e.target.closest ? e.target.closest('[data-act]') : null;
        if (!btn) return;
        const act = btn.dataset.act;
        if (act === 'backup-close') closeBackupSheet();
        else if (act === 'backup-all') doBackupAll();
        else if (act === 'backup-enc') openPasswordArea('set');
        else if (act === 'restore') { if (bkImportFile) bkImportFile.click(); }
        else if (act === 'pw-ok') submitPassword();
        else if (act === 'pw-cancel') closePasswordArea();
    });

    backupSheet.addEventListener('click', (e) => {
        if (e.target === backupSheet) closeBackupSheet();
    });

    /** Shared entry for every restore path (file picker, drag & drop, paste). */
    function restoreText(text) {
        let data = null;
        try {
            data = JSON.parse(text);
        } catch (e) {
            TG.toast(I18N.t('hub_restore_bad'), 'error');
            return;
        }
        if (!data || typeof data !== 'object') {
            TG.toast(I18N.t('hub_restore_bad'), 'error');
            return;
        }
        if (data.kind === 'encrypted') {
            if (!Backup.cryptoAvailable()) {
                TG.toast(I18N.t('hub_enc_unsupported'), 'error');
                return;
            }
            pendingEncrypted = data;
            openPasswordArea('ask');
            return;
        }
        restorePayload(data);
    }

    function restoreFromFile(file) {
        const reader = new FileReader();
        reader.onload = () => restoreText(String(reader.result));
        reader.onerror = () => TG.toast(I18N.t('hub_restore_bad'), 'error');
        reader.readAsText(file);
    }

    // ---- Drag & drop / paste restore (in addition to the file picker) ----
    const dropHint = document.getElementById('drop-hint');
    let dragDepth = 0;

    function hasFiles(e) {
        return !!(e && e.dataTransfer && e.dataTransfer.types &&
            Array.prototype.includes.call(e.dataTransfer.types, 'Files'));
    }

    function looksLikeBackup(text) {
        const s = String(text || '').trim();
        if (!s.startsWith('{')) return false;
        return /"(app|apps|format|kind|messages)"/.test(s.slice(0, 2000));
    }

    // Listen on window in real browsers (events bubble up from anywhere); the
    // DOM-shimmed test environment has no window.addEventListener, so fall back
    // to the document (events dispatched there in tests).
    const evtTarget = (typeof window !== 'undefined' && window.addEventListener) ? window : document;
    const onGlobal = (type, fn) => {
        try { evtTarget.addEventListener(type, fn); } catch (e) { /* ignore */ }
    };

    onGlobal('dragenter', (e) => {
        if (!hasFiles(e)) return;
        dragDepth++;
        if (dropHint) dropHint.classList.remove('hidden');
    });
    onGlobal('dragover', (e) => {
        if (hasFiles(e)) e.preventDefault();
    });
    onGlobal('dragleave', () => {
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0 && dropHint) dropHint.classList.add('hidden');
    });
    onGlobal('drop', (e) => {
        dragDepth = 0;
        if (dropHint) dropHint.classList.add('hidden');
        if (!hasFiles(e)) return;
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f) return;
        e.preventDefault();
        TG.haptic('light');
        restoreFromFile(f);
    });
    // Pasting a backup file or raw backup JSON also restores.
    onGlobal('paste', (e) => {
        const cd = e.clipboardData;
        if (!cd) return;
        const file = cd.files && cd.files[0];
        if (file) {
            e.preventDefault();
            restoreFromFile(file);
            return;
        }
        const text = (typeof cd.getData === 'function') ? cd.getData('text/plain') : '';
        if (text && looksLikeBackup(text)) {
            e.preventDefault();
            restoreText(text);
        }
    });

    if (bkImportFile) bkImportFile.addEventListener('change', () => {
        if (bkImportFile.files && bkImportFile.files[0]) restoreFromFile(bkImportFile.files[0]);
        bkImportFile.value = '';
    });

    const backupHeaderBtn = document.getElementById('backup-btn');
    if (backupHeaderBtn) backupHeaderBtn.addEventListener('click', openBackupSheet);
    if (backupBarBtn) backupBarBtn.addEventListener('click', openBackupSheet);
    if (backupBarX) backupBarX.addEventListener('click', () => {
        Store.set('hub', 'backupNudge', Date.now());
        renderBackupBar();
    });

    // ---- Accent theme picker (choice is saved globally and applies to
    // every app page on its next load via core/tg.js) ----
    const themeSheet = document.getElementById('theme-sheet');
    const themeBox = document.getElementById('theme-box');

    function openThemeSheet() {
        renderThemeSheet();
        themeSheet.classList.remove('hidden');
        TG.haptic('light');
    }

    function closeThemeSheet() {
        themeSheet.classList.add('hidden');
    }

    function renderThemeSheet() {
        const current = TG.getTheme();
        const rows = TG.THEMES.map(t => {
            const checked = t.id === current;
            const dot = t.id === 'default'
                ? '<span class="th-dot th-dot-default"></span>'
                : `<span class="th-dot" style="background:${t.accent}"></span>`;
            return `
                <button type="button" class="th-row${checked ? ' active' : ''}" data-theme-id="${t.id}">
                    ${dot}
                    <span class="th-name">${I18N.t('theme_' + t.id)}</span>
                    ${checked ? '<span class="th-check">✓</span>' : ''}
                </button>`;
        }).join('');
        themeBox.innerHTML = `
            <div class="sheet-head">
                <div class="sheet-icon">🎨</div>
                <div class="sheet-title"><h3>${I18N.t('hub_theme_title')}</h3></div>
            </div>
            <p class="sheet-desc">${I18N.t('hub_theme_sub')}</p>
            <div class="th-list">${rows}</div>
            <div class="sheet-actions">
                <button type="button" class="btn btn-secondary" data-theme-close>${I18N.t('hub_close')}</button>
            </div>`;
    }

    if (themeBox) themeBox.addEventListener('click', (e) => {
        const row = e.target.closest ? e.target.closest('[data-theme-id]') : null;
        if (row) {
            TG.setTheme(row.dataset.themeId);
            renderThemeSheet();
            TG.toast(I18N.t('hub_theme_saved'), 'success');
            return;
        }
        if (e.target.closest('[data-theme-close]')) closeThemeSheet();
    });

    if (themeSheet) themeSheet.addEventListener('click', (e) => {
        if (e.target === themeSheet) closeThemeSheet();
    });

    const themeHeaderBtn = document.getElementById('theme-btn');
    if (themeHeaderBtn) themeHeaderBtn.addEventListener('click', openThemeSheet);

    // ---- Init ----
    refresh();
    openDeepLink();
    restoreHubSnapshot();
    refreshBackupUI();
})();
