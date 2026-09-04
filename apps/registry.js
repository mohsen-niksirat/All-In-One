/**
 * apps/registry.js — single source of truth for all hub apps.
 *
 * status: 'ready' → clickable card linking to `path`
 *         'soon'  → greyed-out "به‌زودی" / "Soon" / "قريباً" card (path unused)
 * i18n:   { fa, en, ar } — localized { name, desc } metadata
 * tags:   semantic keys translated via I18N (tag_*) — see launcher.js
 *
 * To add a new app: create apps/<id>/ and add an entry here.
 */
const APP_REGISTRY = [
    // ===== Ready apps =====
    {
        id: 'ai-chat',
        icon: '🤖',
        i18n: {
            fa: { name: 'چت هوش مصنوعی', desc: 'گفتگو با مدل‌های Groq به‌صورت زنده و استریمی' },
            en: { name: 'AI Chat', desc: 'Chat with Groq models, live streaming replies' },
            ar: { name: 'دردشة الذكاء الاصطناعي', desc: 'محادثة مع نماذج Groq ببث مباشر' },
        },
        tags: ['serverless', 'freeapi'],
        keyed: true,
        path: 'apps/ai-chat/',
        status: 'ready',
    },
    {
        id: 'pomodoro',
        icon: '🍅',
        i18n: {
            fa: { name: 'تایمر پومودورو', desc: 'مدیریت زمان با تکنیک پومودورو' },
            en: { name: 'Pomodoro Timer', desc: 'Focus with the Pomodoro technique' },
            ar: { name: 'مؤقّت بومودورو', desc: 'ركّز مع تقنية بومودورو' },
        },
        tags: ['offline'],
        path: 'apps/pomodoro/',
        status: 'ready',
    },
    {
        id: 'unit-converter',
        icon: '📐',
        i18n: {
            fa: { name: 'تبدیل واحد', desc: 'طول، وزن، دما، داده، سرعت و زمان' },
            en: { name: 'Unit Converter', desc: 'Length, weight, temperature, data & more' },
            ar: { name: 'محوّل الوحدات', desc: 'طول، وزن، حرارة، بيانات، سرعة وزمن' },
        },
        tags: ['offline'],
        path: 'apps/unit-converter/',
        status: 'ready',
    },
    {
        id: 'password-generator',
        icon: '🔐',
        i18n: {
            fa: { name: 'تولید رمز عبور', desc: 'رمزهای قوی و امن بسازید' },
            en: { name: 'Password Generator', desc: 'Create strong, secure passwords' },
            ar: { name: 'مولّد كلمات المرور', desc: 'أنشئ كلمات مرور قوية وآمنة' },
        },
        tags: ['offline'],
        path: 'apps/password-generator/',
        status: 'ready',
    },
    {
        id: 'random-picker',
        icon: '🎲',
        i18n: {
            fa: { name: 'انتخاب تصادفی', desc: 'برنده را از بین لیست انتخاب کنید' },
            en: { name: 'Random Picker', desc: 'Pick a random winner from your list' },
            ar: { name: 'اختيار عشوائي', desc: 'اختر فائزاً عشوائياً من قائمتك' },
        },
        tags: ['offline'],
        path: 'apps/random-picker/',
        status: 'ready',
    },
    {
        id: 'todo-list',
        icon: '✅',
        i18n: {
            fa: { name: 'مدیریت کارها', desc: 'وظایف روزانه با اولویت‌بندی' },
            en: { name: 'Todo List', desc: 'Daily tasks with priorities' },
            ar: { name: 'قائمة المهام', desc: 'مهام يومية بأولويات' },
        },
        tags: ['storage'],
        path: 'apps/todo-list/',
        status: 'ready',
    },
    {
        id: 'stopwatch',
        icon: '⏱️',
        i18n: {
            fa: { name: 'کرنومتر', desc: 'زمان‌سنج دقیق با ثبت دور' },
            en: { name: 'Stopwatch', desc: 'Precision timer with lap times' },
            ar: { name: 'ساعة إيقاف', desc: 'مؤقّت دقيق مع تسجيل اللفات' },
        },
        tags: ['offline'],
        path: 'apps/stopwatch/',
        status: 'ready',
    },
    {
        id: 'bmi-calculator',
        icon: '⚖️',
        i18n: {
            fa: { name: 'محاسبه BMI', desc: 'شاخص توده بدنی با تاریخچه' },
            en: { name: 'BMI Calculator', desc: 'Body mass index with history' },
            ar: { name: 'حاسبة كتلة الجسم', desc: 'مؤشر كتلة الجسم مع السجل' },
        },
        tags: ['offline'],
        path: 'apps/bmi-calculator/',
        status: 'ready',
    },
    {
        id: 'habit-tracker',
        icon: '📈',
        i18n: {
            fa: { name: 'عادت‌ساز', desc: 'پیگیری عادت‌ها و زنجیره روزها' },
            en: { name: 'Habit Tracker', desc: 'Track habits and daily streaks' },
            ar: { name: 'متتبّع العادات', desc: 'تتبّع العادات والسلاسل اليومية' },
        },
        tags: ['storage'],
        path: 'apps/habit-tracker/',
        status: 'ready',
    },
    {
        id: 'expense-tracker',
        icon: '💰',
        i18n: {
            fa: { name: 'مدیریت هزینه', desc: 'ثبت هزینه‌ها و نمودار ماهانه' },
            en: { name: 'Expense Tracker', desc: 'Log expenses and monthly charts' },
            ar: { name: 'متتبّع المصاريف', desc: 'سجّل مصاريفك مع رسم بياني شهري' },
        },
        tags: ['storage'],
        path: 'apps/expense-tracker/',
        status: 'ready',
    },
    {
        id: 'qr-generator',
        icon: '🔳',
        i18n: {
            fa: { name: 'کد QR', desc: 'ساخت کد QR از متن و لینک' },
            en: { name: 'QR Generator', desc: 'Create QR codes from text & links' },
            ar: { name: 'رمز QR', desc: 'أنشئ رموز QR من نص ورابط' },
        },
        tags: ['offline'],
        path: 'apps/qr-generator/',
        status: 'ready',
    },
    {
        id: 'json-formatter',
        icon: '🧩',
        i18n: {
            fa: { name: 'فرمت JSON', desc: 'مرتب‌سازی، اعتبارسنجی و فشرده‌سازی' },
            en: { name: 'JSON Formatter', desc: 'Format, validate & minify JSON' },
            ar: { name: 'منسّق JSON', desc: 'تنسيق وتحقق وتصغير JSON' },
        },
        tags: ['offline'],
        path: 'apps/json-formatter/',
        status: 'ready',
    },
    {
        id: 'markdown-preview',
        icon: '📄',
        i18n: {
            fa: { name: 'پیش‌نمایش مارک‌داون', desc: 'نوشتن و پیش‌نمایش زنده مارک‌داون' },
            en: { name: 'Markdown Preview', desc: 'Write with live markdown preview' },
            ar: { name: 'معاينة ماركداون', desc: 'اكتب مع معاينة مباشرة' },
        },
        tags: ['offline'],
        path: 'apps/markdown-preview/',
        status: 'ready',
    },
    {
        id: 'color-picker',
        icon: '🎨',
        i18n: {
            fa: { name: 'انتخاب رنگ', desc: 'پالت رنگی و کد HEX/RGB' },
            en: { name: 'Color Picker', desc: 'Palettes and HEX/RGB codes' },
            ar: { name: 'منتقي الألوان', desc: 'لوحات وأكواد HEX/RGB' },
        },
        tags: ['offline'],
        path: 'apps/color-picker/',
        status: 'ready',
    },

    // ===== Productivity (coming soon) =====
    {
        id: 'bookmark-manager',
        icon: '🔖',
        i18n: {
            fa: { name: 'نشانک‌ها', desc: 'ذخیره لینک‌ها با برچسب و جستجو' },
            en: { name: 'Bookmarks', desc: 'Save links with tags & search' },
            ar: { name: 'العلامات المرجعية', desc: 'احفظ الروابط مع وسوم وبحث' },
        },
        tags: ['storage'],
        path: 'apps/bookmark-manager/',
        status: 'ready',
    },
    {
        id: 'notes-app',
        icon: '📝',
        i18n: {
            fa: { name: 'یادداشت‌ها', desc: 'یادداشت‌های متنی با پوشه‌بندی' },
            en: { name: 'Notes', desc: 'Text notes with folders' },
            ar: { name: 'الملاحظات', desc: 'ملاحظات نصية مع مجلدات' },
        },
        tags: ['storage'],
        path: 'apps/notes-app/',
        status: 'ready',
    },
    {
        id: 'shopping-list',
        icon: '🛒',
        i18n: {
            fa: { name: 'لیست خرید', desc: 'لیست خرید مشترک و چک‌شونده' },
            en: { name: 'Shopping List', desc: 'Checkable shared shopping list' },
            ar: { name: 'قائمة التسوق', desc: 'قائمة تسوق قابلة للتحديد' },
        },
        tags: ['storage'],
        path: 'apps/shopping-list/',
        status: 'ready',
    },
    {
        id: 'daily-journal',
        icon: '📔',
        i18n: {
            fa: { name: 'یادداشت روزانه', desc: 'نوشتن روزانه با ردیابی حال‌وهوا' },
            en: { name: 'Journal', desc: 'Daily writing with mood tracking' },
            ar: { name: 'اليوميات', desc: 'كتابة يومية مع تتبّع المزاج' },
        },
        tags: ['storage'],
        path: 'apps/daily-journal/',
        status: 'ready',
    },
    {
        id: 'goal-tracker',
        icon: '🎯',
        i18n: {
            fa: { name: 'ردیاب اهداف', desc: 'تعیین هدف و پیگیری پیشرفت' },
            en: { name: 'Goal Tracker', desc: 'Set goals and track progress' },
            ar: { name: 'متتبّع الأهداف', desc: 'حدّد الأهداف وتتبّع التقدم' },
        },
        tags: ['storage'],
        path: 'apps/goal-tracker/',
        status: 'ready',
    },

    // ===== Free APIs (ready) =====
    {
        id: 'weather',
        icon: '🌤️',
        i18n: {
            fa: { name: 'آب‌وهوا', desc: 'پیش‌بینی ۷ روزه — بدون نیاز به کلید' },
            en: { name: 'Weather', desc: '7-day forecast & city search — no key needed' },
            ar: { name: 'الطقس', desc: 'توقعات 7 أيام وبحث عن المدن — دون مفتاح' },
        },
        tags: ['freeapi'],
        path: 'apps/weather/',
        status: 'ready',
    },
    {
        id: 'news-reader',
        icon: '📰',
        i18n: {
            fa: { name: 'خواننده اخبار', desc: 'آخرین اخبار از منابع مختلف' },
            en: { name: 'News Reader', desc: 'Latest news from multiple sources' },
            ar: { name: 'قارئ الأخبار', desc: 'آخر الأخبار من مصادر متعددة' },
        },
        tags: ['freeapi'],
        keyed: true,
        path: 'apps/news-reader/',
        status: 'ready',
    },
    {
        id: 'translator',
        icon: '🌐',
        i18n: {
            fa: { name: 'مترجم', desc: 'ترجمه متن با API رایگان' },
            en: { name: 'Translator', desc: 'Translate text with a free API' },
            ar: { name: 'مترجم', desc: 'ترجم النصوص بواجهة مجانية' },
        },
        tags: ['freeapi'],
        path: 'apps/translator/',
        status: 'ready',
    },
    {
        id: 'currency',
        icon: '💱',
        i18n: {
            fa: { name: 'تبدیل ارز', desc: 'تبدیل بیش از ۱۶۰ ارز از جمله ریال — بدون کلید' },
            en: { name: 'Currency', desc: 'Live conversion for 160+ currencies, incl. IRR' },
            ar: { name: 'تحويل العملات', desc: 'تحويل مباشر لأكثر من 160 عملة، تشمل الريال الإيراني' },
        },
        tags: ['freeapi'],
        path: 'apps/currency/',
        status: 'ready',
    },

    // ===== Tools (ready) =====
    {
        id: 'world-clock',
        icon: '🌍',
        i18n: {
            fa: { name: 'ساعت جهانی', desc: 'زمان هم‌اکنون شهرهای مختلف جهان' },
            en: { name: 'World Clock', desc: 'Current time in cities worldwide' },
            ar: { name: 'ساعة العالم', desc: 'الوقت الحالي في مدن العالم' },
        },
        tags: ['offline'],
        path: 'apps/world-clock/',
        status: 'ready',
    },

    // ===== Fun / static (coming soon) =====
    {
        id: 'wheel-of-actions',
        icon: '🎡',
        i18n: {
            fa: { name: 'چرخ شانس', desc: 'چرخ گردان برای انتخاب‌های تصادفی' },
            en: { name: 'Wheel of Actions', desc: 'Spin the wheel for random picks' },
            ar: { name: 'عجلة الحظ', desc: 'دوّر العجلة لاختيارات عشوائية' },
        },
        tags: ['static'],
        path: null,
        status: 'soon',
    },
    {
        id: 'solar-system',
        icon: '🪐',
        i18n: {
            fa: { name: 'منظومه شمسی', desc: 'کاوش سه‌بعدی سیارات' },
            en: { name: 'Solar System', desc: '3D exploration of the planets' },
            ar: { name: 'النظام الشمسي', desc: 'استكشاف ثلاثي الأبعاد للكواكب' },
        },
        tags: ['static'],
        path: null,
        status: 'soon',
    },
    {
        id: 'emoji-poster',
        icon: '🖼️',
        i18n: {
            fa: { name: 'پوستر ایموجی', desc: 'ساخت پوسترهای ایموجی' },
            en: { name: 'Emoji Poster', desc: 'Create emoji posters' },
            ar: { name: 'ملصق إيموجي', desc: 'أنشئ ملصقات إيموجي' },
        },
        tags: ['static'],
        path: null,
        status: 'soon',
    },
];