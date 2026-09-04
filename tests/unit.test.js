/**
 * tests/unit.test.js — core layer unit tests (no DOM, no deps).
 * Run with: node --test tests/
 *
 * Covers: Store namespacing & CloudStorage mirroring, I18N fallback chain,
 * UnitConverter math, PasswordGen generation & entropy.
 */
'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

/** Load a script into a fresh vm context and read a top-level binding. */
function load(file, sandbox, exportName) {
    const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const ctx = vm.createContext(sandbox);
    vm.runInContext(code, ctx, { filename: file });
    return vm.runInContext(exportName, ctx);
}

/** Minimal in-memory localStorage. Keys are stored as own properties, exactly like the real one (methods live on the prototype). */
class MockLocalStorage {
    getItem(k) { return Object.prototype.hasOwnProperty.call(this, k) ? this[k] : null; }
    setItem(k, v) { this[k] = String(v); }
    removeItem(k) { delete this[k]; }
    clear() { for (const k of Object.keys(this)) delete this[k]; }
    key(i) { return Object.keys(this)[i] ?? null; }
    get length() { return Object.keys(this).length; }
}

function mockLocalStorage() {
    return new MockLocalStorage();
}

// ================= Store =================

test('Store: namespaced get/set and defaults', () => {
    const Store = load('core/store.js', { localStorage: mockLocalStorage(), console }, 'Store');
    Store.set('app', 'k', 'v1');
    assert.strictEqual(Store.get('app', 'k'), 'v1');
    assert.strictEqual(Store.get('other', 'k', 'dflt'), 'dflt');
    assert.strictEqual(Store.get('app', 'missing', 42), 42);
    // namespaces are isolated
    assert.strictEqual(Store.get('other', 'k'), null);
});

test('Store: JSON round-trip', () => {
    const Store = load('core/store.js', { localStorage: mockLocalStorage(), console }, 'Store');
    const data = { a: [1, 2, 3], b: 'x' };
    Store.setJSON('app', 'obj', data);
    // vm-realm objects have a different prototype than host objects, so compare structurally
    assert.strictEqual(JSON.stringify(Store.getJSON('app', 'obj')), JSON.stringify(data));
    assert.strictEqual(Store.getJSON('app', 'missing', []).length, 0);
    // corrupted JSON falls back to default
    Store.set('app', 'bad', '{oops');
    assert.strictEqual(Store.getJSON('app', 'bad', null), null);
});

test('Store: legacy flat keys auto-migrate', () => {
    const ls = mockLocalStorage();
    ls.setItem('ai_chat_api_key', 'gsk_legacy');
    const Store = load('core/store.js', { localStorage: ls, console }, 'Store');
    assert.strictEqual(Store.get('ai-chat', 'apiKey', ''), 'gsk_legacy');
    assert.strictEqual(ls.getItem('tma:ai-chat:apiKey'), 'gsk_legacy');
});

test('Store: clear only removes its own namespace', () => {
    const ls = mockLocalStorage();
    const Store = load('core/store.js', { localStorage: ls, console }, 'Store');
    Store.set('app-a', 'x', '1');
    Store.set('app-b', 'x', '2');
    ls.setItem('unrelated', 'keep');
    Store.clear('app-a');
    assert.strictEqual(ls.getItem('tma:app-a:x'), null);
    assert.strictEqual(Store.get('app-b', 'x'), '2');
    assert.strictEqual(ls.getItem('unrelated'), 'keep');
});

test('Store: id() is unique and string-like', () => {
    const Store = load('core/store.js', { localStorage: mockLocalStorage(), console }, 'Store');
    const ids = new Set(Array.from({ length: 100 }, () => Store.id()));
    assert.strictEqual(ids.size, 100);
});

test('Store: initCloud merges cloud values, set()/remove() mirror', async () => {
    const ls = mockLocalStorage();
    const cloudStore = new Map([
        ['tma_app_k', 'cloud-value'],
        ['tma_app_j', 'x'],
    ]);
    const cloud = {
        getKeys: cb => cb(null, [...cloudStore.keys()]),
        getItem: (k, cb) => cb(null, cloudStore.get(k) ?? null),
        setItem: (k, v, cb) => { cloudStore.set(k, String(v)); if (cb) cb(); },
        removeItem: (k, cb) => { cloudStore.delete(k); if (cb) cb(); },
    };

    const sandbox = { localStorage: ls, console, TG: { webApp: { CloudStorage: cloud } } };
    const Store = load('core/store.js', sandbox, 'Store');

    const merged = await Store.initCloud();
    assert.strictEqual(merged, true);
    // cloud wins over local on boot
    assert.strictEqual(ls.getItem('tma:app:k'), 'cloud-value');

    // writes mirror to cloud with ':' → '_' keys
    Store.set('app', 'other', 'y');
    assert.strictEqual(cloudStore.get('tma_app_other'), 'y');
    assert.strictEqual(Store.get('app', 'other'), 'y');

    // remove mirrors too
    Store.remove('app', 'k');
    assert.ok(!cloudStore.has('tma_app_k'));
    assert.strictEqual(ls.getItem('tma:app:k'), null);
});

