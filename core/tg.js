/**
 * core/tg.js — Telegram Mini App wrapper.
 * Works with or without the Telegram webview (browser testing).
 */
const TG = {
    webApp: null,
    isTelegram: false,

    /**
     * Initialize the Telegram WebApp SDK.
     * @param {Object} options - { backHref: string } link for the back button
     */
    init(options = {}) {
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            this.webApp = Telegram.WebApp;
            this.isTelegram = true;
            document.body.classList.add('in-tg');
            this.webApp.ready();
            this.webApp.expand();
            this.applyTheme();
            this.webApp.onEvent('themeChanged', () => this.applyTheme());
            // Merge CloudStorage into localStorage (cross-device sync, best effort)
            if (typeof Store !== 'undefined') Store.initCloud();
        } else {
            // Browser testing fallback
            document.documentElement.setAttribute('data-theme', 'dark');
            console.log('Running outside Telegram (browser preview)');
        }
        if (options.backHref) this.setupBack(options.backHref);
        this.registerServiceWorker();
        return this;
    },

    /**
     * Register the root service worker (offline app-shell) once per origin.
     * The SW URL is derived from this script's own URL (…/core/tg.js → …/sw.js),
     * so it works on GitHub Pages sub-paths (/All-In-One/) and the launcher alike.
     */
    registerServiceWorker() {
        try {
            if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
            if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
            const script = document.currentScript && document.currentScript.src;
            if (!script) return;
            const u = new URL(script);
            const parts = u.pathname.split('/');
            parts.pop(); // tg.js
            parts.pop(); // core
            const swUrl = new URL(parts.join('/') + '/sw.js', u.origin);
            navigator.serviceWorker.register(swUrl).catch(() => {});
        } catch (e) {
            // never let SW registration break an app
        }
    },

    /** Map Telegram theme params onto CSS variables. */
    applyTheme() {
        const tg = this.webApp;
        if (!tg) return;
        const theme = tg.themeParams || {};
        const root = document.documentElement;
        root.setAttribute('data-theme', tg.colorScheme === 'dark' ? 'dark' : 'light');

        const map = {
            bg_color: '--bg-color',
            secondary_bg_color: '--bg-secondary',
            text_color: '--text-color',
            hint_color: '--text-secondary',
            button_color: '--accent-color',
            button_text_color: '--user-bubble-text',
        };
        for (const [key, prop] of Object.entries(map)) {
            if (theme[key]) root.style.setProperty(prop, theme[key]);
        }
        // Mirror accent into chat user bubbles
        if (theme.button_color) root.style.setProperty('--user-bubble-bg', theme.button_color);
    },

    /** Current user object or null. */
    user() {
        return this.webApp?.initDataUnsafe?.user || null;
    },

    /** Haptic feedback. Types: light | medium | heavy | success | error | warning */
    haptic(type = 'light') {
        const hf = this.webApp?.HapticFeedback;
        if (!hf) return;
        try {
            if (type === 'success' || type === 'error' || type === 'warning') {
                hf.notificationOccurred(type);
            } else {
                hf.impactOccurred(type);
            }
        } catch (e) {
            // ignore
        }
    },

    /** Show a toast. Types: info | success | error */
    toast(message, type = 'info') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    },

    /** Register back navigation (native BackButton in Telegram, DOM link otherwise). */
    setupBack(href) {
        if (this.webApp?.BackButton) {
            this.webApp.BackButton.show();
            this.webApp.BackButton.onClick(() => {
                window.location.href = href;
            });
        }
    },

    /** Confirm dialog — uses Telegram's native confirm when available. */
    confirm(message) {
        if (this.webApp?.showConfirm) {
            return this.webApp.showConfirm(message);
        }
        return Promise.resolve(window.confirm(message));
    },
};