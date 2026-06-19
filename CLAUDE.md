# 🖥️ Prompt Iterator — Desktop App (Tauri)

## نبذة عن المشروع
تحويل مستودع `3ssiri/interactive-prompt-iterator` من تطبيق Next.js يعمل على المتصفح
إلى تطبيق سطح مكتب Native قابل للتوزيع (Windows / macOS / Linux).

**المستودع الأصلي:** https://github.com/3ssiri/interactive-prompt-iterator  
**الرخصة:** MIT — التعديل والتوزيع مسموحان بالكامل  
**آخر تحديث للأصل:** 29 يناير 2026 (مبني بـ Claude Sonnet 4.5)

---

## التقنيات الموجودة في المشروع (لا تغيّرها)

| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| Next.js | 14.2.16 | إطار الواجهة الأمامي |
| React | 18.3.1 | مكتبة UI |
| TypeScript | ^5 | لغة البرمجة |
| Tailwind CSS | ^3.4.16 | التنسيق |
| shadcn/ui (Radix) | متعددة | مكونات UI |
| Zustand | ^5.0.10 | إدارة الحالة |
| Dexie | ^4.2.1 | قاعدة بيانات IndexedDB محلية |
| next-intl | ^3.26.5 | i18n (عربي/إنجليزي/صيني) |
| next-themes | ^0.4.6 | الوضع الليلي/النهاري |
| framer-motion | ^12.26.2 | الحركة والانتقالات |
| Vercel AI SDK | ^6.0.33 | streaming للردود |
| pdfjs-dist | ^5.4.530 | قراءة ملفات PDF |
| mammoth | ^1.11.0 | قراءة ملفات Word |

**ما ستضيفه أنت:**
- `@tauri-apps/cli` + `@tauri-apps/api` — إطار سطح المكتب
- `keyring` (Rust crate) — حفظ المفاتيح في OS Keychain
- `reqwest` (Rust crate) — اختبار الاتصال من Rust

---

## بنية المشروع بعد التحويل

```
interactive-prompt-iterator/
├── src/                              ← Next.js (الأصلي - لا تعدّل)
│   ├── app/
│   │   ├── [locale]/                 ← صفحات next-intl
│   │   ├── api/                      ← ⚠️ API routes — تحتاج معالجة خاصة
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── i18n/
│   ├── lib/
│   ├── tools/
│   └── middleware.ts
├── next.config.mjs                   ← ستعدّله لإضافة output: 'export'
├── package.json                      ← ستضيف إليه Tauri
├── CLAUDE.md                         ← هذا الملف
│
└── src-tauri/                        ← ✅ جديد — تُنشئه بالكامل
    ├── Cargo.toml
    ├── build.rs
    ├── tauri.conf.json
    ├── capabilities/
    │   └── default.json
    └── src/
        ├── main.rs
        └── lib.rs
```

---

## ⚠️ تحديات التحويل (مهم جداً — اقرأ قبل البدء)

### التحدي الأول: API Routes
المشروع يحتوي على `src/app/api/` — هذه server-side لا تعمل مع `output: 'export'`.
**الحل:** انقل منطق API إلى Tauri commands في Rust، أو احتفظ بـ development server.

### التحدي الثاني: next-intl مع Static Export
`next-intl` يحتاج تعديلاً خاصاً مع `output: 'export'`.
**الحل:** أضف `localeDetection: false` و `trailingSlash: true` في `next.config.mjs`.

### التحدي الثالث: PDF Worker
المشروع ينسخ `pdf.worker.min.mjs` إلى `public/` — يجب أن يشتغل مع Tauri.
**الحل:** تأكد من وجود `public/` في إعدادات `distDir` في `tauri.conf.json`.

### التحدي الرابع: Dexie (IndexedDB)
يعمل بشكل طبيعي في Tauri — لا حاجة لتعديل.

---

## المطالبة الكاملة — جلسة بجلسة

---

### 📌 الجلسة الصفر: التحقق والفهم (ابدأ بها دائماً)

```
أنت مهندس برمجيات خبير في Tauri v2 وNext.js وRust.

افحص هذا المشروع وأخبرني:
1. ما هي ملفات src/app/api/ الموجودة؟ (أحتاج قائمتها الكاملة)
2. ما هي ملفات src/i18n/ الموجودة؟
3. هل يوجد أي استخدام لـ process.env متغيرات في src/؟

لا تعدّل أي شيء الآن — فقط افحص وأخبرني.
```

---

### 📌 الجلسة الأولى: تعديل next.config.mjs

