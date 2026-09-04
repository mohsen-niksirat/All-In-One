/**
 * core/store.js — namespaced localStorage wrapper.
 *
 * Usage:
 *   Store.get('app-id', 'key', default)
 *   Store.set('app-id', 'key', value)
 *   Store.getJSON('app-id', 'key', default)
 *   Store.setJSON('app-id', 'key', value)
 *
 * Legacy flat keys (e.g. 'ai_chat_api_key') are auto-migrated on first read.
 */
const Store = {
    prefix: 'tma:',

    key(ns, key) {
        return `${this.prefix}${ns}:${key}`;
    },

    get(ns, key, def = null) {
        const k = this.key(ns, key);
        let v = localStorage.getItem(k);
        if (v === null) {
            // Migrate legacy flat key if present (preserves old user data)
            const legacy = localStorage.getItem(key);
            if (legacy !== null) {
                try { localStorage.setItem(k, legacy); } catch (e) {}
                v = legacy;
            }
        }
        return v === null ? def : v;
    },

    set(ns, key, value) {
        try {
            localStorage.setItem(this.key(ns, key), String(value));
        } catch (e) {
            console.error('Store.set failed:', e);
        }
    },

    remove(ns, key) {
        localStorage.removeItem(this.key(ns, key));
    },

    clear(ns) {
        const p = this.prefix + ns + ':';
        Object.keys(localStorage)
            .filter(k => k.startsWith(p))
            .forEach(k => localStorage.removeItem(k));
    },

    getJSON(ns, key, def = null) {
        const v = this.get(ns, key);
        if (v === null) return def;
        try { return JSON.parse(v); } catch (e) { return def; }
    },

    setJSON(ns, key, value) {
        try {
            this.set(ns, key, JSON.stringify(value));
        } catch (e) {
            console.error('Store.setJSON failed:', e);
        }
    },

    /** Unique id helper. */
    id() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    /** Format a timestamp as fa-IR time. */
    time(ts) {
        return new Date(ts).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    },
};