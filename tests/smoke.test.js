/**
 * tests/smoke.test.js — boots every page's scripts with a DOM shim.
 * Run with: node --test tests/
 *
 * Asserts for each page (launcher + every app):
 *  - all core + app scripts load and boot without throwing
 *  - the i18n engine registers fa / en / ar dictionaries
 *  - every data-i18n / data-i18n-placeholder / data-i18n-title key used in
 *    the HTML exists in ALL THREE dictionaries (and every I18N.t() literal)
 *  - document.title is translated (never left as the raw key)
 *
 * Also verifies registry integrity (unique ids, trilingual metadata,
 * ready apps have folders, tag_* keys translated).
 */
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

// ================= DOM shim =================

function makeClassList() {
    const set = new Set();
    return {
        add: (...c) => c.forEach(x => set.add(x)),
        remove: (...c) => c.forEach(x => set.delete(x)),
        toggle: (c, force) => {
            const on = force === undefined ? !set.has(c) : Boolean(force);
            if (on) set.add(c); else set.delete(c);
            return on;
        },
        contains: c => set.has(c),
    };
}

function makeStyle() {
    const props = {};
    return {
        props,
        setProperty(k, v) { props[k] = String(v); },
        removeProperty(k) { delete props[k]; },
    };
}

function makeElement(tag) {
    return {
        tagName: (tag || 'div').toUpperCase(),
        children: [],
        style: makeStyle(),
        dataset: {},
        classList: makeClassList(),
        attributes: {},
        value: '',
        textContent: '',
        innerHTML: '',
        disabled: false,
        checked: false,
        _listeners: {},
        setAttribute(k, v) { this.attributes[k] = String(v); },
        getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; },
        appendChild(c) { this.children.push(c); return c; },
        removeChild(c) {
            const i = this.children.indexOf(c);
            if (i >= 0) this.children.splice(i, 1);
            return c;
        },
        remove() {},
        addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); },
        dispatchEvent(e) { (this._listeners[e.type] || []).forEach(fn => fn(e)); },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        focus() {},
        select() {},
        click() {},
    };
}

function makeDocument() {
    const doc = makeElement('document');
    doc.documentElement = makeElement('html');
    doc.body = makeElement('body');
    doc.head = makeElement('head');
    doc.title = '';
    const byId = {};
    doc.getElementById = id => (byId[id] || (byId[id] = makeElement('div')));
    doc.createElement = tag => makeElement(tag);
    doc.addEventListener = function (type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); };
    doc.dispatchEvent = function (e) { (this._listeners[e.type] || []).forEach(fn => fn(e)); };
    doc.querySelector = () => null;
    doc.querySelectorAll = () => [];
    return doc;
}

class MockLocalStorage {
    getItem(k) { return Object.prototype.hasOwnProperty.call(this, k) ? this[k] : null; }
    setItem(k, v) { this[k] = String(v); }
    removeItem(k) { delete this[k]; }
    clear() { for (const k of Object.keys(this)) delete this[k]; }
    key(i) { return Object.keys(this)[i] ?? null; }
    get length() { return Object.keys(this).length; }
}

function makeLocalStorage() {
    return new MockLocalStorage();
}

/** Boot one page: run every local <script> in order, then dispatch DOMContentLoaded. */
function bootPage(htmlFile, presetStorage = {}) {
    const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
    const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]
        .map(m => m[1])
        .filter(s => !s.startsWith('http'));

    const localStorageMock = makeLocalStorage();
    for (const [k, v] of Object.entries(presetStorage || {})) localStorageMock.setItem(k, String(v));

    const sandbox = {
        console,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        requestAnimationFrame: fn => setTimeout(fn, 16),
        CustomEvent: globalThis.CustomEvent,
        Intl,
        URL,
        TextDecoder,
        crypto: globalThis.crypto,
        navigator: { language: 'en' },
        localStorage: localStorageMock,
        location: { href: '' },
    };
    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;
    sandbox.document = makeDocument();

    const ctx = vm.createContext(sandbox);
    const dir = path.dirname(htmlFile);

    for (const s of scripts) {
        vm.runInContext(
            fs.readFileSync(path.join(ROOT, dir, s), 'utf8'),
            ctx,
            { filename: s }
        );
    }
    sandbox.document.dispatchEvent({ type: 'DOMContentLoaded' });
    // Top-level const bindings (I18N, Store, APP_REGISTRY, …) live in the
    // context's lexical scope, not on the sandbox object — read them via get().
    return {
        sandbox,
        ctx,
        get: name => vm.runInContext(name, ctx),
    };
}

