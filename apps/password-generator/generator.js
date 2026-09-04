/**
 * generator.js — pure password generation logic (no DOM).
 * Exposes `PasswordGen` with CHARSETS, build(), entropy() and strength().
 * Used by app.js and the Node test suite.
 */
const PasswordGen = (function () {
    'use strict';

    const CHARSETS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    /**
     * Build a password.
     * @param {number} length - target length
     * @param {string[]} sets - subset of ['upper','lower','digits','symbols']
     * @param {function} randomInt - (max) => integer in [0, max)
     */
    function build(length, sets, randomInt) {
        const active = sets.filter(k => CHARSETS[k]);
        const allChars = active.map(k => CHARSETS[k]).join('');
        if (!allChars || length <= 0) return '';

        // Guarantee at least one char from each selected set
        const chars = active.map(k => CHARSETS[k][randomInt(CHARSETS[k].length)]);
        for (let i = chars.length; i < length; i++) {
            chars.push(allChars[randomInt(allChars.length)]);
        }

        // Fisher–Yates shuffle
        for (let i = chars.length - 1; i > 0; i--) {
            const j = randomInt(i + 1);
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        return chars.join('');
    }

    /** Entropy in bits. */
    function entropy(length, charsetSize) {
        return length * Math.log2(charsetSize || 1);
    }

    /** Strength level: 'weak' | 'medium' | 'strong'. */
    function strength(length, sets) {
        const size = sets.reduce((sum, k) => sum + (CHARSETS[k] ? CHARSETS[k].length : 0), 0);
        const e = entropy(length, size);
        if (e < 40) return 'weak';
        if (e < 70) return 'medium';
        return 'strong';
    }

    return { CHARSETS, build, entropy, strength };
})();