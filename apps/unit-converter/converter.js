/**
 * converter.js — pure unit conversion logic (no DOM).
 * Exposes `UnitConverter` with CATEGORIES and convert().
 * Used by app.js and the Node test suite.
 */
const UnitConverter = (function () {
    'use strict';

    // factor: multiply to convert to the category's base unit
    const CATEGORIES = {
        length: {
            units: [
                { id: 'mm', fa: 'میلی‌متر', en: 'Millimeter', ar: 'ميليمتر', sym: 'mm', factor: 0.001 },
                { id: 'cm', fa: 'سانتی‌متر', en: 'Centimeter', ar: 'سنتيمتر', sym: 'cm', factor: 0.01 },
                { id: 'm', fa: 'متر', en: 'Meter', ar: 'متر', sym: 'm', factor: 1 },
                { id: 'km', fa: 'کیلومتر', en: 'Kilometer', ar: 'كيلومتر', sym: 'km', factor: 1000 },
                { id: 'in', fa: 'اینچ', en: 'Inch', ar: 'بوصة', sym: 'in', factor: 0.0254 },
                { id: 'ft', fa: 'فوت', en: 'Foot', ar: 'قدم', sym: 'ft', factor: 0.3048 },
                { id: 'yd', fa: 'یارد', en: 'Yard', ar: 'ياردة', sym: 'yd', factor: 0.9144 },
                { id: 'mi', fa: 'مایل', en: 'Mile', ar: 'ميل', sym: 'mi', factor: 1609.344 },
            ],
        },
        weight: {
            units: [
                { id: 'mg', fa: 'میلی‌گرم', en: 'Milligram', ar: 'مليغرام', sym: 'mg', factor: 1e-6 },
                { id: 'g', fa: 'گرم', en: 'Gram', ar: 'غرام', sym: 'g', factor: 0.001 },
                { id: 'kg', fa: 'کیلوگرم', en: 'Kilogram', ar: 'كيلوغرام', sym: 'kg', factor: 1 },
                { id: 'ton', fa: 'تن', en: 'Tonne', ar: 'طن', sym: 't', factor: 1000 },
                { id: 'lb', fa: 'پوند', en: 'Pound', ar: 'رطل', sym: 'lb', factor: 0.45359237 },
                { id: 'oz', fa: 'اونس', en: 'Ounce', ar: 'أونصة', sym: 'oz', factor: 0.028349523125 },
            ],
        },
        temp: {
            isTemp: true,
            units: [
                { id: 'c', fa: 'سلسیوس', en: 'Celsius', ar: 'سيليسيوس', sym: '°C', temp: true },
                { id: 'f', fa: 'فارنهایت', en: 'Fahrenheit', ar: 'فهرنهايت', sym: '°F', temp: true },
                { id: 'k', fa: 'کلوین', en: 'Kelvin', ar: 'كلفن', sym: 'K', temp: true },
            ],
            toBase: { c: x => x, f: x => (x - 32) * 5 / 9, k: x => x - 273.15 },
            fromBase: { c: x => x, f: x => x * 9 / 5 + 32, k: x => x + 273.15 },
        },
        data: {
            units: [
                { id: 'b', fa: 'بیت', en: 'Bit', ar: 'بِت', sym: 'bit', factor: 0.125 },
                { id: 'B', fa: 'بایت', en: 'Byte', ar: 'بايت', sym: 'B', factor: 1 },
                { id: 'KB', fa: 'کیلوبایت', en: 'Kilobyte', ar: 'كيلوبايت', sym: 'KB', factor: 1024 },
                { id: 'MB', fa: 'مگابایت', en: 'Megabyte', ar: 'ميغابايت', sym: 'MB', factor: 1024 ** 2 },
                { id: 'GB', fa: 'گیگابایت', en: 'Gigabyte', ar: 'غيغابايت', sym: 'GB', factor: 1024 ** 3 },
                { id: 'TB', fa: 'ترابایت', en: 'Terabyte', ar: 'تيرابايت', sym: 'TB', factor: 1024 ** 4 },
            ],
        },
        speed: {
            units: [
                { id: 'ms', fa: 'متر بر ثانیه', en: 'Meter/sec', ar: 'متر/ثانية', sym: 'm/s', factor: 1 },
                { id: 'kmh', fa: 'کیلومتر بر ساعت', en: 'Km/hour', ar: 'كيلومتر/ساعة', sym: 'km/h', factor: 1 / 3.6 },
                { id: 'mph', fa: 'مایل بر ساعت', en: 'Mile/hour', ar: 'ميل/ساعة', sym: 'mph', factor: 0.44704 },
                { id: 'knot', fa: 'گره', en: 'Knot', ar: 'عقدة', sym: 'kn', factor: 0.514444 },
            ],
        },
        time: {
            units: [
                { id: 'ms', fa: 'میلی‌ثانیه', en: 'Millisecond', ar: 'ميلي ثانية', sym: 'ms', factor: 0.001 },
                { id: 's', fa: 'ثانیه', en: 'Second', ar: 'ثانية', sym: 's', factor: 1 },
                { id: 'min', fa: 'دقیقه', en: 'Minute', ar: 'دقيقة', sym: 'min', factor: 60 },
                { id: 'h', fa: 'ساعت', en: 'Hour', ar: 'ساعة', sym: 'h', factor: 3600 },
                { id: 'day', fa: 'روز', en: 'Day', ar: 'يوم', sym: 'd', factor: 86400 },
                { id: 'week', fa: 'هفته', en: 'Week', ar: 'أسبوع', sym: 'wk', factor: 604800 },
            ],
        },
    };

    /**
     * Convert a value between two units of a category.
     * @returns {number}
     */
    function convert(category, value, fromId, toId) {
        const cat = CATEGORIES[category];
        if (!cat) throw new Error('Unknown category: ' + category);

        if (cat.isTemp) {
            const from = cat.toBase[fromId];
            const to = cat.fromBase[toId];
            if (!from || !to) throw new Error('Unknown unit: ' + fromId + '/' + toId);
            return to(from(value));
        }

        const fromUnit = cat.units.find(u => u.id === fromId);
        const toUnit = cat.units.find(u => u.id === toId);
        if (!fromUnit || !toUnit) throw new Error('Unknown unit: ' + fromId + '/' + toId);
        return (value * fromUnit.factor) / toUnit.factor;
    }

    /** Human-readable unit label for a language (fa | ar | en). */
    function label(unit, lang) {
        return lang === 'fa' ? unit.fa : (lang === 'ar' ? unit.ar : unit.en);
    }

    return { CATEGORIES, convert, label };
})();