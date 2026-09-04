/**
 * core/backup.js — tiny JSON backup helpers shared by the storage apps
 * (Notes, Bookmarks, Shopping List, …).
 *
 * Exports stamp a stable per-device id. Imports MERGE by item id and never
 * delete: existing items are kept, newer incoming edits (by `updated`/`ts`)
 * win for the same id, and missing items are appended — after a confirmable
 * preview (count + date range + how many are new).
 */
const Backup = {

    /** Current backup envelope format. Backups written with a lower format
     *  number are migrated through the app's registered ladder; backups from
     *  a NEWER format are politely rejected instead of mis-parsed. */
    FORMAT: 1,

    /** app id → { fromFormat: migrator(envelope) → next envelope }. */
    MIGRATORS: {},

    registerMigrator(app, fromFormat, fn) {
        if (!this.MIGRATORS[app]) this.MIGRATORS[app] = {};
        this.MIGRATORS[app][fromFormat] = fn;
    },

    /** Parse + migrate an envelope to { items } or { newer: true }. */
    normalize(data) {
        if (!data || typeof data !== 'object') return { items: null, newer: false };
        const fmt = data.format || 1;
        if (fmt > this.FORMAT) return { items: null, newer: true };
        let cur = data;
        const steps = this.MIGRATORS[data.app];
        if (steps) {
            for (let v = fmt; v < this.FORMAT; v++) {
                if (typeof steps[v] === 'function') {
                    const next = steps[v](cur);
                    if (next) cur = next;
                }
            }
        }
        const items = cur && Array.isArray(cur.items) ? cur.items : null;
        return { items, newer: false };
    },

    /** Stable per-device id (shared with all apps). */
    deviceId() {
        let id = Store.get('hub', 'deviceId', '');
        if (!id) {
            id = Store.id();
            Store.set('hub', 'deviceId', id);
        }
        return id;
    },

    /** Download an envelope ({app, items, …}) as JSON; toasts on success. */
    download(filename, envelope) {
        try {
            const data = Object.assign({
                format: this.FORMAT,
                deviceId: this.deviceId(),
                exportedAt: new Date().toISOString(),
            }, envelope);
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
                const same = data.deviceId && data.deviceId === this.deviceId();
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
};
