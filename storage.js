/**
 * storage.js — localStorage wrapper for chat history and settings
 */
const Storage = {
    KEYS: {
        CHAT_HISTORY: 'ai_chat_history',
        API_KEY: 'ai_chat_api_key',
        SYSTEM_PROMPT: 'ai_chat_system_prompt',
        MAX_TOKENS: 'ai_chat_max_tokens',
        SELECTED_MODEL: 'ai_chat_selected_model',
    },

    // ===== Chat History =====
    getChatHistory() {
        try {
            const data = localStorage.getItem(this.KEYS.CHAT_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    saveChatHistory(messages) {
        try {
            localStorage.setItem(this.KEYS.CHAT_HISTORY, JSON.stringify(messages));
        } catch (e) {
            console.error('Failed to save chat history:', e);
        }
    },

    clearChatHistory() {
        localStorage.removeItem(this.KEYS.CHAT_HISTORY);
    },

    // ===== API Key =====
    getApiKey() {
        return localStorage.getItem(this.KEYS.API_KEY) || '';
    },

    saveApiKey(key) {
        localStorage.setItem(this.KEYS.API_KEY, key);
    },

    // ===== System Prompt =====
    getSystemPrompt() {
        return localStorage.getItem(this.KEYS.SYSTEM_PROMPT) || 'تو یک دستیار هوش مصنوعی مفید و دوستانه هستی. به سوالات به فارسی پاسخ بده.';
    },

    saveSystemPrompt(prompt) {
        localStorage.setItem(this.KEYS.SYSTEM_PROMPT, prompt);
    },

    // ===== Max Tokens =====
    getMaxTokens() {
        return parseInt(localStorage.getItem(this.KEYS.MAX_TOKENS)) || 1024;
    },

    saveMaxTokens(tokens) {
        localStorage.setItem(this.KEYS.MAX_TOKENS, tokens.toString());
    },

    // ===== Selected Model =====
    getSelectedModel() {
        return localStorage.getItem(this.KEYS.SELECTED_MODEL) || 'llama-3.3-70b-versatile';
    },

    saveSelectedModel(model) {
        localStorage.setItem(this.KEYS.SELECTED_MODEL, model);
    },

    // ===== Utility =====
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    formatTimestamp(ts) {
        const date = new Date(ts);
        return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    }
};
