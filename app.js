/**
 * app.js — Main application initialization
 */
const App = {
    tg: null,

    init() {
        // Initialize Telegram WebApp
        this.initTelegram();
        
        // Initialize Chat
        Chat.init();
        
        // Setup UI controls
        this.setupModelSelect();
        this.setupSettings();
        this.setupClearButton();
        
        // Load saved settings
        this.loadSettings();
        
        // Check API key
        this.checkApiKey();
    },

    // ===== Telegram SDK =====
    initTelegram() {
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            this.tg = Telegram.WebApp;
            
            // Ready
            this.tg.ready();
            
            // Expand to full height
            this.tg.expand();
            
            // Apply theme
            this.applyTheme();
            
            // Setup MainButton
            this.tg.MainButton.setText('ارسال');
            this.tg.MainButton.onClick(() => Chat.sendMessage());
            
            // Listen for theme changes
            this.tg.onEvent('themeChanged', () => this.applyTheme());
            
            // Get user info
            this.displayUserInfo();
        } else {
            // Running outside Telegram (for testing)
            console.log('Running outside Telegram - use dark mode for testing');
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    },

    applyTheme() {
        if (!this.tg) return;
        
        const theme = this.tg.themeParams;
        const isDark = this.tg.colorScheme === 'dark';
        
        // Set theme attribute
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Apply Telegram's exact colors
        if (theme) {
            const root = document.documentElement;
            if (theme.bg_color) root.style.setProperty('--bg-color', theme.bg_color);
            if (theme.text_color) root.style.setProperty('--text-color', theme.text_color);
            if (theme.hint_color) root.style.setProperty('--text-secondary', theme.hint_color);
            if (theme.secondary_bg_color) root.style.setProperty('--bg-secondary', theme.secondary_bg_color);
            if (theme.button_color) root.style.setProperty('--accent-color', theme.button_color);
            if (theme.button_text_color) root.style.setProperty('--user-bubble-text', theme.button_text_color);
        }
    },

    displayUserInfo() {
        if (!this.tg) return;
        
        const user = this.tg.initDataUnsafe?.user;
        if (user) {
            const headerInfo = document.querySelector('.header-info');
            if (headerInfo) {
                const statusEl = headerInfo.querySelector('.status');
                if (statusEl) {
                    statusEl.textContent = `سلام ${user.first_name}! 👋`;
                }
            }
        }
    },

    // ===== Model Select =====
    setupModelSelect() {
        const select = document.getElementById('model-select');
        const savedModel = Storage.getSelectedModel();
        
        select.value = savedModel;
        
        select.addEventListener('change', () => {
            Storage.saveSelectedModel(select.value);
            this.hapticFeedback('light');
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
            apiKeyInput.value = Storage.getApiKey();
            systemPrompt.value = Storage.getSystemPrompt();
            maxTokens.value = Storage.getMaxTokens();
        });

        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        saveBtn.addEventListener('click', () => {
            const key = apiKeyInput.value.trim();
            const prompt = systemPrompt.value.trim();
            const tokens = parseInt(maxTokens.value) || 1024;

            if (key) Storage.saveApiKey(key);
            if (prompt) Storage.saveSystemPrompt(prompt);
            Storage.saveMaxTokens(tokens);

            modal.classList.add('hidden');
            this.checkApiKey();
            this.showToast('تنظیمات ذخیره شد!', 'success');
            this.hapticFeedback('medium');
        });
    },

    loadSettings() {
        const savedModel = Storage.getSelectedModel();
        document.getElementById('model-select').value = savedModel;
    },

    // ===== Clear Button =====
    setupClearButton() {
        const clearBtn = document.getElementById('clear-btn');
        
        clearBtn.addEventListener('click', () => {
            if (confirm('آیا مطمئن هستید که می‌خواهید تمام پیام‌ها را پاک کنید؟')) {
                Chat.clearChat();
                this.hapticFeedback('heavy');
            }
        });
    },

    // ===== API Key Check =====
    checkApiKey() {
        const apiKey = Storage.getApiKey();
        const existing = document.querySelector('.no-api-key');
        
        if (!apiKey && existing) return;
        if (!apiKey && !existing) {
            const welcome = document.getElementById('welcome');
            if (welcome) {
                const noKeyDiv = document.createElement('div');
                noKeyDiv.className = 'no-api-key';
                noKeyDiv.innerHTML = `
                    <h3>⚠️ API Key تنظیم نشده</h3>
                    <p>برای شروع چت، کلید API خود را از بخش تنظیمات وارد کنید.</p>
                `;
                welcome.appendChild(noKeyDiv);
            }
        } else if (apiKey && existing) {
            existing.remove();
        }
    },

    // ===== Haptic Feedback =====
    hapticFeedback(type = 'light') {
        if (this.tg?.HapticFeedback) {
            switch (type) {
                case 'light':
                    this.tg.HapticFeedback.impactOccurred('light');
                    break;
                case 'medium':
                    this.tg.HapticFeedback.impactOccurred('medium');
                    break;
                case 'heavy':
                    this.tg.HapticFeedback.impactOccurred('heavy');
                    break;
                case 'success':
                    this.tg.HapticFeedback.notificationOccurred('success');
                    break;
                case 'error':
                    this.tg.HapticFeedback.notificationOccurred('error');
                    break;
            }
        }
    },

    // ===== Toast =====
    showToast(message, type = 'error') {
        Chat.showToast(message, type);
    }
};

// ===== Initialize on DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