// ================= Page discovery =================

function allPages() {
    const pages = ['index.html'];
    for (const app of fs.readdirSync(path.join(ROOT, 'apps'))) {
        const h = path.join('apps', app, 'index.html');
        if (fs.existsSync(path.join(ROOT, h))) pages.push(h);
    }
    return pages;
}

function usedKeys(html) {
    const keys = new Set();
    for (const m of html.matchAll(/data-i18n(?:-placeholder|-title|-aria-label)?="([^"]+)"/g)) {
        keys.add(m[1]);
    }
    return keys;
}

function i18nLiterals(...jsFiles) {
    const keys = new Set();
    for (const f of jsFiles) {
        const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
        for (const m of src.matchAll(/I18N\.t\('([^']+)'/g)) {
            if (!m[1].endsWith('_') && !m[1].includes(' + ')) keys.add(m[1]);
        }
    }
    return keys;
}

function scriptsFor(htmlFile) {
    const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
    return [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]
        .map(m => m[1])
        .filter(s => !s.startsWith('http'))
        .map(s => path.join(path.dirname(htmlFile), s));
}

function allScriptSrc(htmlFile) {
    const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
    return [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]
        .map(m => m[1])
        .filter(s => !s.startsWith('http'));
}

// ================= Static audits (no DOM needed) =================

