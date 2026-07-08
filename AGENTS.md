# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## نظرة عامة

**مُحسِّن الموجّهات (Prompt Iterator / Muharrir)** — تطبيق Next.js 14 + Tauri v2 يساعد المستخدم على تحويل فكرة غامضة إلى موجّه (Prompt) منظّم عبر حوار تفاعلي. ثنائي اللغة (عربي RTL / إنجليزي)، محلي أولاً (Local-First)، ويعمل كتطبيق ويب أو كتطبيق سطح مكتب من نفس الكود.

> **التحويل من Next.js إلى Tauri مكتمل** (مع system tray واختصار عام Ctrl+Shift+K وتحديث تلقائي). أي توثيق يصف التحويل كعمل مستقبلي قديمٌ — انظر git history.

## الأوامر

```bash
npm run dev          # خادم تطوير الويب على :3000 (ينسخ pdf worker أولاً)
npm run build        # تصدير ثابت إلى out/ (ينسخ pdf worker أولاً)
npm run lint         # ESLint
npm run tauri dev    # نافذة سطح المكتب (Tauri) — تشغّل npm run dev داخليًا
npm run tauri build  # حزم سطح المكتب (msi/exe/dmg/AppImage/deb/rpm)
```

**الاختبارات:**
```bash
# وحدات (Vitest) — منطق نقي بلا متصفّح، سريع، لا يحتاج خادمًا
npm run test:unit                                   # كل اختبارات الوحدة في src/lib/__tests__/

# واجهة (Playwright) — تتطلّب خادم dev قيد التشغيل
npm test                                            # كل اختبارات الواجهة
npx playwright test tests/ui-optimization.spec.js   # ملف واحد
npx playwright test -g "اسم الاختبار"               # اختبار واحد بالاسم
npm run test:ui                                     # واجهة Playwright التفاعلية
```
⚠️ `webServer` معطّل في [playwright.config.js](playwright.config.js) — يجب أن يكون `npm run dev` قيد التشغيل على `:3000` قبل اختبارات Playwright. اختبارات Vitest (في [src/lib/__tests__/](src/lib/__tests__/)) لا تحتاج ذلك.

