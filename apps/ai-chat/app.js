/**
 * app.js — AI Chat main controller (on the shared core layer).
 */

// ---- Translations ----
I18N.register('fa', {
    chat_title: 'چت هوش مصنوعی',
    chat_powered: 'پشتیبان‌شده توسط Groq',
    chat_online: 'آنلاین',
    chat_greeting: 'سلام {name} 👋',
    chat_welcome_title: 'سلام! من دستیار هوش مصنوعی هستم',
    chat_welcome_sub: 'هر سوالی دارید از من بپرسید',
    chat_quick_joke: 'یک شوخی',
    chat_quick_about: 'درباره من',
    chat_quick_code: 'کد بنویس',
    chat_quick_date: 'تاریخ',
    chat_quick_joke_prompt: 'یک شوخی بگو',
    chat_quick_about_prompt: 'درباره خودت توضیح بده',
    chat_quick_code_prompt: 'یک کد Python بنویس',
    chat_quick_date_prompt: 'تاریخ امروز چیست؟',
    chat_input_placeholder: 'پیام خود را بنویسید...',
    chat_settings: 'تنظیمات',
    chat_clear: 'پاک کردن چت',
    chat_back: 'بازگشت به لیست اپ‌ها',
    chat_settings_title: 'تنظیمات',
    chat_api_key_label: 'API Key گروک',
    chat_api_key_hint: 'کلید API خود را از console.groq.com دریافت کنید',
    chat_api_key_placeholder: 'gsk_...',
    chat_system_prompt: 'دستور سیستم',
    chat_system_prompt_placeholder: 'دستورات سیستم...',
    chat_max_tokens: 'حداکثر توکن‌ها',
    chat_save: 'ذخیره تنظیمات',
    chat_default_prompt: 'تو یک دستیار هوش مصنوعی مفید و دوستانه هستی. به سوالات به فارسی پاسخ بده.',
    chat_saved: 'تنظیمات ذخیره شد!',
    chat_last_sync: 'آخرین همگام‌سازی: {time}',
    chat_queued: 'در صف ارسال — با اتصال اینترنت خودکار ارسال می‌شود',
    chat_queued_note: '📤 {n} پیام در صف ارسال — به محض اتصال اینترنت خودکار ارسال می‌شود',
    chat_retry: 'تلاش دوباره',
    chat_delivered: 'تحویل شد',
    chat_data_title: 'داده‌های گفتگو',
    chat_export: 'خروجی (JSON)',
    chat_import: 'ورودی (JSON)',
    chat_data_hint: 'پشتیبان‌گیری — پیام‌های در صف ارسال هم ذخیره می‌شوند',
    chat_exported: 'گفتگو ذخیره شد ✓',
    chat_imported: '{n} پیام وارد شد ✓',
    chat_import_fail: 'فایل نامعتبر است',
    chat_clear_confirm: 'آیا مطمئن هستید که می‌خواهید تمام پیام‌ها را پاک کنید؟',
    chat_no_key_title: '⚠️ API Key تنظیم نشده',
    chat_no_key_text: 'برای شروع چت، کلید API خود را از بخش تنظیمات وارد کنید.',
    chat_copied: 'کپی شد!',
    chat_no_api_key_error: 'API Key تنظیم نشده است. لطفاً از بخش تنظیمات کلید API خود را وارد کنید.',
    chat_empty_response: '(پاسخ خالی)',
    chat_error_connect: 'خطا در اتصال به سرور',
    chat_error_http: 'خطای HTTP',
});

