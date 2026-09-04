/**
 * apps/changelog.js — "What's new" entries per release, shown from the
 * version badge on the launcher. Newest first; the smoke test asserts the
 * top entry's version equals TG.APP_VERSION (core/tg.js), so document every
 * release here when you run scripts/release.js.
 */
const APP_CHANGELOG = [
    {
        version: '2.2.0',
        i18n: {
            fa: [
                'دفترچهٔ «تازه‌های نسخه» با لمس نشان نسخه',
                'صف ارسال پیام هنگام قطعی اینترنت — ارسال خودکار با اتصال مجدد',
                'برچسب زمان ذخیره‌سازی روی هر خبر و هر روز پیش‌بینی',
            ],
            en: [
                "'What's new' sheet opens from the version badge",
                'Offline send queue — messages go out automatically on reconnect',
                'Per-row saved timestamps on news & weather forecast rows',
            ],
            ar: [
                'لوحة «ما الجديد» تُفتح من شارة الإصدار',
                'قائمة انتظار الإرسال دون اتصال — تُرسل تلقائياً عند الاتصال',
                'أختام زمنية محفوظة في كل خبر وكل يوم توقعات',
            ],
        },
    },
    {
        version: '2.1.0',
        i18n: {
            fa: [
                'نشان نسخه و به‌روزرسانی خودکار روی همهٔ صفحه‌ها',
                'ذخیرهٔ آفلاین اخبار و گفتگوی چت، با زمان آخرین همگام‌سازی',
                'اسکریپت انتشار نسخه و آزمایش همگام‌سازی',
            ],
            en: [
                'Version badge with auto-update on every page',
                'Offline caching for news & chat, with last-synced stamps',
                'Release script + version-sync tests',
            ],
            ar: [
                'شارة الإصدار وتحديث تلقائي في كل الصفحات',
                'تخزين الأخبار والدردشة دون اتصال مع ختم آخر مزامنة',
                'سكربت الإصدار واختبارات تزامن النسخة',
            ],
        },
    },
    {
        version: '2.0.0',
        i18n: {
            fa: [
                'سرویس‌ورکر به‌روزرسانی اجباری — نسخهٔ جدید بلافاصله نمایش داده می‌شود',
                'آفلاین‌شدن آب‌وهوا و ارز با نرخ‌های ذخیره‌شده و زمان به‌روزرسانی',
                'ترجمهٔ کامل متن‌های باقی‌مانده به سه زبان + بازرسی خودکار',
            ],
            en: [
                'Force-refresh service worker — new builds appear immediately',
                'Weather & currency go offline with saved data + timestamps',
                'Remaining UI strings translated (fa/en/ar) + automatic audits',
            ],
            ar: [
                'عامل خدمة بتحديث إجباري — تظهر النسخ الجديدة فوراً',
                'الطقس والعملات يعملان دون اتصال ببيانات محفوظة وأوقات تحديث',
                'ترجمة النصوص المتبقية (فارسي/إنجليزي/عربي) + فحوصات تلقائية',
            ],
        },
    },
    {
        version: '1.0.0',
        i18n: {
            fa: [
                '۲۷ مینی‌اپ سرورلس، همگی رایگان و سه‌زبانه',
                'همگام‌سازی داده بین دستگاه‌ها با Telegram CloudStorage',
                'نصب‌پذیری PWA، لینک مستقیم به اپ‌ها و اشتراک‌گذاری بومی',
            ],
            en: [
                '27 serverless mini-apps — free & trilingual',
                'Cross-device data sync via Telegram CloudStorage',
                'Installable PWA, deep links, native share',
            ],
            ar: [
                '27 تطبيقاً صغيراً بدون خادم — مجانية وثلاثية اللغات',
                'مزامنة البيانات بين الأجهزة عبر Telegram CloudStorage',
                'تطبيق قابل للتثبيت، روابط مباشرة، مشاركة أصلية',
            ],
        },
    },
];
