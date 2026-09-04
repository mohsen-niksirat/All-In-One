/**
 * core/backup.js — JSON backup helpers shared by all storage apps and the
 * launcher's "back up everything" panel.
 *
 *  - Exports stamp a stable per-device id and a shared FORMAT number (2).
 *  - Imports MERGE by item id and never delete: existing items are kept,
 *    newer incoming edits (by `updated`/`ts`) win, missing items are added —
 *    after a confirmable preview.
 *  - Envelopes are versioned: older formats migrate through per-app ladders
 *    (Backup.registerMigrator), future formats are politely rejected.
 *  - The launcher can back up EVERY storage-backed app at once (one multi-app
 *    JSON, plain or password-encrypted via PBKDF2 + AES-GCM) and restore it
 *    with the same merge semantics per app.
 */
const Backup = {

    /** Current backup envelope format — shared by every app (storage apps
     *  write `items`, AI Chat writes `messages`) so the migrator ladder and
     *  the "newer format" guard behave identically everywhere. */
    FORMAT: 2,

    /** app id → { fromFormat: migrator(envelope) → next envelope }. */
    MIGRATORS: {},

    registerMigrator(app, fromFormat, fn) {
        if (!this.MIGRATORS[app]) this.MIGRATORS[app] = {};
        this.MIGRATORS[app][fromFormat] = fn;
    },

    /**
     * Parse + migrate an envelope up to the current FORMAT.
     * Returns { items, env, newer }: `items` is the migrated list when the
     * envelope carries an `items` payload (storage apps), `env` is the full
     * migrated envelope (AI Chat reads `env.messages`), `newer` is true when
     * the file comes from a future format and must be refused.
     */
    normalize(data) {
        if (!data || typeof data !== 'object') return { items: null, env: null, newer: false };
        const fmt = typeof data.format === 'number' ? data.format : 1;
        if (fmt > this.FORMAT) return { items: null, env: null, newer: true };
        let env = data;
        const steps = this.MIGRATORS[data.app];
        if (steps) {
            for (let v = fmt; v < this.FORMAT; v++) {
                if (typeof steps[v] === 'function') {
                    const next = steps[v](env);
                    if (next) env = next;
                }
            }
        }
        const items = env && Array.isArray(env.items) ? env.items : null;
        return { items, env, newer: false };
    },

    // ---- Catalog of storage-backed apps for "back up everything" ----
    // Each entry knows where its user data lives in Store, under which
    // envelope payload key it travels ('items' or 'messages'), and how to
    // read/write it. Daily Journal's date-keyed object serializes to
    // { id: 'YYYY-MM-DD', … } items (mirroring the app's own import code).
    STORAGE_DEFS: [
        {
            id: 'notes-app', payload: 'items',
            read: () => Store.getJSON('notes-app', 'notes', []).filter(Boolean),
            write: (list) => Store.setJSON('notes-app', 'notes', list),
        },
        {
            id: 'bookmark-manager', payload: 'items',
            read: () => Store.getJSON('bookmark-manager', 'bookmarks', []).filter(Boolean),
            write: (list) => Store.setJSON('bookmark-manager', 'bookmarks', list),
        },
        {
            id: 'shopping-list', payload: 'items',
            read: () => Store.getJSON('shopping-list', 'items', []).filter(Boolean),
            write: (list) => Store.setJSON('shopping-list', 'items', list),
        },
        {
            id: 'habit-tracker', payload: 'items',
            read: () => Store.getJSON('habit-tracker', 'habits', []).filter(Boolean),
            write: (list) => Store.setJSON('habit-tracker', 'habits', list),
        },
        {
            id: 'expense-tracker', payload: 'items',
            read: () => Store.getJSON('expense-tracker', 'expenses', []).filter(Boolean),
            write: (list) => Store.setJSON('expense-tracker', 'expenses', list),
        },
        {
            id: 'daily-journal', payload: 'items',
            read: () => {
                const entries = Store.getJSON('daily-journal', 'entries', {}) || {};
                return Object.entries(entries)
                    .filter(([, e]) => (e && (e.text || e.mood >= 0)))
                    .map(([date, e]) => ({
                        id: date, date: date, mood: e.mood, text: e.text, updated: e.updated || 0,
                    }));
            },
            write: (list) => {
                const obj = {};
                (list || []).forEach(it => {
                    obj[it.id] = {
                        mood: it.mood === undefined ? -1 : it.mood,
                        text: it.text || '',
                        updated: it.updated || 0,
                    };
                });
                Store.setJSON('daily-journal', 'entries', obj);
            },
        },
        {
            id: 'goal-tracker', payload: 'items',
            read: () => Store.getJSON('goal-tracker', 'goals', []).filter(Boolean),
            write: (list) => Store.setJSON('goal-tracker', 'goals', list),
        },
        {
            id: 'ai-chat', payload: 'messages',
            read: () => (Store.getJSON('ai-chat', 'history', []) || []).filter(m =>
                m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'),
            write: (list) => Store.setJSON('ai-chat', 'history', list),
        },
    ],

    defById(id) {
        return this.STORAGE_DEFS.find(d => d.id === id) || null;
    },

    // ---- Last-backup bookkeeping (per app, survives in Store) ----
    lastBackups() {
        const map = Store.getJSON('hub', 'lastBackups', {});
        return (map && typeof map === 'object') ? map : {};
    },

    lastBackup(appId) {
        return this.lastBackups()[appId] || 0;
    },

    markBackup(appId) {
        if (!appId) return;
        const map = this.lastBackups();
        map[appId] = Date.now();
        Store.setJSON('hub', 'lastBackups', map);
    },

    // ---- File output helpers ----
    /** Stable per-device id (shared with all apps). */
    deviceId() {
        let id = Store.get('hub', 'deviceId', '');
        if (!id) {
            id = Store.id();
            Store.set('hub', 'deviceId', id);
        }
        return id;
    },

    /** Download a raw JSON object as a file. */
    saveJSON(filename, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => {
            try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ }
        }, 1500);
        return true;
    },

    /** Download an envelope ({app, items, …}) as JSON; records the backup
     *  date for that app (used by the launcher's reminder nudges); toasts. */
    download(filename, envelope) {
        try {
            const data = Object.assign({
                format: this.FORMAT,
                deviceId: this.deviceId(),
                exportedAt: new Date().toISOString(),
            }, envelope);
            this.saveJSON(filename, data);
            this.markBackup(envelope && envelope.app);
            TG.toast(I18N.t('core_exported'), 'success');
            return true;
        } catch (e) {
            TG.toast(I18N.t('core_import_fail'), 'error');
            return false;
        }
    },

    /** Merge two item lists by id. Newer incoming edits replace older ones. */
    mergeLists(local, incoming) {
        const byId = new Map(local.map(i => [i.id, i]));
        let added = 0;
        let updated = 0;
        for (const item of incoming) {
            if (!item || item.id === undefined || item.id === null) continue;
            const existing = byId.get(item.id);
            if (!existing) {
                byId.set(item.id, item);
                added++;
            } else {
                const tNew = item.updated || item.ts || 0;
                const tOld = existing.updated || existing.ts || 0;
                if (tNew > tOld) {
                    byId.set(item.id, Object.assign({}, existing, item));
                    updated++;
                }
            }
        }
        return { list: [...byId.values()], added, updated };
    },

    fmtDate(ts) {
        const loc = I18N.current === 'fa' ? 'fa-IR' : (I18N.current === 'ar' ? 'ar-EG' : 'en-US');
        try {
            return new Date(ts).toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return String(ts);
        }
    },

    /**
     * File-picker import flow: read → validate → preview/confirm → merge
     * with the caller's current list → apply(mergedList).
     */
    importList(file, localItems, apply) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const data = JSON.parse(String(reader.result));
                const norm = this.normalize(data);
                if (norm.newer) {
                    TG.toast(I18N.t('core_import_newer'), 'error');
                    return;
                }
                const env = norm.env || data;
                const incoming = norm.items;
                if (!incoming || incoming.length === 0) throw new Error('bad shape');

                const merged = this.mergeLists(localItems || [], incoming);
                if (merged.added === 0 && merged.updated === 0) {
                    TG.toast(I18N.t('core_import_none'), 'info');
                    return;
                }

                const times = incoming.map(i => i.updated || i.ts || 0).filter(t => t > 0);
                let from = '—';
                let to = '—';
                if (times.length) {
                    from = this.fmtDate(Math.min(...times));
                    to = this.fmtDate(Math.max(...times));
                }
                const same = env.deviceId && env.deviceId === this.deviceId();
                let preview = I18N.t('core_import_preview', {
                    n: incoming.length, m: merged.added, from, to,
                });
                if (same) preview += ' ' + I18N.t('core_import_same_device');

                const ok = await TG.confirm(preview);
                if (!ok) return;
                apply(merged.list, merged);
                TG.toast(I18N.t('core_merged', { n: merged.added }), 'success');
            } catch (e) {
                TG.toast(I18N.t('core_import_fail'), 'error');
            }
        };
        reader.onerror = () => TG.toast(I18N.t('core_import_fail'), 'error');
        reader.readAsText(file);
    },

    // ---- "Back up everything" (launcher) ----
    /** Build one envelope per storage-backed app from current Store data. */
    collectEnvelopes() {
        return this.STORAGE_DEFS.map(def => {
            const env = {
                app: def.id,
                format: this.FORMAT,
                deviceId: this.deviceId(),
                exportedAt: new Date().toISOString(),
            };
            env[def.payload] = def.read();
            return env;
        });
    },

    /** Multi-app envelope: { kind: 'multi', apps: [per-app envelopes] }. */
    multiEnvelope() {
        return {
            kind: 'multi',
            format: this.FORMAT,
            deviceId: this.deviceId(),
            exportedAt: new Date().toISOString(),
            apps: this.collectEnvelopes(),
        };
    },

    // ---- Password encryption (PBKDF2 + AES-GCM) ----
    /** True when WebCrypto is available (secure context / modern Node). */
    cryptoAvailable() {
        try {
            const c = (typeof globalThis !== 'undefined' && globalThis.crypto) || null;
            return !!(c && c.subtle && c.getRandomValues);
        } catch (e) {
            return false;
        }
    },

    b64FromBytes(buf) {
        let s = '';
        const u = new Uint8Array(buf);
        for (let i = 0; i < u.length; i += 0x8000) {
            s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        }
        return btoa(s);
    },

    bytesFromB64(b64) {
        const s = atob(b64);
        const u = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
        return u;
    },

    async deriveKey(password, saltBytes) {
        const c = globalThis.crypto;
        const enc = new TextEncoder();
        const base = await c.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await c.subtle.deriveBits(
            { name: 'PBKDF2', salt: saltBytes, iterations: 120000, hash: 'SHA-256' },
            base, 256
        );
        return c.subtle.importKey('raw', bits, 'AES-GCM', false, ['encrypt', 'decrypt']);
    },

    /** Encrypt a JSON payload. Returns an { salt, iv, ct } b64 package. */
    async encryptPayload(payload, password) {
        const c = globalThis.crypto;
        const salt = c.getRandomValues(new Uint8Array(16));
        const iv = c.getRandomValues(new Uint8Array(12));
        const key = await this.deriveKey(password, salt);
        const data = new TextEncoder().encode(JSON.stringify(payload));
        const ct = await c.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
        return {
            salt: this.b64FromBytes(salt),
            iv: this.b64FromBytes(iv),
            ct: this.b64FromBytes(ct),
        };
    },

    /** Decrypt an { salt, iv, ct } b64 package back to its payload object. */
    async decryptPayload(pack, password) {
        const c = globalThis.crypto;
        const key = await this.deriveKey(password, this.bytesFromB64(pack.salt).buffer);
        const plain = await c.subtle.decrypt(
            { name: 'AES-GCM', iv: this.bytesFromB64(pack.iv).buffer },
            key,
            this.bytesFromB64(pack.ct).buffer
        );
        return JSON.parse(new TextDecoder().decode(plain));
    },

    /** Wrap a payload into a self-describing encrypted envelope. */
    async encryptEnvelope(payload, password) {
        const pack = await this.encryptPayload(payload, password);
        return {
            kind: 'encrypted',
            format: this.FORMAT,
            deviceId: this.deviceId(),
            exportedAt: new Date().toISOString(),
            alg: { name: 'AES-GCM', kdf: 'PBKDF2-SHA256', iter: 120000 },
            salt: pack.salt,
            iv: pack.iv,
            data: pack.ct,
        };
    },

    /** Decrypt an envelope produced by encryptEnvelope(); throws on a wrong
     *  password or corrupted data (the AES-GCM tag check fails). */
    async decryptEnvelope(env, password) {
        return this.decryptPayload({ salt: env.salt, iv: env.iv, ct: env.data }, password);
    },
};