test('Store: initCloud no-ops outside Telegram', async () => {
    const Store = load('core/store.js', { localStorage: mockLocalStorage(), console }, 'Store');
    const merged = await Store.initCloud();
    assert.strictEqual(merged, false);
});

// ================= I18N =================

function i18nSandbox(ls) {
    const dirCalls = [];
    return {
        sandbox: {
            localStorage: ls || mockLocalStorage(),
            console,
            navigator: { language: 'en' },
            TG: { user: () => null },
            CustomEvent: globalThis.CustomEvent,
            document: {
                documentElement: {
                    setAttribute: (name, val) => { dirCalls.push([name, val]); },
                    style: {},
                },
                body: {},
                querySelectorAll: () => [],
                querySelector: () => null,
                addEventListener() {},
                dispatchEvent() {},
                createElement: () => ({}),
            },
        },
        dirCalls,
    };
}

test('I18N: falls back en → key, params interpolate', () => {
    const { sandbox } = i18nSandbox();
    const Store = load('core/store.js', sandbox, 'Store');
    const I18N = load('core/i18n.js', sandbox, 'I18N');

    I18N.register('fa', { greet: 'سلام {name}', only_fa: 'فقط فارسی' });
    I18N.register('en', { greet: 'Hi {name}', only_en: 'only english' });
    I18N.init();

    assert.strictEqual(I18N.current, 'en'); // navigator.language detection
    // missing in current dict falls back to en
    I18N.set('fa');
    assert.strictEqual(I18N.t('only_en'), 'only english');
    // missing everywhere returns the key itself
    assert.strictEqual(I18N.t('nope_xyz'), 'nope_xyz');
    // params
    assert.strictEqual(I18N.t('greet', { name: 'Ali' }), 'سلام Ali');
});

test('I18N: language choice persists and is re-detected', () => {
    const ls = mockLocalStorage();
    const { sandbox } = i18nSandbox(ls);
    const Store = load('core/store.js', sandbox, 'Store');
    const I18N = load('core/i18n.js', sandbox, 'I18N');

    I18N.register('fa', { a: 'فا' });
    I18N.register('en', { a: 'en' });
    I18N.register('ar', { a: 'ع' });
    I18N.init();
    I18N.set('ar');

    assert.strictEqual(Store.get('hub', 'lang'), 'ar');
    assert.strictEqual(I18N.current, 'ar');
    assert.strictEqual(I18N.t('a'), 'ع');

    // A fresh I18N (same storage) picks the saved language
    const sandbox2 = i18nSandbox(ls).sandbox;
    const Store2 = load('core/store.js', sandbox2, 'Store');
    const I18N2 = load('core/i18n.js', sandbox2, 'I18N');
    I18N2.register('fa', { a: 'فا' });
    I18N2.register('en', { a: 'en' });
    I18N2.register('ar', { a: 'ع' });
    I18N2.init();
    assert.strictEqual(I18N2.current, 'ar');
});

test('I18N: RTL direction for fa and ar', () => {
    const { sandbox, dirCalls } = i18nSandbox();
    load('core/store.js', sandbox, 'Store');
    const I18N = load('core/i18n.js', sandbox, 'I18N');
    I18N.register('en', { a: 'x' });
    I18N.register('fa', { a: 'x' });
    I18N.register('ar', { a: 'x' });
    I18N.init();
    I18N.set('fa');
    I18N.set('ar');
    const dirs = dirCalls.filter(c => c[0] === 'dir').map(c => c[1]);
    assert.ok(dirs.includes('rtl'));
    assert.ok(dirs.includes('ltr'));
});

test('I18N: set() ignores unknown languages', () => {
    const { sandbox } = i18nSandbox();
    const Store = load('core/store.js', sandbox, 'Store');
    const I18N = load('core/i18n.js', sandbox, 'I18N');
    I18N.register('en', { a: 'x' });
    I18N.init();
    I18N.set('xx');
    assert.strictEqual(I18N.current, 'en');
    assert.strictEqual(Store.get('hub', 'lang'), null);
});

// ================= UnitConverter =================

