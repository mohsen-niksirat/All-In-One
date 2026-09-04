/**
 * apps/registry.js — single source of truth for all hub apps.
 *
 * status: 'ready' → clickable card linking to `path`
 *         'soon'  → greyed-out "به‌زودی" / "Soon" card (path unused)
 * i18n:   { fa: {name, desc}, en: {name, desc} } — localized metadata
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
        },
        tags: ['serverless', 'freeapi'],
        path: 'apps/ai-chat/',
        status: 'ready',
    },
    {
        id: 'pomodoro',
        icon: '🍅',
        i18n: {
            fa: { name: 'تایمر پومودورو', desc: 'مدیریت زمان با تکنیک پومودورو' },
            en: { name: 'Pomodoro Timer', desc: 'Focus with the Pomodoro technique' },
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
        },
        tags: ['offline'],
        path: 'apps/random-picker/',
        status: 'ready',
    },

    // ===== Productivity (coming soon) =====
    {
        id: 'todo-list',
        icon: '✅',
        i18n: {
            fa: { name: 'مدیریت کارها', desc: 'وظایف روزانه با اولویت‌بندی' },
            en: { name: 'Todo List', desc: 'Daily tasks with priorities' },
        },
        tags: ['storage'],
        path: 'apps/todo-list/',
        status: 'ready',
    },
    {
        id: 'habit-tracker',
        icon: '📈',
        i18n: {
            fa: { name: 'عادت‌ساز', desc: 'پیگیری عادت‌ها و زنجیره روزها' },
            en: { name: 'Habit Tracker', desc: 'Track habits and daily streaks' },
        },
        tags: ['storage'],
        path: null,
        status: 'soon',
    },
    {
        id: 'expense-tracker',
        icon: '💰',
        i18n: {
            fa: { name: 'مدیریت هزینه', desc: 'ثبت هزینه‌ها و نمودار ماهانه' },
            en: { name: 'Expense Tracker', desc: 'Log expenses and monthly charts' },
        },
        tags: ['storage'],
        path: null,
        status: 'soon',
    },
    {
        id: 'bookmark-manager',
        icon: '🔖',
        i18n: {
            fa: { name: 'نشانک‌ها', desc: 'ذخیره لینک‌ها با برچسب و جستجو' },
            en: { name: 'Bookmarks', desc: 'Save links with tags & search' },
        },
        tags: ['storage'],
        path: null,
        status: 'soon',
    },
    {
        id: 'notes-app',
        icon: '📝',
        i18n: {
            fa: { name: 'یادداشت‌ها', desc: 'یادداشت‌های متنی با پوشه‌بندی' },
            en: { name: 'Notes', desc: 'Text notes with folders' },
        },
        tags: ['storage'],
        path: null,
        status: 'soon',
    },
    {
        id: 'shopping-list',
        icon: '🛒',
        i18n: {
            fa: { name: 'لیست خرید', desc: 'لیست خرید مشترک و چک‌شونده' },
            en: { name: 'Shopping List', desc: 'Checkable shared shopping list' },
        },
        tags: ['storage'],
        path: null,
        status: 'soon',
    },
    {
        id: 'daily-journal',
        icon: '📔',
        i18n: {
            fa: { name: 'یادداشت روزانه', desc: 'نوشتن روزانه با ردیابی حال‌وهوا' },
            en: { name: 'Journal', desc: 'Daily writing with mood tracking' },
        },
        tags: ['storage'],
        path: null,
        status: 'soon',
    },
    {
        id: 'goal-tracker',
        icon: '🎯',
        i18n: {
            fa: { name: 'ردیاب اهداف', desc: 'تعیین هدف و پیگیری پیشرفت' },
            en: { name: 'Goal Tracker', desc: 'Set goals and track progress' },
        },
        tags: ['storage'],
        path: null,
        status: 'soon',
    },

    // ===== Free APIs (coming soon) =====
    {
        id: 'weather',
        icon: '🌤️',
        i18n: {
            fa: { name: 'آب‌وهوا', desc: 'پیش‌بینی ۵ روزه با API رایگان' },
            en: { name: 'Weather', desc: '5-day forecast via a free API' },
        },
        tags: ['freeapi'],
        path: null,
        status: 'soon',
    },
    {
        id: 'news-reader',
        icon: '📰',
        i18n: {
            fa: { name: 'خواننده اخبار', desc: 'آخرین اخبار از منابع مختلف' },
            en: { name: 'News Reader', desc: 'Latest news from multiple sources' },
        },
        tags: ['freeapi'],
        path: null,
        status: 'soon',
    },
    {
        id: 'translator',
        icon: '🌐',
        i18n: {
            fa: { name: 'مترجم', desc: 'ترجمه متن با API رایگان' },
            en: { name: 'Translator', desc: 'Translate text with a free API' },
        },
        tags: ['freeapi'],
        path: null,
        status: 'soon',
    },
    {
        id: 'currency',
        icon: '💱',
        i18n: {
            fa: { name: 'نرخ ارز', desc: 'نرخ لحظه‌ای ارز و طلا' },
            en: { name: 'Currency Rates', desc: 'Live currency & gold rates' },
        },
        tags: ['freeapi'],
        path: null,
        status: 'soon',
    },

    // ===== Tools (coming soon) =====
    {
        id: 'qr-generator',
        icon: '🔳',
        i18n: {
            fa: { name: 'کد QR', desc: 'ساخت کد QR از متن و لینک' },
            en: { name: 'QR Generator', desc: 'Create QR codes from text & links' },
        },
        tags: ['offline'],
        path: null,
        status: 'soon',
    },
    {
        id: 'json-formatter',
        icon: '🧩',
        i18n: {
            fa: { name: 'فرمت JSON', desc: 'مرتب‌سازی، اعتبارسنجی و فشرده‌سازی' },
            en: { name: 'JSON Formatter', desc: 'Format, validate & minify JSON' },
        },
        tags: ['offline'],
        path: null,
        status: 'soon',
    },
    {
        id: 'markdown-preview',
        icon: '📄',
        i18n: {
            fa: { name: 'پیش‌نمایش مارک‌داون', desc: 'نوشتن و پیش‌نمایش زنده مارک‌داون' },
            en: { name: 'Markdown Preview', desc: 'Write with live markdown preview' },
        },
        tags: ['offline'],
        path: null,
        status: 'soon',
    },
    {
        id: 'color-picker',
        icon: '🎨',
        i18n: {
            fa: { name: 'انتخاب رنگ', desc: 'پالت رنگی و کد HEX/RGB' },
            en: { name: 'Color Picker', desc: 'Palettes and HEX/RGB codes' },
        },
        tags: ['offline'],
        path: null,
        status: 'soon',
    },
    {
        id: 'bmi-calculator',
        icon: '⚖️',
        i18n: {
            fa: { name: 'محاسبه BMI', desc: 'شاخص توده بدنی با تاریخچه' },
            en: { name: 'BMI Calculator', desc: 'Body mass index with history' },
        },
        tags: ['offline'],
        path: 'apps/bmi-calculator/',
        status: 'ready',
    },
    {
        id: 'stopwatch',
        icon: '⏱️',
        i18n: {
            fa: { name: 'کرنومتر', desc: 'زمان‌سنج دقیق با ثبت دور' },
            en: { name: 'Stopwatch', desc: 'Precision timer with lap times' },
        },
        tags: ['offline'],
        path: 'apps/stopwatch/',
        status: 'ready',
    },
    {
        id: 'world-clock',
        icon: '🌍',
        i18n: {
            fa: { name: 'ساعت جهانی', desc: 'زمان هم‌اکنون شهرهای مختلف جهان' },
            en: { name: 'World Clock', desc: 'Current time in cities worldwide' },
        },
        tags: ['offline'],
        path: null,
        status: 'soon',
    },

    // ===== Fun / static (coming soon) =====
    {
        id: 'wheel-of-actions',
        icon: '🎡',
        i18n: {
            fa: { name: 'چرخ شانس', desc: 'چرخ گردان برای انتخاب‌های تصادفی' },
            en: { name: 'Wheel of Actions', desc: 'Spin the wheel for random picks' },
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
        },
        tags: ['static'],
        path: null,
        status: 'soon',
    },
];