```
أنت مهندس خبير في Tauri v2 وNext.js 14.

المطلوب: تعديل next.config.mjs لدعم Static Export مع الحفاظ على next-intl.

الملف الحالي:
---
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
};
export default withNextIntl(nextConfig);
---

المطلوب إضافته:
- output: 'export'          <- لتوليد ملفات HTML ثابتة يقرأها Tauri
- trailingSlash: true       <- مطلوب مع next-intl static
- images: { unoptimized: true }  <- Next Image لا يعمل مع static export

تنبيهات:
- احتفظ بإعداد next-intl كما هو
- احتفظ بإعداد webpack watchOptions
- أضف تعليقاً عربياً يشرح كل إضافة

أعطني الملف الكامل المعدّل فقط.
```

---

### 📌 الجلسة الثانية: إنشاء src-tauri/Cargo.toml

```
أنت مهندس Rust خبير في Tauri v2.

أنشئ src-tauri/Cargo.toml لمشروع "Prompt Iterator Desktop".

المتطلبات:
- tauri v2 مع features: ["protocol-asset", "devtools"]
- keyring = "2" لحفظ API Keys في OS Keychain بأمان
- reqwest مع features: ["json", "rustls-tls"] لاختبار الاتصال
- serde مع features: ["derive"]
- serde_json
- tokio مع features: ["full"]

معلومات المشروع:
- name: "prompt-iterator"
- version: "0.1.0"
- edition: "2021"

أعطني الملف الكامل فقط.
```

---

### 📌 الجلسة الثالثة: إنشاء src-tauri/src/lib.rs

```
أنت مهندس Rust خبير في Tauri v2 وkeyring crate.

أنشئ src-tauri/src/lib.rs الذي يحتوي على:

الثوابت:
- SERVICE_NAME = "prompt-iterator-desktop"

Tauri Commands المطلوبة (5 دوال):

1. save_api_key(provider: String, api_key: String) -> Result<(), String>
   - يحفظ المفتاح في OS Keychain
   - Windows: Credential Manager | macOS: Keychain | Linux: Secret Service

2. get_api_key(provider: String) -> Result<String, String>
   - يجلب المفتاح المحفوظ
   - يعيد خطأ مفهوم إذا لم يوجد

3. delete_api_key(provider: String) -> Result<(), String>
   - يحذف المفتاح من النظام

4. has_api_key(provider: String) -> Result<bool, String>
   - يتحقق هل يوجد مفتاح محفوظ

5. test_api_connection(base_url: String, api_key: String) -> Result<bool, String>
   - يرسل GET إلى {base_url}/models
   - Authorization: Bearer {api_key}
   - يعيد true إذا status 200-299 | timeout: 10ث
   - async مع tokio

دالة run() تسجّل الـ 5 commands وتشغّل التطبيق.
دالة main() تستدعي run().
أضف تعليقات عربية مختصرة على كل دالة.
أعطني الملف الكامل فقط.
```

---

### 📌 الجلسة الرابعة: إنشاء src-tauri/tauri.conf.json

```
أنت مهندس خبير في Tauri v2 configuration.

أنشئ src-tauri/tauri.conf.json لمشروع "Prompt Iterator Desktop".

المعلومات:
- productName: "Prompt Iterator"
- identifier: "com.assiri.prompt-iterator"
- version: "0.1.0"
- الواجهة تُولّد في مجلد: "out"
- devUrl: "http://localhost:3000"

المتطلبات:
- build.frontendDist: "../out"
- build.devUrl: "http://localhost:3000"
- build.beforeDevCommand: "npm run dev"
- build.beforeBuildCommand: "npm run build"
- نافذة البداية: 1200x800
- minWidth: 800, minHeight: 600
- title: "Prompt Iterator"
- bundle: active:true, targets:"all"
- icon: ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"]

أعطني الملف الكامل فقط.
```

---

### 📌 الجلسة الخامسة: إنشاء src-tauri/capabilities/default.json

```
أنت مهندس خبير في Tauri v2 capabilities وpermissions.

أنشئ src-tauri/capabilities/default.json.

المطلوب السماح بـ:
- استدعاء commands:
  save_api_key, get_api_key, delete_api_key, has_api_key, test_api_connection
- الوصول للشبكة (HTTP requests للـ AI providers)
- dialog للإشعارات
- clipboard للنسخ
target: "main-window"

أعطني الملف الكامل فقط.
```

---

### 📌 الجلسة السادسة: إضافة Tauri SDK للواجهة

```
أنت مهندس TypeScript خبير في Tauri v2 API.

أنشئ ملف جديد: src/lib/tauri-bridge.ts

هذا الملف هو الجسر بين React وTauri commands.

المطلوب:
- استيراد { invoke } من "@tauri-apps/api/core"
- كل دالة تتحقق هل التطبيق يشتغل داخل Tauri
  (typeof window.__TAURI__ !== 'undefined')
- إذا لا: تستخدم localStorage كـ fallback

الدوال:
1. saveApiKey(provider: string, apiKey: string): Promise<void>
2. getApiKey(provider: string): Promise<string>
3. deleteApiKey(provider: string): Promise<void>
4. hasApiKey(provider: string): Promise<boolean>
5. testApiConnection(baseUrl: string, apiKey: string): Promise<boolean>
6. isTauriApp(): boolean

أضف JSDoc عربي مختصر لكل دالة.
أعطني الملف الكامل فقط.
```

