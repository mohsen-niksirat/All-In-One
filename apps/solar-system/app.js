/**
 * app.js — Solar System: CSS-animated orbits + planet facts. Fully offline.
 * All planet copy (names/descriptions) is given in fa/en/ar.
 */
(function () {
    'use strict';

    // ---- Translations (UI chrome only) ----
    I18N.register('fa', {
        sol_title: 'منظومه شمسی',
        sol_back: 'بازگشت به لیست اپ‌ها',
        sol_note: '⚡ آفلاین — سیارات با سرعت نسبی واقعی می‌چرخند',
        sol_diam: 'قطر',
        sol_dist: 'فاصله از خورشید',
        sol_day: 'طول روز',
        sol_year: 'طول سال',
        sol_moons: 'قمر',
        sol_temp: 'دمای میانگین',
        sol_fun: 'نکته جالب',
        sol_pick: 'برای دیدن جزئیات، یک سیاره را لمس کنید',
    });

    I18N.register('en', {
        sol_title: 'Solar System',
        sol_back: 'Back to apps',
        sol_note: '⚡ Offline — planets orbit at relative real speeds',
        sol_diam: 'Diameter',
        sol_dist: 'Distance from Sun',
        sol_day: 'Day length',
        sol_year: 'Year length',
        sol_moons: 'Moons',
        sol_temp: 'Avg. temperature',
        sol_fun: 'Fun fact',
        sol_pick: 'Tap a planet to see its details',
    });

    I18N.register('ar', {
        sol_title: 'النظام الشمسي',
        sol_back: 'العودة إلى التطبيقات',
        sol_note: '⚡ دون اتصال — تدور الكواكب بسرعات نسبية حقيقية',
        sol_diam: 'القطر',
        sol_dist: 'البعد عن الشمس',
        sol_day: 'طول اليوم',
        sol_year: 'طول السنة',
        sol_moons: 'الأقمار',
        sol_temp: 'متوسط الحرارة',
        sol_fun: 'معلومة ممتعة',
        sol_pick: 'اضغط على كوكب لرؤية تفاصيله',
    });

    const NS = 'solar-system';

    // One planet per entry — index matches the .orbit[data-orbit] elements in HTML.
    const PLANETS = [
        {
            emoji: '☿', color: '#d9d9d9', orbit: 0,
            fa: 'عطارد', en: 'Mercury', ar: 'عطارد',
            faDesc: 'کوچک‌ترین و نزدیک‌ترین سیاره به خورشید؛ سطحش پر از دهانه است.',
            enDesc: 'The smallest planet and closest to the Sun; its surface is full of craters.',
            arDesc: 'أصغر الكواكب وأقربها إلى الشمس؛ سطحه مليء بالفوهات.',
            diam: '4,879 km', dist: '57.9M km', day: '59 Earth days', year: '88 days',
            moons: '0', temp: '167 °C',
            faFun: 'یک روز عطارد از سالش بلندتر است!',
            enFun: 'A Mercury day is longer than its year!',
            arFun: 'يوم عطارد أطول من سنته!',
        },
        {
            emoji: '♀', color: '#e8c07a', orbit: 1,
            fa: 'ناهید', en: 'Venus', ar: 'الزهرة',
            faDesc: 'داغ‌ترین سیاره به خاطر اثر گلخانه‌ای؛ درخشان‌ترین سیاره در آسمان شب.',
            enDesc: 'The hottest planet due to a runaway greenhouse effect; the brightest planet in our night sky.',
            arDesc: 'أسخن الكواكب بسبب الاحتباس الحراري؛ وألمعها في سماء الليل.',
            diam: '12,104 km', dist: '108.2M km', day: '243 Earth days', year: '225 days',
            moons: '0', temp: '464 °C',
            faFun: 'روی ناهید یک روز از یک سال طولانی‌تر است و خورشید از غرب طلوع می‌کند!',
            enFun: 'Venus spins backwards — there the Sun rises in the west!',
            arFun: 'الزهرة تدور عكسياً — تشرق الشمس فيها من الغرب!',
        },
        {
            emoji: '🌍', color: '#6fa8dc', orbit: 2,
            fa: 'زمین', en: 'Earth', ar: 'الأرض',
            faDesc: 'سیاره‌ی ما؛ تنها جایی که تاکنون حیات در آن یافت شده.',
            enDesc: 'Our home — the only place known to harbour life.',
            arDesc: 'كوكبنا — المكان الوحيد المعروف بوجود الحياة.',
            diam: '12,756 km', dist: '149.6M km', day: '24 hours', year: '365 days',
            moons: '1', temp: '15 °C',
            faFun: 'زمین تنها سیاره نیست که آبیست — اقیانوس‌هایش آن را «سیاره آبی» کرده‌اند.',
            enFun: '70% of Earth is covered by oceans — that is why it looks blue from space.',
            arFun: '70% من الأرض مغطاة بالمحيطات — لذلك تبدو زرقاء من الفضاء.',
        },
        {
            emoji: '♂', color: '#d1694e', orbit: 3,
            fa: 'مریخ', en: 'Mars', ar: 'المريخ',
            faDesc: 'سیاره سرخ؛ اکسید آهن سطحش را سرخ کرده. بلندترین آتشفشان منظومه اینجاست.',
            enDesc: 'The Red Planet — iron oxide rusts its surface red. Home to the tallest volcano in the solar system.',
            arDesc: 'الكوكب الأحمر — أكسيد الحديد يلوّنه بالأحمر، ويضم أعلى بركان في المجموعة الشمسية.',
            diam: '6,792 km', dist: '227.9M km', day: '24.6 hours', year: '687 days',
            moons: '2', temp: '-65 °C',
            faFun: 'آتشفشان المپوس مریخ حدود ۲۲ کیلومتر ارتفاع دارد — سه برابر اورست!',
            enFun: 'Olympus Mons on Mars is ~22 km tall — nearly three times Everest!',
            arFun: 'جبل أوليمبوس على المريخ يبلغ ~22 كم — ثلاثة أضعاف إفرست تقريباً!',
        },
        {
            emoji: '♃', color: '#d9a066', orbit: 4,
            fa: 'مشتری', en: 'Jupiter', ar: 'المشتري',
            faDesc: 'غول گازی؛ بزرگ‌ترین سیاره منظومه و لکه سرخ بزرگش طوفانی سده‌هاست.',
            enDesc: 'Gas giant and the largest planet; its Great Red Spot is a storm that has raged for centuries.',
            arDesc: 'عملاق غازي وأكبر الكواكب؛ بقعة الحمراء العظيمة عاصفة مستمرة منذ قرون.',
            diam: '142,984 km', dist: '778.5M km', day: '9.9 hours', year: '11.9 years',
            moons: '95', temp: '-110 °C',
            faFun: 'بیش از ۱۳۰۰ زمین داخل مشتری جا می‌شود!',
            enFun: 'More than 1,300 Earths could fit inside Jupiter!',
            arFun: 'يمكن أن يتسع أكثر من 1300 أرض داخل المشتري!',
        },
        {
            emoji: '♄', color: '#e3c77a', orbit: 5,
            fa: 'زحل', en: 'Saturn', ar: 'زحل',
            faDesc: 'سیاره حلقه‌دار؛ حلقه‌هایش از یخ و سنگ ساخته شده‌اند.',
            enDesc: 'The ringed planet — its magnificent rings are made of ice and rock.',
            arDesc: 'كوكب الحلقات — حلقاته الرائعة مصنوعة من الجليد والصخور.',
            diam: '120,536 km', dist: '1.43B km', day: '10.7 hours', year: '29.5 years',
            moons: '146', temp: '-140 °C',
            faFun: 'چگالی زحل آن‌قدر کم است که اگر اقیانوس به اندازه کافی بزرگ بود شناور می‌ماند!',
            enFun: 'Saturn is so light it would float on water (if an ocean big enough existed)!',
            arFun: 'زحل خفيف جداً لدرجة أنه سيطفو على الماء لو وُجد محيط كبير بما يكفي!',
        },
        {
            emoji: '♅', color: '#8fd1e0', orbit: 6,
            fa: 'اورانوس', en: 'Uranus', ar: 'أورانوس',
            faDesc: 'غول یخی که به پهلو می‌چرخد؛ محورش ۹۸ درجه کج شده است.',
            enDesc: 'An ice giant that rolls on its side — its axis is tilted 98°.',
            arDesc: 'عملاق جليدي يدور على جانبه — محوره مائل بمقدار 98 درجة.',
            diam: '51,118 km', dist: '2.87B km', day: '17.2 hours', year: '84 years',
            moons: '28', temp: '-195 °C',
            faFun: 'اورانوس با اینکه دور از خورشید است، سردترین جو را ندارد — نپتون!',
            enFun: 'Despite being farther from the Sun, Neptune has colder winds than Uranus.',
            arFun: 'رغم بُعد نبتون الأكبر، فإن رياحه أبرد من رياح أورانوس.',
        },
        {
            emoji: '♆', color: '#5a6bd8', orbit: 7,
            fa: 'نپتون', en: 'Neptune', ar: 'نبتون',
            faDesc: 'دورترین سیاره؛ بادهایش از سرعت صوت هم تندترند.',
            enDesc: 'The farthest planet — its winds are faster than the speed of sound.',
            arDesc: 'أبعد الكواكب — رياحه أسرع من سرعة الصوت.',
            diam: '49,528 km', dist: '4.5B km', day: '16.1 hours', year: '165 years',
            moons: '16', temp: '-200 °C',
            faFun: 'نپتون با محاسبه ریاضی کشف شد، پیش از آنکه با تلسکوپ دیده شود!',
            enFun: 'Neptune was discovered by mathematics before it was ever seen through a telescope!',
            arFun: 'اكتُشف نبتون بالرياضيات قبل أن يُرى بالتلسكوب!',
        },
    ];

    const App = {
        selected: 3, // Earth by default

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.elements = {
                planets: document.getElementById('planets'),
                detail: document.getElementById('detail'),
            };

            this.selected = Math.min(Math.max(parseInt(Store.get(NS, 'last', '3'), 10) || 3, 0), PLANETS.length - 1);

            this.renderChips();
            this.showDetail(this.selected, false);
            document.title = I18N.t('sol_title');

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('sol_title');
                this.renderChips();
                this.showDetail(this.selected, false);
            });
        },

        localPlanet(p) {
            return { name: p[I18N.current] || p.en, desc: p[I18N.current + 'Desc'] || p.enDesc, fun: p[I18N.current + 'Fun'] || p.enFun };
        },

        select(i) {
            this.selected = i;
            Store.set(NS, 'last', String(i));
            this.renderChips();
            this.showDetail(i, true);
        },

        renderChips() {
            this.elements.planets.innerHTML = PLANETS.map((p, i) => `
                <button type="button" class="planet-chip${i === this.selected ? ' active' : ''}" data-i="${i}" style="--pc:${p.color}">
                    <span class="pc-dot"></span>
                    <span class="pc-name">${this.localPlanet(p).name}</span>
                </button>
            `).join('');
            this.elements.planets.querySelectorAll('.planet-chip').forEach(chip => {
                chip.addEventListener('click', () => this.select(parseInt(chip.dataset.i)));
            });

            // Highlight the matching orbit
            document.querySelectorAll('.orbit').forEach(o => {
                o.classList.toggle('active', parseInt(o.dataset.orbit) === this.selected);
            });
        },

        showDetail(i, haptic) {
            const p = PLANETS[i];
            const lp = this.localPlanet(p);
            this.elements.detail.innerHTML = `
                <div class="d-head">
                    <span class="d-emoji">${p.emoji}</span>
                    <h3>${lp.name}</h3>
                </div>
                <p class="d-desc">${lp.desc}</p>
                <div class="fact-grid">
                    <div class="fact"><span class="f-label">${I18N.t('sol_diam')}</span><span class="f-value">${p.diam}</span></div>
                    <div class="fact"><span class="f-label">${I18N.t('sol_dist')}</span><span class="f-value">${p.dist}</span></div>
                    <div class="fact"><span class="f-label">${I18N.t('sol_day')}</span><span class="f-value">${p.day}</span></div>
                    <div class="fact"><span class="f-label">${I18N.t('sol_year')}</span><span class="f-value">${p.year}</span></div>
                    <div class="fact"><span class="f-label">${I18N.t('sol_moons')}</span><span class="f-value">${p.moons}</span></div>
                    <div class="fact"><span class="f-label">${I18N.t('sol_temp')}</span><span class="f-value">${p.temp}</span></div>
                </div>
                <div class="fact" style="margin-top:8px"><span class="f-label">${I18N.t('sol_fun')}</span><span class="f-value">${lp.fun}</span></div>
            `;
            this.elements.detail.classList.remove('hidden');
            if (haptic) TG.haptic('light');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();
