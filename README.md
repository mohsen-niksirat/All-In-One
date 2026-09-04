# 🧩 All-In-One — Telegram Mini Apps Hub

> **فارسی:** [مطالعه نسخه فارسی](README.fa.md)

A collection of **free, serverless Telegram Mini Apps** — one launcher page, many tools. Every app runs entirely in the browser: no backend, no database, **$0 hosting cost** on GitHub Pages.

## ✨ Features

- 🏠 **Launcher home** — all apps listed in one grid with search & filters
- 🌍 **Truly trilingual** — فارسی / English / العربية, switchable in one tap (choice is remembered)
- ☁️ **Cross-device sync** — data mirrors to Telegram CloudStorage when running inside Telegram (localStorage fallback elsewhere)
- 🧱 **Shared core layer** — `core/tg.js` (Telegram SDK), `core/store.js` (namespaced storage), `core/i18n.js` (translations), `core/ui.css` (theming)
- 📱 **Native Telegram feel** — dark/light theme from Telegram, haptic feedback, native back button
- 💾 **Data stays on device** — localStorage, nothing is sent to any server (except the APIs you opt into)

## 🚀 Ready Apps

| App | What it does |
|-----|--------------|
| 🤖 **AI Chat** | Streaming chat with Groq models (Llama 3.3, Gemma, Mixtral…) — free API key |
| 🍅 **Pomodoro Timer** | Focus timer with work/break modes, progress ring & session stats |
| 📐 **Unit Converter** | Length, weight, temperature, data, speed, time |
| 🔐 **Password Generator** | Strong random passwords with strength meter & history |
| 🎲 **Random Picker** | Pick a random winner from your list, with history |
| ✅ **Todo List** | Daily tasks with priorities, filters & completion tracking |
| ⏱️ **Stopwatch** | Precision timer with lap recording |
| ⚖️ **BMI Calculator** | Body mass index with category scale & history |
| 📈 **Habit Tracker** | Daily habits with streaks & a 7-day checklist grid |
| 💰 **Expense Tracker** | Log expenses, monthly total & category chart |
| 🔳 **QR Generator** | Offline QR codes (SVG + PNG download) |
| 🧩 **JSON Formatter** | Format, validate & minify JSON |
| 📄 **Markdown Preview** | Live markdown rendering + copy HTML |
| 🎨 **Color Picker** | HEX/RGB/HSL values, palettes & history |
| 🔖 **Bookmarks** | Save links with tags & search |
| 📝 **Notes** | Text notes with folders |
| 🛒 **Shopping List** | Checkable shared shopping list |
| 📔 **Journal** | Daily writing with mood tracking |
| 🎯 **Goal Tracker** | Set goals and track progress |
| 🌤️ **Weather** | 7-day forecast & city search — free API, no key needed |
| 📰 **News Reader** | Headlines & search via GNews — free key, set in-app |
| 🌐 **Translator** | Translate 20 languages — free service, no key needed |
| 💱 **Currency** | Live conversion for 160+ currencies incl. IRR |
| 🌍 **World Clock** | Live clocks for cities worldwide — fully offline |

…and **3 more apps on the roadmap** (wheel of actions, solar system, emoji poster) — see `apps/registry.js`.

## 🧱 Project Structure