---

### 📌 الجلسة السابعة: GitHub Actions للبناء التلقائي

```
أنت مهندس DevOps خبير في GitHub Actions وTauri v2.

أنشئ .github/workflows/build-desktop.yml

المتطلبات:
- يُشغَّل عند push لـ tag v* (e.g. v1.0.0)
- يمكن تشغيله يدوياً (workflow_dispatch)
- يبني على 3 أنظمة في آن واحد:
  * windows-latest
  * macos-latest
  * ubuntu-22.04

لكل نظام:
- setup Node.js 20 مع cache: 'npm'
- install Rust stable
- Rust cache (swatinem/rust-cache@v2)
- Ubuntu فقط: تثبيت:
  libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev
  libayatana-appindicator3-dev librsvg2-dev libsecret-1-dev pkg-config
- npm install
- tauri-apps/tauri-action@v0

Release body بالعربية: ملف كل نظام + خطوات أول تشغيل + المزودون المدعومون.
GITHUB_TOKEN من secrets.
أعطني الملف الكامل فقط.
```

---

## أوامر التشغيل الكاملة

### الإعداد الأول (مرة واحدة)

```bash
# 1. Clone
git clone https://github.com/3ssiri/interactive-prompt-iterator
cd interactive-prompt-iterator

# 2. تثبيت Tauri
npm install --save-dev @tauri-apps/cli@next
npm install @tauri-apps/api@next

# 3. إنشاء src-tauri
npx tauri init
# App name: Prompt Iterator
# Window title: Prompt Iterator
# Frontend dist: ../out
# Dev server URL: http://localhost:3000
# Dev command: npm run dev
# Build command: npm run build

# 4. إنشاء capabilities
mkdir -p src-tauri/capabilities

# 5. نسخ الأيقونة
mkdir -p src-tauri/icons
cp icon.png src-tauri/icons/

# 6. تثبيت Rust dependencies
cd src-tauri && cargo fetch && cd ..

# 7. أول تشغيل
npm run tauri dev
```

### تشغيل يومي

```bash
npm run tauri dev      # مع نافذة Tauri
npm run dev            # واجهة فقط في المتصفح
```

### بناء للإنتاج

```bash
npm run tauri build
# Windows: src-tauri/target/release/bundle/msi/
# macOS:   src-tauri/target/release/bundle/dmg/
# Linux:   src-tauri/target/release/bundle/appimage/
```

### إطلاق نسخة جديدة

```bash
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions سيبني تلقائياً
```

---

## جدول حل المشاكل الشائعة

| المشكلة | السبب | الحل |
|---------|-------|------|
| `output: 'export'` لا يعمل مع API routes | API routes تحتاج server | احذف ملفات `src/app/api/` أو انقلها ل Rust |
| خطأ next-intl عند البناء | يحتاج `localeDetection: false` | أضفه في `next.config.mjs` |
| PDF Worker لا يعمل | مسار مختلف في Tauri | تأكد `public/` في إعدادات Tauri |
| مفتاح API لا يُحفظ Linux | غياب libsecret | `sudo apt install libsecret-1-dev` |
| البناء يفشل Ubuntu | مكتبات WebKit ناقصة | راجع قائمة المكتبات في الجلسة السابعة |
| الواجهة بيضاء | `distDir` خاطئ | `frontendDist: "../out"` في `tauri.conf.json` |

---

## خارطة التطوير

### v1.0 — MVP
- [ ] تحويل Next.js → Tauri v2
- [ ] حفظ API Keys في OS Keychain
- [ ] بناء تلقائي Windows/macOS/Linux

### v1.1
- [ ] System tray icon
- [ ] اختصارات Native (Cmd+K / Ctrl+K)
- [ ] تحديث تلقائي

### v2.0
- [ ] تشغيل نماذج محلية (Ollama)
- [ ] مزامنة iCloud / Google Drive
- [ ] إضافة مزودين جدد

---

## ملاحظات لـ Claude Code

1. **لا تعدّل** `src/` إلا لإصلاح توافق Static Export
2. **احتفظ** بجميع الاعتماديات — لا تحذف أياً منها
3. **اختبر** كل جلسة بـ `npm run build` ثم `npm run tauri build`
4. **منطق Rust:** `src-tauri/src/lib.rs`
5. **جسر React-Rust:** `src/lib/tauri-bridge.ts`
6. **عند وجود خطأ:** اقرأ الخطأ كاملاً قبل الإصلاح
