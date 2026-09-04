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

function makeElement(tag) {
    return {
        tagName: (tag || 'div').toUpperCase(),
        children: [],
        style: {},
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
function bootPage(htmlFile) {
    const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
    const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]
        .map(m => m[1])
        .filter(s => !s.startsWith('http'));

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
        localStorage: makeLocalStorage(),
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
    for (const m of html.matchAll(/data-i18n(?:-placeholder|-title)?="([^"]+)"/g)) {
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
    }

    const ready = registry.filter(a => a.status === 'ready');
    assert.strictEqual(ready.length, 19, 'expected 19 ready apps');

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