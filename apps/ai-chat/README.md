# 🤖 AI Chat

چت با هوش مصنوعی (Groq) — سرورلس، رایگان، چند زبانه (فارسی / English).

Chat with AI (Groq) — serverless, free, bilingual (English / فارسی).

## تنظیم API Key / API Key Setup

1. Get a free key: [console.groq.com/keys](https://console.groq.com/keys)
2. Open the app → ⚙️ Settings → paste the `gsk_...` key → Save

The key is stored only in your device's local storage — it is never sent anywhere except Groq's API.

کلید فقط در حافظه محلی دستگاه شما ذخیره می‌شود و جایی جز API گروک ارسال نمی‌شود.

## ساختار / Structure

- `index.html` — UI + Telegram SDK
- `style.css` — chat-specific styles (theme lives in `../../core/ui.css`)
- `app.js` — controller + translations
- `chat.js` — message manager
- `groq-api.js` — Groq streaming client (SSE)

Uses the shared core layer: `../../core/tg.js`, `../../core/store.js`, `../../core/i18n.js`.