**الإصدار:** ادفع تاجًا `v*` (مثل `v1.0.0`) لتشغيل [build-desktop.yml](.github/workflows/build-desktop.yml) الذي يبني للأنظمة الثلاثة. يتطلب أسرار التوقيع `TAURI_SIGNING_PRIVATE_KEY` و`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

## البنية المعمارية (الصورة الكبيرة)

### 1) تطبيق بزمنَي تشغيل من كود واحد
نفس واجهة Next.js تعمل في وضعين: **متصفّح** (`npm run dev`) و**سطح مكتب Tauri** (`npm run tauri dev`). Next.js مضبوط على `output: 'export'` ([next.config.mjs](next.config.mjs)) فيُولَّد HTML ثابت في `out/`، وهو ما يحمّله Tauri عبر `frontendDist: "../out"`.

### 2) لا خادم — المنطق كله جانب العميل
بسبب التصدير الثابت **لا يوجد `src/app/api/` ولا `src/middleware.ts`**. كل ما كان منطق خادم نُقل إلى المتصفح:
- **[src/lib/chat-client.ts](src/lib/chat-client.ts)** — بديل `/api/chat`. ينادي `{baseUrl}/chat/completions` مباشرةً بـ `stream: true`، ثم يعيد بثّ الرد ببروتوكول Vercel AI SDK (انظر بند 3). يعرّف الأدوات الثلاث والـ system prompt الافتراضي.
- **[src/lib/file-parser-client.ts](src/lib/file-parser-client.ts)** — بديل `/api/parse-file`. يحلّل PDF (pdfjs-dist) وDOCX (mammoth) داخل المتصفح.

### 3) تدفّق محسِّن الموجّهات (الأدوات + بروتوكول البثّ)
التطبيق ليس محادثة عامة — الـ system prompt يجبر النموذج على **استدعاء أدوات** بدل الإجابة نصيًّا:
- `suggest_enhancements` → جدول خيارات متعدّد الأبعاد ([enhancement-form.tsx](src/components/enhancement-form.tsx)).
- `propose_prompt` → بطاقة الموجّه المنظّم النهائي ([prompt-proposal-card.tsx](src/components/prompt-proposal-card.tsx)).
- `ask_questions` → نموذج أسئلة توضيحية ([question-form.tsx](src/components/question-form.tsx)).

**بروتوكول البثّ المخصّص** يُنتَج في `chat-client.ts`:
`0:"نص"` نصّ • `9:{toolCallId,toolName,args}` استدعاء أداة • `a:{...}` نتيجة أداة • `e:{...}` خطأ/حالة تصحيح.

**استهلاك البثّ مُستخرَج في [src/lib/chat-stream.ts](src/lib/chat-stream.ts):** يحلّل `consumeChatStream` بروتوكول البثّ ويستدعي ردود نداء (نصّ/أداة/خطأ)، و`classifyChatError` يصنّف الأخطاء (`auth`/`quota`/`network`/`server`/`unknown`). كما يُصدِّر **الأنواع المرجعية** `UiMessage` و`ToolInvocation` المستخدمة في كامل مسار الرسائل — استخدمها بدل `any` عند لمس الرسائل. المكوّن الرئيسي [src/app/[locale]/page.tsx](src/app/[locale]/page.tsx) يفوّض إليه بدل تضمين منطق التحليل، وكلّ رسالة تُصيَّر عبر [message-item.tsx](src/components/message-item.tsx) المُذكّر (`memo`) بحيث لا يُعاد تصيير سوى الرسالة النشطة أثناء البثّ.

**حلقة التصحيح:** تُتحقَّق وسائط الأدوات بـ Zod في [src/lib/format-validator.ts](src/lib/format-validator.ts)؛ عند الفشل يُستدعى نموذج تصحيح (مثبَّت على `grok-beta-fast`) حتى 3 مرات لإصلاح صيغة JSON دون تغيير المعنى. تغطّي اختبارات Vitest هذا المنطق ومنطق `chat-stream`/`token-estimate`/`text-diff`.

### 4) الحالة والتخزين المحلي + أمان مفتاح API
- **[src/lib/store.ts](src/lib/store.ts)** — متجر Zustand للإعدادات (مفتاح API، baseUrl، النموذج، system prompt، نماذج التصحيح، إعادة المحاولة) محفوظ في localStorage باسم `prompt-iterator-storage`.
- **[src/lib/db.ts](src/lib/db.ts)** — Dexie/IndexedDB (`PromptIteratorDB`) للمحادثات والرسائل والموجّهات المفضّلة.
- **أمان المفتاح:** داخل Tauri لا يُخزَّن مفتاح API في localStorage إطلاقًا — `partialize` في المتجر يستبعده، ويُحفَظ بدلًا منه في OS Keychain عبر Rust، ويُحمَّل عند الإقلاع بـ `hydrateApiKey()`. في المتصفح يعود إلى localStorage.

### 5) جسر React ↔ Rust — النمط الأساسي
**[src/lib/tauri-bridge.ts](src/lib/tauri-bridge.ts)**: كل دالة تفحص `isTauriApp()` (`'__TAURI_INTERNALS__' in window`) ثم إمّا `invoke()` لأمر Rust أو بديل متصفّح (localStorage / fetch). **أي كود يلمس واجهات Tauri يجب أن يعمل في الوضعين** — احمِه دائمًا بهذا الفحص.

### 6) جانب Rust ([src-tauri/src/lib.rs](src-tauri/src/lib.rs))
خمسة أوامر: `save/get/delete/has_api_key` (عبر `keyring`) و`test_api_connection` (عبر `reqwest` — يُنفَّذ في Rust **لتجاوز CORS**). إضافةً إلى: أيقونة شريط النظام (إظهار/إخفاء/خروج، والنقر الأيسر يبدّل النافذة)، اختصار عام `Ctrl+Shift+K`، تحديث تلقائي موقَّع، وإغلاق-إلى-الدرج (زر X يُخفي بدل الإنهاء). `main.rs` يستدعي `run()` فقط.

### 7) i18n والتصدير الثابت
next-intl باللغتين `['ar','en']`، الافتراضية `ar`، `localePrefix: 'as-needed'` ([routing.ts](src/i18n/routing.ts)). الصفحات تحت `src/app/[locale]/`. التصدير الثابت يفرض `generateStaticParams` + `unstable_setRequestLocale` في [layout.tsx](src/app/[locale]/layout.tsx)، وفيه يُضبط اتجاه RTL والخطّ (Cairo للعربية). الجذر [src/app/page.tsx](src/app/page.tsx) يعيد التوجيه حسب اللغة المحفوظة/المتصفّح/الافتراضية.

**كل النصوص الظاهرة موطّنة** في [src/i18n/locales/ar.json](src/i18n/locales/ar.json) و[en.json](src/i18n/locales/en.json) عبر مساحات أسماء (`common`, `a11y`, `toasts`, `chat`, `settings`, `promptProposal`, `enhancementForm`, `fileUpload`, …). لا تُضِف نصًّا عربيًّا ثابتًا في JSX/الإشعارات/التلميحات — أضِف مفتاحًا للّغتين واستعمل `t('namespace.key')`. الاستثناءات المقصودة الوحيدة: اسم المؤلّف وحقوق النشر، والنصوص الموجَّهة للنموذج (الـ system prompt وفواصل التنسيق الداخلية).

### 8) وحدات مساعدة وميزات واجهة إضافية
- **منطق مساعد في `src/lib/`:** [providers.ts](src/lib/providers.ts) كتالوج المزوّدين المتوافقين مع OpenAI + دوال البحث/الإضافة اليدوية • [preset-modes.ts](src/lib/preset-modes.ts) أنماط جاهزة لبدء الموجّهات • [token-estimate.ts](src/lib/token-estimate.ts) تقدير عدد الرموز • [text-diff.ts](src/lib/text-diff.ts) فرق نصّي لمقارنة الموجّهات • [decorator-engine.ts](src/lib/decorator-engine.ts) • [export-utils.ts](src/lib/export-utils.ts)/[import-utils.ts](src/lib/import-utils.ts) تصدير/استيراد الإعدادات والمفضّلة • [logger.ts](src/lib/logger.ts) تسجيل موحّد (استعمل `log.*` بدل `console.*`).
- **مكوّنات واجهة بارزة:** معرض الأنماط ([preset-gallery.tsx](src/components/preset-gallery.tsx)) • مقارنة الموجّهات ([compare-dialog.tsx](src/components/compare-dialog.tsx)) • بحث Spotlight (`Ctrl+K`، [spotlight-search.tsx](src/components/spotlight-search.tsx)) • شارة الإصدار/التحديث ([version-badge.tsx](src/components/version-badge.tsx)) • مبدّل اللغة ودليل الاختصارات. التطبيق قابل للتثبيت كـ **PWA** (`manifest.webmanifest` + `theme color` في [layout.tsx](src/app/[locale]/layout.tsx)) — لا يوجد service worker بعد، فلا دعم للعمل دون اتصال. مع عناية بإمكانية الوصول (`aria-*`/`a11y`).

## قيود وأخطاء شائعة (مهم)

| القيد | التفصيل |
|---|---|
| نسخ PDF worker | سكربتا `dev`/`build` يشغّلان `copy-pdf-worker` أولًا (ينسخ `pdf.worker.min.mjs` إلى `public/`). إن شغّلت `next` مباشرةً سينكسر تحليل PDF. |
| التصدير الثابت | ممنوع: API routes، middleware، أي عمل ديناميكي في الخادم. مفعَّل: `images: { unoptimized: true }` و`trailingSlash: true`. |
| ازدواجية المتصفّح/Tauri | لا تفترض وجود واجهات Tauri — احمِها بـ `isTauriApp()` ووفّر بديل متصفّح. |
| CORS | النداء المباشر للمزوّد يعمل في Tauri لكنه قد يفشل في متصفّح عادي؛ لذا `test_api_connection` يُنفَّذ في Rust. |
| بناء Linux | يتطلب `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `libsecret-1-dev`, `libssl-dev`, `pkg-config` (مثبَّتة في [ci.yml](.github/workflows/ci.yml)). |
| `tauri build` محليًّا | ينتهي بـ `Error: ...no private key` عند خطوة توقيع التحديث التلقائي، لأن `createUpdaterArtifacts: true` + `pubkey` يتطلّبان `TAURI_SIGNING_PRIVATE_KEY` (سرّ CI). **هذا ليس فشل بناء**: المثبّتات (`.msi`/`.exe`) تُنتَج قبل التوقيع وتكون صالحة. للنشر الموقَّع (مع `.sig` للتحديث) استخدم دفع تاج `v*` عبر Actions. |
| المزوّدون | أي واجهة متوافقة مع OpenAI. الافتراضي في المتجر DeepSeek (`https://api.deepseek.com`)؛ المفتاح `'demo'` يفعّل وضعًا تجريبيًا بلا نداء فعلي. |
| الاعتماديات | لا تحذف أيًّا من اعتماديات `package.json`؛ القائمة مقصودة. |