const UnitConverter = load('apps/unit-converter/converter.js', {}, 'UnitConverter');

test('UnitConverter: length', () => {
    assert.strictEqual(UnitConverter.convert('length', 1, 'm', 'km'), 0.001);
    assert.strictEqual(UnitConverter.convert('length', 1000, 'm', 'km'), 1);
    assert.ok(Math.abs(UnitConverter.convert('length', 1, 'm', 'ft') - 3.280839895) < 1e-6);
});

test('UnitConverter: weight', () => {
    assert.strictEqual(UnitConverter.convert('weight', 1000, 'g', 'kg'), 1);
    assert.strictEqual(UnitConverter.convert('weight', 1, 'kg', 'g'), 1000);
    assert.ok(Math.abs(UnitConverter.convert('weight', 1, 'lb', 'kg') - 0.45359237) < 1e-9);
});

test('UnitConverter: temperature special cases', () => {
    assert.strictEqual(UnitConverter.convert('temp', 0, 'c', 'f'), 32);
    assert.strictEqual(UnitConverter.convert('temp', 100, 'c', 'f'), 212);
    assert.strictEqual(UnitConverter.convert('temp', 100, 'c', 'k'), 373.15);
    assert.strictEqual(UnitConverter.convert('temp', 212, 'f', 'c'), 100);
    assert.strictEqual(UnitConverter.convert('temp', 0, 'k', 'c'), -273.15);
});

test('UnitConverter: data / speed / time', () => {
    assert.strictEqual(UnitConverter.convert('data', 1, 'GB', 'MB'), 1024);
    assert.strictEqual(UnitConverter.convert('data', 8, 'b', 'B'), 1);
    assert.ok(Math.abs(UnitConverter.convert('speed', 100, 'kmh', 'ms') - 27.77778) < 1e-3);
    assert.strictEqual(UnitConverter.convert('time', 1, 'h', 'min'), 60);
    assert.strictEqual(UnitConverter.convert('time', 7, 'day', 'week'), 1);
});

test('UnitConverter: throws on unknown category/unit', () => {
    assert.throws(() => UnitConverter.convert('nope', 1, 'm', 'km'));
    assert.throws(() => UnitConverter.convert('length', 1, 'm', 'nope'));
    assert.throws(() => UnitConverter.convert('length', 1, 'nope', 'km'));
});

test('UnitConverter: trilingual unit labels', () => {
    const m = UnitConverter.CATEGORIES.length.units.find(u => u.id === 'm');
    assert.strictEqual(UnitConverter.label(m, 'fa'), 'متر');
    assert.strictEqual(UnitConverter.label(m, 'ar'), 'متر');
    assert.strictEqual(UnitConverter.label(m, 'en'), 'Meter');
    assert.strictEqual(UnitConverter.label(m, 'de'), 'Meter'); // falls back to en
});

// ================= PasswordGen =================

const PasswordGen = load('apps/password-generator/generator.js', {}, 'PasswordGen');

test('PasswordGen: build respects length and charset', () => {
    const rng = () => 0;
    const sets = ['upper', 'lower', 'digits', 'symbols'];
    const p = PasswordGen.build(16, sets, rng);
    assert.strictEqual(p.length, 16);
    // every char comes from an allowed set
    const allowed = new Set(sets.flatMap(s => [...PasswordGen.CHARSETS[s]]));
    assert.ok([...p].every(c => allowed.has(c)));
    // at least one char from every selected set
    for (const s of sets) {
        assert.ok([...p].some(c => PasswordGen.CHARSETS[s].includes(c)), 'missing set: ' + s);
    }
});

test('PasswordGen: build edge cases', () => {
    assert.strictEqual(PasswordGen.build(10, [], () => 0), '');
    assert.strictEqual(PasswordGen.build(0, ['upper'], () => 0), '');
    const p = PasswordGen.build(5, ['digits'], () => 0);
    assert.strictEqual(p.length, 5);
    assert.ok([...p].every(c => '0123456789'.includes(c)));
});

test('PasswordGen: entropy', () => {
    assert.strictEqual(PasswordGen.entropy(16, 94), 16 * Math.log2(94));
    assert.strictEqual(PasswordGen.entropy(10, 0), 0);
});

test('PasswordGen: strength thresholds', () => {
    assert.strictEqual(PasswordGen.strength(6, ['upper']), 'weak');       // ~28 bits
    assert.strictEqual(PasswordGen.strength(10, ['upper', 'lower']), 'medium'); // ~57 bits
    assert.strictEqual(PasswordGen.strength(16, ['upper', 'lower', 'digits', 'symbols']), 'strong'); // ~105 bits
});