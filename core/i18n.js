/**
 * core/i18n.js — lightweight multi-language engine.
 *
 * - Each page registers its own dictionary:  I18N.register('fa', {...})
 * - Applies translations to [data-i18n] / [data-i18n-placeholder] elements
 * - Language choice is stored globally (ns 'hub', key 'lang') so all
 *   apps remember the user's preference.
 *
 * Adding a language = register a new dict for the same keys.
 */
const I18N = {
    NS: 'hub',
    LANG_KEY: 'lang',
    current: 'en',
    dirs: { fa: 'rtl', en: 'ltr', ar: 'rtl' },
    dicts: {},
    nativeNames: { fa: 'فا', en: 'EN', ar: 'ع' },

    register(lang, dict) {
        this.dicts[lang] = Object.assign(this.dicts[lang] || {}, dict);
    },

    languages() {
        return Object.keys(this.dicts).filter(l => this.dicts[l] && Object.keys(this.dicts[l]).length);
    },

    /** Load saved (or detected) language and apply translations. */
    init() {
        let saved = Store.get(this.NS, this.LANG_KEY, null);
        if (!saved) {
            const code = (TG.user()?.language_code) || navigator.language || 'en';
            const c = code.toLowerCase();
            saved = c.startsWith('fa') ? 'fa' : (c.startsWith('ar') ? 'ar' : 'en');
        }
        this.current = this.dicts[saved] ? saved : 'en';
        this.apply();
        return this;
    },

    set(lang) {
        if (!this.dicts[lang]) return;
        this.current = lang;
        Store.set(this.NS, this.LANG_KEY, lang);
        this.apply();
        document.dispatchEvent(new CustomEvent('i18n:changed', { detail: lang }));
    },

    apply() {
        document.documentElement.setAttribute('lang', this.current);
        document.documentElement.setAttribute('dir', this.dirs[this.current] || 'ltr');

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const txt = this.t(key);
            if (txt !== key) el.textContent = txt;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.setAttribute('placeholder', this.t(el.getAttribute('data-i18n-placeholder')));
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.setAttribute('title', this.t(el.getAttribute('data-i18n-title')));
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            el.setAttribute('aria-label', this.t(el.getAttribute('data-i18n-aria-label')));
        });

        // Rebuild any language switcher on the page
        document.querySelectorAll('[data-lang-switcher]').forEach(container => {
            this.buildSwitcher(container);
        });
    },

    /** Translate a key. Falls back to English, then the key itself. */
    t(key, params) {
        const dict = this.dicts[this.current];
        let str = dict && dict[key] !== undefined ? dict[key] : undefined;
        if (str === undefined) {
            const en = this.dicts.en;
            str = en && en[key] !== undefined ? en[key] : key;
        }
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
            }
        }
        return str;
    },

    /** Build a compact language switcher (EN / فا pills) inside a container. */
    buildSwitcher(container) {
        if (!container) return;
        const langs = this.languages();
        container.innerHTML = langs.map(l =>
            `<button type="button" class="lang-pill${l === this.current ? ' active' : ''}" data-lang="${l}">${this.nativeName(l)}</button>`
        ).join('');
        container.querySelectorAll('[data-lang]').forEach(btn => {
            btn.addEventListener('click', () => this.set(btn.dataset.lang));
        });
    },

    nativeName(lang) {
        return this.nativeNames[lang] || lang.toUpperCase();
    },
};

// ---- Core-level strings, available on every page (page dicts merge on top).
I18N.register('fa', {
    core_update_ready: 'نسخهٔ جدید آماده است',
    core_update_reload: 'بارگذاری مجدد',
    core_export: 'خروجی (JSON)',
    core_import: 'ورودی (JSON)',
    core_exported: 'پشتیبان ذخیره شد ✓',
    core_import_none: 'مورد جدیدی برای ادغام نبود',
    core_import_preview: 'فایل شامل {n} مورد ({from} تا {to}) است؛ {m} مورد جدید. ادغام چیزی را حذف نمی‌کند — ادامه می‌دهید؟',
    core_import_same_device: '(پشتیبان همین دستگاه)',
    core_import_fail: 'فایل نامعتبر است',
    core_merged: '{n} مورد جدید اضافه شد ✓',
});

I18N.register('en', {
    core_update_ready: 'A new version is ready',
    core_update_reload: 'Reload',
    core_export: 'Export (JSON)',
    core_import: 'Import (JSON)',
    core_exported: 'Backup saved ✓',
    core_import_none: 'No new items to merge',
    core_import_preview: 'File has {n} items ({from} → {to}); {m} are new. Merging never deletes — continue?',
    core_import_same_device: '(same-device backup)',
    core_import_fail: 'Invalid file',
    core_merged: 'Merged {n} new items ✓',
});

I18N.register('ar', {
    core_update_ready: 'نسخة جديدة جاهزة',
    core_update_reload: 'إعادة التحميل',
    core_export: 'تصدير (JSON)',
    core_import: 'استيراد (JSON)',
    core_exported: 'تم حفظ النسخة الاحتياطية ✓',
    core_import_none: 'لا توجد عناصر جديدة للدمج',
    core_import_preview: 'يحتوي الملف على {n} عنصر ({from} ← {to})؛ {m} منها جديد. الدمج لا يحذف شيئاً — هل نتابع؟',
    core_import_same_device: '(نسخة احتياطية من نفس الجهاز)',
    core_import_fail: 'ملف غير صالح',
    core_merged: 'تم دمج {n} عنصر جديد ✓',
});