```
├── index.html           ← Launcher home (lists all apps)
├── launcher.css/.js
├── core/                ← Shared layer used by every app
│   ├── tg.js            ← Telegram WebApp wrapper (theme, haptics, back button)
│   ├── store.js         ← Namespaced localStorage (tma:<app>:<key>)
│   ├── i18n.js          ← Multi-language engine (fa/en)
│   └── ui.css           ← Theme variables + shared components
└── apps/
    ├── registry.js      ← App metadata (single source of truth)
    ├── ai-chat/         ← 🤖 (index.html + style.css + app.js + chat.js + groq-api.js)
    ├── pomodoro/        ← 🍅 (index.html + style.css + app.js)
    ├── unit-converter/  ← 📐
    ├── password-generator/ ← 🔐
    ├── random-picker/   ← 🎲
    ├── todo-list/       ← ✅
    ├── stopwatch/       ← ⏱️
    ├── bmi-calculator/  ← ⚖️
    ├── habit-tracker/   ← 📈
    ├── expense-tracker/ ← 💰
    ├── qr-generator/    ← 🔳 (vendored qrcode.js, MIT)
    ├── json-formatter/  ← 🧩
    ├── markdown-preview/ ← 📄
    ├── color-picker/    ← 🎨
    ├── bookmark-manager/ ← 🔖
    ├── notes-app/       ← 📝
    ├── shopping-list/   ← 🛒
    ├── daily-journal/   ← 📔
    ├── goal-tracker/    ← 🎯
    ├── weather/         ← 🌤️ (Open-Meteo, no key)
    ├── news-reader/     ← 📰 (GNews, free key)
    ├── translator/      ← 🌐 (MyMemory, no key)
    ├── currency/        ← 💱 (open.er-api.com, no key)
    └── world-clock/     ← 🌍 (offline)
tests/
    ├── unit.test.js     ← core layer: Store, I18N, converter, password gen
    └── smoke.test.js    ← boots every page with a DOM shim, checks i18n coverage
```

## 🆕 How to Add a New App

1. Create `apps/<your-app>/` with its own `index.html` (+ `style.css`, `app.js` if needed).
2. Load the core layer in your page:
   ```html
   <link rel="stylesheet" href="../../core/ui.css">
   <script src="../../core/tg.js"></script>
   <script src="../../core/store.js"></script>
   <script src="../../core/i18n.js"></script>
   ```
3. Register translations, then initialize:
   ```js
   I18N.register('fa', { my_key: '…' });
   I18N.register('en', { my_key: '…' });
   TG.init({ backHref: '../../' });
   I18N.init();
   ```
4. Add an entry to `apps/registry.js` (`status: 'ready'` and `path: 'apps/<your-app>/'`). Done — it appears on the launcher.

> Tip: use `data-i18n` / `data-i18n-placeholder` / `data-i18n-title` attributes in HTML for static text, and `I18N.t('key')` in JS for dynamic text. Add a `<div data-lang-switcher class="lang-switcher"></div>` to any header to let users switch language.

## 🌍 Adding a Language

1. Add `{ fa: 'rtl', ar: 'rtl', … }` to `dirs` in `core/i18n.js`.
2. Register a new dict for every existing key — `I18N.register('ar', { … })`.
3. Add the native name to `nativeNames` in `core/i18n.js`.
4. Add the localized name/description to every entry in `apps/registry.js`.

## 🧪 Testing

No dependencies — plain Node:

```bash
node --test tests/unit.test.js tests/smoke.test.js
```

- `unit.test.js` — Store namespacing, legacy-key migration, CloudStorage mirroring, I18N fallback chain & direction handling, unit-converter math, password entropy/strength.
- `smoke.test.js` — boots **every page** (launcher + all apps) with a DOM shim, asserts nothing throws, all three dictionaries register, every `data-i18n`/`I18N.t()` key exists in fa/en/ar, and the registry is consistent (unique ids, ready apps have folders, tag translations). Static audits ban the `parentElement.querySelector*` dead-controls pattern and verify every `getElementById` target exists in its page's HTML/JS.

## 🚀 Deploy to GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Source: `main` branch** → Save.
3. Your hub is live at `https://<username>.github.io/All-In-One/`.

### Connect to a Telegram bot

1. Talk to [@BotFather](https://t.me/BotFather) → `/newbot` → get the token.
2. `/newapp` → pick the bot → set the **Web App URL** to your Pages URL.
3. Open the bot → menu button → your hub opens inside Telegram (theme + haptics + back button just work).

### AI Chat setup (optional)

The AI Chat app needs a free Groq API key: [console.groq.com/keys](https://console.groq.com/keys). Open the app → ⚙️ Settings → paste the `gsk_…` key. It is stored only on your device.

## 📄 License

MIT — free to use, modify and share.