test('static audit: no parentElement-scoped queries (the dead-controls bug class)', () => {
    // The Journal mood bug was `el.parentElement.querySelectorAll('.mood')` where the
    // targets live in a sibling subtree — the handler silently attached to nothing.
    // Ban the pattern outright; scope queries to `document` or a known container id.
    for (const page of allPages()) {
        const dir = path.dirname(page);
        for (const s of allScriptSrc(page)) {
            const src = fs.readFileSync(path.join(ROOT, dir, s), 'utf8');
            const matches = [...src.matchAll(/\.parentElement\s*\.\s*querySelector(?:All)?\s*\(/g)];
            assert.strictEqual(
                matches.length, 0,
                `${page} (${s}): use document/known-container scoped queries, not parentElement.querySelector* — ${src.slice(Math.max(0, matches[0] && matches[0].index - 40), matches[0] && matches[0].index + 60)}`
            );
        }
    }
});

test('static audit: no hardcoded UI strings outside the i18n dictionaries', () => {
    // UI text must live in the I18N.register('fa'/'en'/'ar', {...}) dicts and be
    // read via I18N.t(...). Words that show up as quoted literals elsewhere are
    // untranslated stragglers (e.g. News Reader's timeAgo() 'now'/'5m'/'3h').
    // Dict blocks, comments, and CSS-class names are stripped first.
    const BANNED = [
        'now', 'yesterday', 'today', 'retry', 'refresh', 'search', 'settings',
        'cancel', 'delete', 'share', 'clear', 'offline', 'online', 'save',
        'close', 'copied', 'empty',
    ];
    const strip = (src) => src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '')
        .replace(/I18N\.register\(\s*['"](?:fa|en|ar)['"],\s*\{[\s\S]*?\n\s*\}\);\s*/g, '')
        // Mask legitimate non-UI string arguments (DOM ids, classes, API calls)
        .replace(/getElementById\s*\(\s*'[^']+'\s*\)/g, '')
        .replace(/\.classList\.(?:add|remove|toggle)\s*\(\s*'[^']+'\s*\)/g, '')
        .replace(/execCommand\s*\(\s*'[^']+'\s*\)/g, '')
        .replace(/(?:add|remove)EventListener\s*\(\s*'[^']+'\s*[,)]/g, '')
        // i18n'd attribute fallbacks inside templates (data-i18n-title=… title="…")
        .replace(/(?:data-i18n-)?(?:title|placeholder|aria-label)="[^"]*"/g, '');
    for (const page of allPages()) {
        for (const s of allScriptSrc(page)) {
            // Registry + core + launcher are infrastructure: registry tag ids and
            // CSS class names are data, not UI text. The bug class lives in app
            // controllers, so audit those (apps/<id>/app.js).
            if (s === 'apps/registry.js' || !s.endsWith('app.js')) continue;
            const src = strip(fs.readFileSync(path.join(ROOT, path.dirname(page), s), 'utf8'));
            for (const w of BANNED) {
                const re = new RegExp(`['"]${w}['"]`, 'i');
                assert.ok(
                    !re.test(src),
                    `${page} (${s}): hardcoded UI string '${w}' outside the i18n dicts — move it into all three dictionaries and use I18N.t(...)`
                );
            }
        }
    }
});

test('static audit: every getElementById target exists in the page HTML or is created in JS', () => {
    // getElementById on a typo'd id returns null in a real browser and crashes at
    // .addEventListener — the DOM shim always returns a dummy, so check it statically.
    for (const page of allPages()) {
        const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
        const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
        const jsCreated = new Set();
        const referenced = new Set();
        for (const s of allScriptSrc(page)) {
            const src = fs.readFileSync(path.join(ROOT, path.dirname(page), s), 'utf8');
            [...src.matchAll(/id="([^"]+)"/g)].forEach(m => jsCreated.add(m[1]));
            [...src.matchAll(/\.id\s*=\s*'([^']+)'/g)].forEach(m => jsCreated.add(m[1]));
            [...src.matchAll(/getElementById\s*\(\s*'([^']+)'\s*\)/g)].forEach(m => referenced.add(m[1]));
        }
        const missing = [...referenced].filter(id => !htmlIds.has(id) && !jsCreated.has(id));
        assert.strictEqual(missing.length, 0, `${page}: getElementById target(s) not in HTML or JS: ${missing.join(', ')}`);
    }
});

// ================= Tests =================

test('every page boots and i18n covers all keys in fa/en/ar', () => {
    for (const page of allPages()) {
        test(page, () => {
            const boot = bootPage(page);
            const I18N = boot.get('I18N');

            // i18n dictionaries registered for all three languages
            const langs = I18N.languages();
            for (const lang of ['fa', 'en', 'ar']) {
                assert.ok(langs.includes(lang), `${page}: missing ${lang} dictionary`);
            }

            // document.title must be translated (not a raw key)
            assert.ok(boot.sandbox.document.title, `${page}: title not set`);
            assert.ok(
                !boot.sandbox.document.title.startsWith('hub_') &&
                !/^(chat|pomo|unit|pass|pick|todo|stop|bmi|habit|exp|qr|json|md|color)_/.test(boot.sandbox.document.title),
                `${page}: title looks untranslated: ${boot.sandbox.document.title}`
            );

            // every data-i18n key in the HTML exists in all dicts
            const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
            const keys = new Set([...usedKeys(html), ...i18nLiterals(...scriptsFor(page))]);
            for (const lang of ['fa', 'en', 'ar']) {
                const dict = I18N.dicts[lang];
                for (const key of keys) {
                    assert.ok(dict[key] !== undefined, `${page} [${lang}] missing key: ${key}`);
                    assert.ok(String(dict[key]).length > 0, `${page} [${lang}] empty value: ${key}`);
                }
            }
        });
    }
});

test('changelog integrity: documents the current release in fa/en/ar', () => {
    const boot = bootPage('index.html');
    const changelog = boot.get('APP_CHANGELOG');
    const version = boot.get('TG').APP_VERSION;

    assert.ok(Array.isArray(changelog) && changelog.length > 0, 'changelog must have at least one entry');
    assert.ok(/^\d+\.\d+\.\d+$/.test(version), 'bad TG.APP_VERSION: ' + version);
    assert.strictEqual(
        changelog[0].version, version,
        `latest changelog entry (${changelog[0] && changelog[0].version}) must equal TG.APP_VERSION (${version}) — update apps/changelog.js when releasing`
    );

    const seen = new Set();
    const registry = boot.get('APP_REGISTRY');
    for (const entry of changelog) {
        assert.ok(!seen.has(entry.version), 'duplicate changelog version: ' + entry.version);
        seen.add(entry.version);
        assert.ok(entry.i18n, `entry ${entry.version} missing i18n`);
        for (const lang of ['fa', 'en', 'ar']) {
            assert.ok(
                Array.isArray(entry.i18n[lang]) && entry.i18n[lang].length > 0,
                `changelog entry ${entry.version} missing ${lang} lines`
            );
        }
        if (entry.link !== undefined) {
            assert.ok(
                registry.some(a => a.id === entry.link),
                `changelog entry ${entry.version} links to unknown app: ${entry.link}`
            );
        }
    }
});

test('registry integrity', () => {
    const boot = bootPage('index.html');
    const registry = boot.get('APP_REGISTRY');
    assert.strictEqual(registry.length, 27, 'expected 27 apps');

    const ids = new Set();
    for (const app of registry) {
        assert.ok(app.id && !ids.has(app.id), 'unique id: ' + app.id);
        ids.add(app.id);
        assert.ok(app.icon, `icon for ${app.id}`);
        for (const lang of ['fa', 'en', 'ar']) {
            assert.ok(app.i18n[lang]?.name, `${app.id}: ${lang} name`);
            assert.ok(app.i18n[lang]?.desc, `${app.id}: ${lang} desc`);
        }
        if (app.status === 'ready') {
            assert.ok(
                fs.existsSync(path.join(ROOT, 'apps', app.id, 'index.html')),
                `ready app ${app.id} missing folder`
            );
        } else {
            assert.strictEqual(app.status, 'soon', `bad status for ${app.id}`);
        }
        // keyed apps must be ready and network-tagged (they call a third-party API)
        if (app.keyed) {
            assert.strictEqual(app.status, 'ready', `keyed app ${app.id} must be ready`);
            assert.ok(
                app.tags.some(t => t === 'freeapi' || t === 'serverless'),
                `keyed app ${app.id} should carry a network tag`
            );
        }
    }

    const ready = registry.filter(a => a.status === 'ready');
    assert.strictEqual(ready.length, 27, 'expected 27 ready apps');

    // tag_* translations exist for every tag used by every app
    const launcherDicts = boot.get('I18N').dicts;
    for (const app of registry) {
        for (const tag of app.tags) {
            for (const lang of ['fa', 'en', 'ar']) {
                assert.ok(
                    launcherDicts[lang]['tag_' + tag] !== undefined,
                    `launcher [${lang}] missing tag_${tag}`
                );
            }
        }
    }
});
test('theme engine: a saved accent applies its CSS variables on boot and resets on default', () => {
    // Preset the persisted choice (namespace-prefixed key, as Store writes it).
    const boot = bootPage('index.html', { 'tma:hub:theme': 'ocean' });
    const TG = boot.get('TG');

    assert.strictEqual(TG.getTheme(), 'ocean', 'reads the saved theme from Store');

    const props = boot.sandbox.document.documentElement.style.props;
    assert.strictEqual(props['--accent-color'], '#0ea5e9');
    assert.strictEqual(props['--accent-hover'], '#0284c7');
    assert.strictEqual(props['--user-bubble-bg'], '#0ea5e9');
    assert.strictEqual(props['--user-bubble-text'], '#ffffff');
    assert.ok(props['--accent-soft'], 'soft accent set');

    // Switching back to the default removes only the overrides the engine added.
    TG.setTheme('default');
    assert.strictEqual(TG.getTheme(), 'default');
    assert.strictEqual(boot.sandbox.document.documentElement.style.props['--accent-color'], undefined);
    assert.strictEqual(boot.sandbox.document.documentElement.style.props['--user-bubble-bg'], undefined);
});

test('theme engine: an unknown saved theme falls back to default', () => {
    const boot = bootPage('index.html', { 'tma:hub:theme': 'nope-xyz' });
    const TG = boot.get('TG');
    assert.strictEqual(TG.getTheme(), 'default');
});
