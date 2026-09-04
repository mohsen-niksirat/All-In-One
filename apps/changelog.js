/**
 * apps/changelog.js — "What's new" entries per release, shown from the
 * version badge on the launcher. Newest first; the smoke test asserts the
 * top entry's version equals TG.APP_VERSION (core/tg.js), so document every
 * release here when you run scripts/release.js. Optional `link` is the id of
 * the app that best shows off that release (the sheet's 'Open app' button).
 */
const APP_CHANGELOG = [
    {
        version: '2.9.0',
        icon: '🎨',
        link: 'ai-chat',
        i18n: {
            fa: [
                'پنج تم رنگی: اقیانوس، غروب، جنگل، سلطنتی و صورتی — از دکمهٔ 🎨 در بالای صفحه',
                'انتخاب شما روی همهٔ اپ‌ها اعمال می‌شود و ذخیره می‌ماند',
                'روشن/تیره همچنان خودکار با تلگرام هماهنگ است',
            ],
            en: [
                'Five accent themes: Ocean, Sunset, Forest, Royal and Candy — pick one from the 🎨 button up top',
                'Your choice applies across every app and is remembered',
                'Light/dark still follows Telegram automatically',
            ],
            ar: [
                'خمسة مظاهر ملونة: محيط وغروب وغابة وملكي ووردي — اختر من زر 🎨 في الأعلى',
                'يُطبَّق اختيارك على جميع التطبيقات ويُحفظ',
                'الفاتح/الداكن ما زال يتبع تلغرام تلقائياً',
            ],
        },
    },
    {
        version: '2.8.0',
        icon: '🔐',
        link: 'notes-app',
        i18n: {
            fa: [
                'پشتیبان‌گیری همهٔ اپ‌ها در یک فایل — ساده یا رمزنگاری‌شده با رمز عبور — از دکمهٔ 💾',
                'بازیابی، دادهٔ هر اپ را مورد‌به‌مورد ادغام می‌کند و چیزی حذف نمی‌شود؛ فایل تک‌اپ هم می‌پذیرد',
                'یادآوری خودکار پشتیبان‌گیری: تاریخ آخرین پشتیبان هر اپ و هشدار پس از یک هفته',
                'پشتیبان گفتگو (AI Chat) حالا همان قالب نسخه‌دار و نردبان مهاجرت بقیهٔ اپ‌ها را دارد',
            ],
            en: [
                'One-tap “back up everything” to a single file — plain JSON or password-encrypted — from the 💾 button',
                'Restore merges each app item-by-item and never deletes; single-app backup files are accepted too',
                'Automatic backup reminders: per-app last-backup dates plus a nudge after a week',
                'AI Chat backups now use the same versioned format and migrator ladder as every other app',
            ],
            ar: [
                'نسخة احتياطية لكل التطبيقات في ملف واحد — عادية أو مشفّرة بكلمة مرور — من زر 💾',
                'الاستعادة تدمج عنصراً بعنصر لكل تطبيق ولا تحذف شيئاً؛ وتقبل ملفات التطبيق الواحد أيضاً',
                'تذكير تلقائي بالنسخ الاحتياطي: تاريخ آخر نسخة لكل تطبيق وتنبيه بعد أسبوع',
                'نسخ محادثة AI Chat تستخدم الآن نفس الصيغة المرقّمة وسلّم الترحيل كباقي التطبيقات',
            ],
        },
    },
    {
        version: '2.7.0',
        icon: '🧭',
        link: 'habit-tracker',
        i18n: {
            fa: [
                'پشتیبان JSON برای عادت‌ها، هزینه‌ها، دفتر خاطرات و اهداف',
                'قالب نسخه‌دار پشتیبان — فایل‌های قدیمی به‌روز می‌شوند، نه رد',
                '«به‌روزرسانی» جای صفحه را حفظ می‌کند: جستجو، برگهٔ باز و اسکرول',
            ],
            en: [
                'JSON backups for Habits, Expenses, Journal and Goals',
                'Versioned backup schema — old files migrate instead of failing',
                'Update reload keeps your place: search, open sheet and scroll',
            ],
            ar: [
                'نسخ احتياطية JSON للعادات والمصاريف والمذكرات والأهداف',
                'مخطط نسخ احتياطية مُرقّم — تُرحَّل الملفات القديمة بدل رفضها',
                'تحديث يحفظ مكانك: البحث واللوحة المفتوحة والتمرير',
            ],
        },
    },
    {
        version: '2.6.0',
        icon: '📦',
        link: 'notes-app',
        i18n: {
            fa: [
                'پشتیبان‌گیری JSON برای یادداشت‌ها، بوکمارک‌ها و فهرست خرید',
                'ورودی به‌جای جایگزینی ادغام می‌شود — هیچ‌چیز حذف نمی‌شود',
                'اعلان «نسخهٔ جدید» با دکمهٔ بارگذاری مجدد، بدون رفرش اجباری',
            ],
            en: [
                'JSON backups for Notes, Bookmarks and Shopping List',
                'Imports merge instead of replacing — nothing is deleted',
                '“New version ready” banner with a reload button (no forced refresh)',
            ],
            ar: [
                'نسخ احتياطية JSON للملاحظات والإشارات المرجعية وقائمة التسوق',
                'الاستيراد يدمج بدلاً من الاستبدال — لا يُحذف شيء',
                'لافتة «نسخة جديدة جاهزة» مع زر إعادة التحميل (دون تحديث إجباري)',
            ],
        },
    },
    {
        version: '2.5.0',
        icon: '🗂️',
        link: 'ai-chat',
        i18n: {
            fa: [
                'بررسی خودکار به‌روزرسانی هنگام بازگشت به برنامه',
                'پیش‌نمایش ورودی گفتگو (تعداد و بازهٔ تاریخ) + تأیید قبل از ادغام',
                'ادغام به‌جای جایگزینی — با شناسهٔ دستگاه، پشتیبان‌ها حذف نمی‌کنند',
            ],
            en: [
                'Auto update check when the app returns to the foreground',
                'Import preview (count + date range) asks before merging',
                'Merges by message id with a per-device flag — imports never delete',
            ],
            ar: [
                'فحص تلقائي للتحديثات عند العودة إلى التطبيق',
                'معاينة الاستيراد (العدد + نطاق التاريخ) مع تأكيد قبل الدمج',
                'الدمج بدلاً من الاستبدال — بمعرّف الجهاز، لا يحذف الاستيراد شيئاً',
            ],
        },
    },
    {
        version: '2.4.0',
        icon: '💾',
        link: 'ai-chat',
        i18n: {
            fa: [
                'خروجی/ورودی گفتگو به صورت JSON — پیام‌های در صف هم حفظ می‌شوند',
                'کشیدن صفحه به پایین یا دکمهٔ ↻ برای بررسی به‌روزرسانی',
                'آیکون برای هر نسخه در دفترچهٔ «تازه‌های نسخه»',
            ],
            en: [
                'Export/import your chat as JSON — queued messages survive the round-trip',
                'Pull down (or tap ↻) to check for updates',
                'Each release gets an icon in “What’s new”',
            ],
            ar: [
                'تصدير/استيراد المحادثة بصيغة JSON — تُحفظ رسائل قائمة الانتظار',
                'اسحب للأسفل (أو اضغط ↻) للتحقق من التحديثات',
                'أيقونة لكل إصدار في لوحة «ما الجديد»',
            ],
        },
    },
    {
        version: '2.3.0',
        icon: '📨',
        link: 'ai-chat',
        i18n: {
            fa: [
                'وضعیت زندهٔ هر پیام: ⏳ در صف → ✓ تحویل‌شد + دکمهٔ «تلاش دوباره»',
                'نشان زمان به‌روزرسانی داخل کارت آب‌وهوا و بالای فهرست اخبار',
                'ارقام فارسی/عربی در ساعت همهٔ اپ‌ها',
                'دکمهٔ «باز کردن اپ» در دفترچهٔ نسخه‌ها',
            ],
            en: [
                'Live per-message status: ⏳ queued → ✓ delivered, plus a retry button',
                'Pinned last-refreshed chip on the Weather card and News toolbar',
                'Persian/Arabic digits for times across all apps',
                "'Open app' buttons in 'What's new' for each release",
            ],
            ar: [
                'حالة حية لكل رسالة: ⏳ في الانتظار ← ✓ تم الإرسال + زر «إعادة المحاولة»',
                'شارة آخر تحديث مثبتة في بطاقة الطقس وشريط الأخبار',
                'أرقام فارسية/عربية في أوقات جميع التطبيقات',
                'أزرار «فتح التطبيق» في لوحة «ما الجديد» لكل إصدار',
            ],
        },
    },
    {
        version: '2.2.0',
        icon: '📣',
        link: 'ai-chat',
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
        icon: '🔖',
        link: 'news-reader',
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
        icon: '⚡',
        link: 'weather',
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
        icon: '🧩',
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
