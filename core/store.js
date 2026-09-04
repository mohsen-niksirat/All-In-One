/**
 * core/store.js — namespaced storage with Telegram CloudStorage sync.
 *
 * Primary: localStorage (synchronous, instant reads).
 * Sync:    when running inside Telegram, every write is mirrored to
 *          Telegram CloudStorage (per-user, cross-device). On boot,
 *          `initCloud()` merges cloud values into localStorage (cloud wins).
 *          Outside Telegram everything just uses localStorage.
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
    cloud: null,       // Telegram.WebApp.CloudStorage (when in Telegram)
    cloudReady: false,

    // Old flat keys from before the hub refactor, keyed by '<ns>:<key>'.
    // Preserved so existing users don't lose data (e.g. the saved Groq key).
    LEGACY_KEYS: {
        'ai-chat:history': 'ai_chat_history',
        'ai-chat:apiKey': 'ai_chat_api_key',
        'ai-chat:systemPrompt': 'ai_chat_system_prompt',
        'ai-chat:maxTokens': 'ai_chat_max_tokens',
        'ai-chat:selectedModel': 'ai_chat_selected_model',
    },

    key(ns, key) {
        return `${this.prefix}${ns}:${key}`;
    },

    // CloudStorage keys allow only [A-Za-z0-9_-], so ':' → '_'
    // (namespaces/keys must not contain '_' themselves; keys split at the first '_')
    cloudKey(localKey) {
        return localKey.replace(/:/g, '_');
    },

    /** Reverse of cloudKey(): 'tma_ns_key' → 'tma:ns:key'. */
    localKey(cloudKey) {
        const rest = String(cloudKey).replace(/^tma_/, '');
        const i = rest.indexOf('_');
        if (i === -1) return 'tma:' + rest;
        return 'tma:' + rest.slice(0, i) + ':' + rest.slice(i + 1);
    },

    /**
     * Pull all CloudStorage keys into localStorage (cloud wins).
     * Call once at boot when inside Telegram. Fire-and-forget safe.
     * @returns {Promise<boolean>} true if any value was merged
     */
    initCloud() {
        const cs = typeof TG !== 'undefined' ? TG.webApp?.CloudStorage : null;
        if (!cs) return Promise.resolve(false);
        this.cloud = cs;
        this.cloudEnabled = true;

        return new Promise((resolve) => {
            try {
                cs.getKeys((err, keys) => {
                    if (err || !keys || keys.length === 0) {
                        this.cloudReady = true;
                        return resolve(false);
                    }
                    let remaining = keys.length;
                    let merged = false;
                    keys.forEach(k => {
                        cs.getItem(k, (e, val) => {
                            if (!e && val !== null && val !== undefined) {
                                try { localStorage.setItem(this.localKey(k), val); merged = true; } catch (ex) {}
                            }
                            if (--remaining === 0) {
                                this.cloudReady = true;
                                resolve(merged);
                            }
                        });
                    });
                });
            } catch (e) {
                this.cloudReady = true;
                resolve(false);
            }
        });
    },

    /** Mirror a local write to CloudStorage (best effort, async). */
    mirror(k, value) {
        if (!this.cloud) return;
        try {
            this.cloud.setItem(this.cloudKey(k), String(value), () => {});
        } catch (e) {
            // ignore — local storage still has the value
        }
    },

    get(ns, key, def = null) {
        const k = this.key(ns, key);
        let v = localStorage.getItem(k);
        if (v === null) {
            // Migrate legacy flat key if present (preserves old user data)
            const legacyKey = this.LEGACY_KEYS[ns + ':' + key];
            if (legacyKey) {
                const legacy = localStorage.getItem(legacyKey);
                if (legacy !== null) {
                    try { localStorage.setItem(k, legacy); } catch (e) {}
                    v = legacy;
                }
            }
        }
        return v === null ? def : v;
    },

    set(ns, key, value) {
        const k = this.key(ns, key);
        try {
            localStorage.setItem(k, String(value));
        } catch (e) {
            console.error('Store.set failed:', e);
            return;
        }
        this.mirror(k, value);
    },

    remove(ns, key) {
        const k = this.key(ns, key);
        localStorage.removeItem(k);
        if (this.cloud) {
            try { this.cloud.removeItem(this.cloudKey(k), () => {}); } catch (e) {}
        }
    },

    clear(ns) {
        const p = this.prefix + ns + ':';
        const keys = Object.keys(localStorage).filter(k => k.startsWith(p));
        keys.forEach(k => {
            localStorage.removeItem(k);
            if (this.cloud) {
                try { this.cloud.removeItem(this.cloudKey(k), () => {}); } catch (e) {}
            }
        });
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

    /** Format a timestamp as a localized time string. */
    time(ts) {
        return new Date(ts).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    },
};