I18N.register('en', {
    chat_title: 'AI Chat',
    chat_powered: 'powered by Groq',
    chat_online: 'Online',
    chat_greeting: 'Hi {name} 👋',
    chat_welcome_title: "Hi! I'm your AI assistant",
    chat_welcome_sub: 'Ask me anything',
    chat_quick_joke: 'A joke',
    chat_quick_about: 'About me',
    chat_quick_code: 'Write code',
    chat_quick_date: 'Date',
    chat_quick_joke_prompt: 'Tell me a joke',
    chat_quick_about_prompt: 'Tell me about yourself',
    chat_quick_code_prompt: 'Write a Python code example',
    chat_quick_date_prompt: "What is today's date?",
    chat_input_placeholder: 'Type your message...',
    chat_settings: 'Settings',
    chat_clear: 'Clear chat',
    chat_back: 'Back to apps',
    chat_settings_title: 'Settings',
    chat_api_key_label: 'Groq API Key',
    chat_api_key_hint: 'Get your API key from console.groq.com',
    chat_api_key_placeholder: 'gsk_...',
    chat_system_prompt: 'System Prompt',
    chat_system_prompt_placeholder: 'System instructions...',
    chat_max_tokens: 'Max tokens',
    chat_save: 'Save settings',
    chat_default_prompt: 'You are a helpful and friendly AI assistant. Answer questions clearly and concisely.',
    chat_saved: 'Settings saved!',
    chat_last_sync: 'Last synced: {time}',
    chat_queued: 'Queued — will send automatically when back online',
    chat_queued_note: '📤 {n} queued message(s) — sending automatically on reconnect',
    chat_retry: 'Retry',
    chat_delivered: 'Delivered',
    chat_data_title: 'Conversation data',
    chat_export: 'Export (JSON)',
    chat_import: 'Import (JSON)',
    chat_data_hint: 'Backup — queued offline messages are included',
    chat_exported: 'Conversation exported ✓',
    chat_imported: 'Imported {n} messages ✓',
    chat_import_fail: 'Invalid file',
    chat_clear_confirm: 'Are you sure you want to clear all messages?',
    chat_no_key_title: '⚠️ API Key not set',
    chat_no_key_text: 'To start chatting, enter your API key in the settings.',
    chat_copied: 'Copied!',
    chat_no_api_key_error: 'API key is not set. Please enter it in the settings.',
    chat_empty_response: '(empty response)',
    chat_error_connect: 'Error connecting to server',
    chat_error_http: 'HTTP error',
});

I18N.register('ar', {
    chat_title: 'الدردشة الذكية',
    chat_powered: 'بدعم من Groq',
    chat_online: 'متصل',
    chat_greeting: 'أهلاً {name} 👋',
    chat_welcome_title: 'مرحباً! أنا مساعدك الذكي',
    chat_welcome_sub: 'اسألني أي شيء',
    chat_quick_joke: 'نكتة',
    chat_quick_about: 'عنّي',
    chat_quick_code: 'اكتب كوداً',
    chat_quick_date: 'التاريخ',
    chat_quick_joke_prompt: 'ألقِ نكتة',
    chat_quick_about_prompt: 'حدّثني عن نفسك',
    chat_quick_code_prompt: 'اكتب مثالاً بكود بايثون',
    chat_quick_date_prompt: 'ما تاريخ اليوم؟',
    chat_input_placeholder: 'اكتب رسالتك...',
    chat_settings: 'الإعدادات',
    chat_clear: 'مسح المحادثة',
    chat_back: 'العودة إلى التطبيقات',
    chat_settings_title: 'الإعدادات',
    chat_api_key_label: 'مفتاح Groq',
    chat_api_key_hint: 'احصل على المفتاح من console.groq.com',
    chat_api_key_placeholder: 'gsk_...',
    chat_system_prompt: 'التعليمات النظامية',
    chat_system_prompt_placeholder: 'التعليمات...',
    chat_max_tokens: 'الحد الأقصى للرموز',
    chat_save: 'حفظ الإعدادات',
    chat_default_prompt: 'أنت مساعد ذكي مفيد وودود. أجب عن الأسئلة بوضوح وإيجاز.',
    chat_saved: 'تم حفظ الإعدادات!',
    chat_last_sync: 'آخر مزامنة: {time}',
    chat_queued: 'في قائمة الانتظار — ستُرسل تلقائياً عند الاتصال',
    chat_queued_note: '📤 {n} رسالة في قائمة الانتظار — ستُرسل تلقائياً عند الاتصال',
    chat_retry: 'إعادة المحاولة',
    chat_delivered: 'تم الإرسال',
    chat_data_title: 'بيانات المحادثة',
    chat_export: 'تصدير (JSON)',
    chat_import: 'استيراد (JSON)',
    chat_data_hint: 'نسخة احتياطية — تشمل رسائل قائمة الانتظار',
    chat_exported: 'تم تصدير المحادثة ✓',
    chat_imported: 'تم استيراد {n} رسالة ✓',
    chat_import_fail: 'ملف غير صالح',
    chat_clear_confirm: 'هل أنت متأكد من مسح كل الرسائل؟',
    chat_no_key_title: '⚠️ لم يتم تعيين مفتاح API',
    chat_no_key_text: 'لبدء المحادثة، أدخل مفتاح API من الإعدادات.',
    chat_copied: 'تم النسخ!',
    chat_no_api_key_error: 'مفتاح API غير مضبوط. يرجى إدخاله من الإعدادات.',
    chat_empty_response: '(رد فارغ)',
    chat_error_connect: 'خطأ في الاتصال بالخادم',
    chat_error_http: 'خطأ HTTP',
});

const App = {
    init() {
        // Initialize Telegram + i18n
        TG.init({ backHref: '../../' });
        I18N.init();

        // Initialize Chat
        Chat.init();

        // Setup UI controls
        this.setupModelSelect();
        this.setupSettings();
        this.setupClearButton();

        // API key banner follows language changes
        document.addEventListener('i18n:changed', () => {
            document.title = I18N.t('chat_title');
            this.checkApiKey();
        });

        // Greet the user
        this.greetUser();
        this.checkApiKey();
        document.title = I18N.t('chat_title');
    },

    // ===== Greeting =====
    greetUser() {
        const user = TG.user();
        const statusEl = document.getElementById('status');
        if (!statusEl) return;
        statusEl.textContent = user?.first_name
            ? I18N.t('chat_greeting', { name: user.first_name })
            : I18N.t('chat_online');
    },

    // ===== Model Select =====
    setupModelSelect() {
        const select = document.getElementById('model-select');
        select.value = Store.get('ai-chat', 'selectedModel', 'llama-3.3-70b-versatile');

        select.addEventListener('change', () => {
            Store.set('ai-chat', 'selectedModel', select.value);
            TG.haptic('light');
        });
    },

    // ===== Settings =====
    setupSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        const modal = document.getElementById('settings-modal');
        const closeModal = document.getElementById('close-modal');
        const saveBtn = document.getElementById('save-settings');
        const apiKeyInput = document.getElementById('api-key-input');
        const systemPrompt = document.getElementById('system-prompt');
        const maxTokens = document.getElementById('max-tokens-input');

        settingsBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            apiKeyInput.value = Store.get('ai-chat', 'apiKey', '');
            systemPrompt.value = Store.get('ai-chat', 'systemPrompt', I18N.t('chat_default_prompt'));
            maxTokens.value = Store.get('ai-chat', 'maxTokens', 1024);
        });

        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        // Export / import the conversation (JSON keeps queued messages intact)
        const exportBtn = document.getElementById('export-btn');
        const importBtn = document.getElementById('import-btn');
        const importFile = document.getElementById('import-file');
        if (exportBtn) exportBtn.addEventListener('click', () => Chat.exportChat());
        if (importBtn) importBtn.addEventListener('click', () => importFile.click());
        if (importFile) importFile.addEventListener('change', () => {
            if (importFile.files && importFile.files[0]) Chat.importChat(importFile.files[0]);
            importFile.value = '';
        });

        saveBtn.addEventListener('click', () => {
            const key = apiKeyInput.value.trim();
            const prompt = systemPrompt.value.trim();
            const tokens = parseInt(maxTokens.value) || 1024;

            if (key) Store.set('ai-chat', 'apiKey', key);
            if (prompt) Store.set('ai-chat', 'systemPrompt', prompt);
            Store.set('ai-chat', 'maxTokens', tokens);

            modal.classList.add('hidden');
            this.checkApiKey();
            TG.toast(I18N.t('chat_saved'), 'success');
            TG.haptic('medium');
        });
    },

    // ===== Clear Button =====
    setupClearButton() {
        const clearBtn = document.getElementById('clear-btn');

        clearBtn.addEventListener('click', async () => {
            const ok = await TG.confirm(I18N.t('chat_clear_confirm'));
            if (ok) {
                Chat.clearChat();
                TG.haptic('heavy');
            }
        });
    },

    // ===== API Key Check =====
    checkApiKey() {
        const apiKey = Store.get('ai-chat', 'apiKey', '');
        const welcome = document.getElementById('welcome');
        let banner = document.querySelector('.no-api-key');

        if (!apiKey) {
            if (!banner && welcome) {
                banner = document.createElement('div');
                banner.className = 'no-api-key';
                welcome.appendChild(banner);
            }
            if (banner) {
                banner.innerHTML = `
                    <h3>${I18N.t('chat_no_key_title')}</h3>
                    <p>${I18N.t('chat_no_key_text')}</p>
                `;
            }
        } else if (banner) {
            banner.remove();
        }
    },
};

// ===== Initialize on DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});