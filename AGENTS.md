# AGENTS.md

This file provides guidance to AI coding agents (Codex, Claude Code, Kimi, …) when working with code in this repository. It assumes you know nothing about the project.

## نظرة عامة

**Muharrir / مُحسِّن الموجّهات** — تطبيق Next.js 16 + Tauri v2 يساعد المستخدم على تحويل فكرة غامضة (أو مستند مرفوع) إلى موجّه (Prompt) منظّم عبر حوار تفاعلي موجَّه. ثنائي اللغة (عربي RTL / إنجليزي)، محلي أولاً (Local-First — لا خادم خاص بالتطبيق إطلاقًا)، ويعمل كتطبيق ويب أو كتطبيق سطح مكتب من نفس الكود.

- **الحزمة:** `muharrir`، الإصدار `0.3.0`، رخصة MIT، المستودع `github.com/3ssiri/muharrir`.
- **حالة المشروع:** بيتا مبكّرة مُعدّة للمصدر المفتوح — انظر [docs/oss-grant-readiness/](docs/oss-grant-readiness/) و[GOVERNANCE.md](GOVERNANCE.md) و[PRIVACY.md](PRIVACY.md) و[SECURITY.md](SECURITY.md).
- **التحويل من Next.js إلى Tauri مكتمل** (مع system tray واختصار عام Ctrl+Shift+K وتحديث تلقائي موقَّع). أي توثيق يصف التحويل كعمل مستقبلي قديمٌ — انظر git history.

## الأوامر

```bash
npm run dev          # خادم تطوير الويب على :3000 (ينسخ pdf worker أولاً)
npm run build        # تصدير ثابت إلى out/ (ينسخ pdf worker أولاً)
npm run lint         # ESLint 9 (eslint-config-next/core-web-vitals)
npm run typecheck    # tsc --noEmit
npm run tauri dev    # نافذة سطح المكتب (Tauri) — تشغّل npm run dev داخليًا
npm run tauri build  # حزم سطح المكتب (msi/exe/dmg/AppImage/deb/rpm)
```

**الاختبارات:**
```bash
# وحدات (Vitest) — منطق نقي بلا متصفّح، سريع، لا يحتاج خادمًا
npm run test:unit                                   # كل اختبارات الوحدة في src/lib/__tests__/

# واجهة (Playwright) — يبدأ Playwright خادم dev تلقائيًّا على المنفذ 9173
npm test                                            # كل اختبارات الواجهة
npx playwright test tests/ui-optimization.spec.js   # ملف واحد
npx playwright test -g "اسم الاختبار"               # اختبار واحد بالاسم
npm run test:ui                                     # واجهة Playwright التفاعلية
```
⚠️ `webServer` مفعّل في [playwright.config.js](playwright.config.js) — يبدأ Playwright خادم dev تلقائيًّا على المنفذ المخصص `:9173` (منفذ غير شائع لتجنّب التعارض مع تطبيقات محلية أخرى تحتجز 3000/3001؛ قابل للتغيير عبر `PLAYWRIGHT_PORT`) ويعيد استعماله محليًّا. لا حاجة لتشغيل `npm run dev` يدويًّا قبل اختبارات Playwright. لتوجيه الاختبارات إلى خادم قائم، اضبط `PLAYWRIGHT_BASE_URL` (مثلًا `http://localhost:3002`) وعندئذٍ يُلغى بدء الخادم التلقائي. خادم الفحص يُسخَّن على `/ar/` بدل الجذر لتفادي سباق الترجمة الباردة. اختبارات Vitest (في [src/lib/__tests__/](src/lib/__tests__/)، مضبوطة في [vitest.config.ts](vitest.config.ts) ببيئة `node`) لا تحتاج خادمًا.

**الإصدار:** ادفع تاجًا `v*` (مثل `v1.0.0`) لتشغيل [build-desktop.yml](.github/workflows/build-desktop.yml) الذي يبني للأنظمة الثلاثة (Windows MSI/EXE، macOS universal، Linux AppImage/deb/rpm). يتطلب أسرار التوقيع `TAURI_SIGNING_PRIVATE_KEY` و`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`، ويتخطّى التاجات التي تحتوي `-` (البيتا/الـ prerelease) إلا عند التشغيل اليدوي.

## البنية المعمارية (الصورة الكبيرة)

### 1) تطبيق بزمنَي تشغيل من كود واحد
نفس واجهة Next.js تعمل في وضعين: **متصفّح** (`npm run dev`) و**سطح مكتب Tauri** (`npm run tauri dev`). Next.js مضبوط على `output: 'export'` ([next.config.mjs](next.config.mjs)) فيُولَّد HTML ثابت في `out/`، وهو ما يحمّله Tauri عبر `frontendDist: "../out"` في [tauri.conf.json](src-tauri/tauri.conf.json).

### 2) لا خادم — المنطق كله جانب العميل
بسبب التصدير الثابت **لا يوجد `src/app/api/` ولا `src/middleware.ts`**. كل ما كان منطق خادم نُقل إلى المتصفح:
- **[src/lib/chat-client.ts](src/lib/chat-client.ts)** — بديل `/api/chat`. ينادي `{baseUrl}/chat/completions` مباشرةً بـ `stream: true`، ثم يعيد بثّ الرد ببروتوكول Vercel AI SDK (انظر بند 3). يعرّف الأدوات الثلاث والـ system prompt الافتراضي.
- **[src/lib/file-parser-client.ts](src/lib/file-parser-client.ts)** — بديل `/api/parse-file`. يحلّل PDF (pdfjs-dist) وDOCX (mammoth) وTXT داخل المتصفح.

### 3) تدفّق محسِّن الموجّهات (الأدوات + بروتوكول البثّ)
التطبيق ليس محادثة عامة — الـ system prompt يجبر النموذج على **استدعاء أدوات** بدل الإجابة نصيًّا:
- `suggest_enhancements` → جدول خيارات متعدّد الأبعاد ([enhancement-form.tsx](src/components/enhancement-form.tsx)).
- `propose_prompt` → بطاقة الموجّه المنظّم النهائي ([prompt-proposal-card.tsx](src/components/prompt-proposal-card.tsx)).
- `ask_questions` → نموذج أسئلة توضيحية ([question-form.tsx](src/components/question-form.tsx)) — تُستدعى أولًا عندما يكون الطلب غامضًا جدًّا (ثلاثة أسئلة كحدّ أقصى).

**بروتوكول البثّ المخصّص** يُنتَج في `chat-client.ts`:
`0:"نص"` نصّ • `9:{toolCallId,toolName,args}` استدعاء أداة • `a:{...}` نتيجة أداة • `e:{...}` خطأ/حالة تصحيح.

**استهلاك البثّ مُستخرَج في [src/lib/chat-stream.ts](src/lib/chat-stream.ts):** يحلّل `consumeChatStream` بروتوكول البثّ ويستدعي ردود نداء (نصّ/أداة/خطأ)، و`classifyChatError` يصنّف الأخطاء (`auth`/`quota`/`network`/`server`/`unknown`). كما يُصدِّر **الأنواع المرجعية** `UiMessage` و`ToolInvocation` المستخدمة في كامل مسار الرسائل — استخدمها بدل `any` عند لمس الرسائل. المكوّن الرئيسي [src/app/[locale]/page.tsx](src/app/[locale]/page.tsx) يفوّض إليه بدل تضمين منطق التحليل، وكلّ رسالة تُصيَّر عبر [message-item.tsx](src/components/message-item.tsx) المُذكّر (`memo`) بحيث لا يُعاد تصيير سوى الرسالة النشطة أثناء البثّ.

**حلقة التصحيح:** تُتحقَّق وسائط الأدوات بـ Zod في [src/lib/format-validator.ts](src/lib/format-validator.ts)؛ عند الفشل يُستدعى نموذج تصحيح لإصلاح صيغة JSON دون تغيير المعنى. **نموذج التصحيح قابل للضبط** من الإعدادات (`correctionModel`)؛ الافتراضي في المتجر سلسلة فارغة = استخدام نموذج المحادثة نفسه (الأكثر أمانًا عبر المزوّدين)، ويبقى `grok-beta-fast` مجرد fallback داخلي في `correctFormat` عند عدم تمرير أي نموذج.

**الوضع التجريبي (Demo Mode):** المفتاح `'demo'` يفعّل تدفقًا محليًّا بلا نداء فعلي، بمحتوى موطّن (namespace `demo` في ملفات اللغة) يُحمَّل كسولًا حتى لا يضخّم الحزمة الرئيسية.

### 4) الحالة والتخزين المحلي + أمان مفتاح API
- **[src/lib/store.ts](src/lib/store.ts)** — متجر Zustand للإعدادات (مفتاح API، baseUrl، النموذج، system prompt، نموذج التصحيح، إعادة المحاولة التلقائية `autoRetry`/`maxRetries`) محفوظ في localStorage باسم `prompt-iterator-storage` لأجل استمرارية بيانات الإصدارات السابقة.
- **[src/lib/db.ts](src/lib/db.ts)** — Dexie/IndexedDB (`PromptIteratorDB`) للمحادثات والرسائل والموجّهات المفضّلة.
- **أمان المفتاح:** داخل Tauri لا يُخزَّن مفتاح API في localStorage إطلاقًا — `partialize` في المتجر يستبعده، ويُحفَظ بدلًا منه في OS Keychain عبر Rust (باسم مزوّد `'default'`)، ويُحمَّل عند الإقلاع بـ `hydrateApiKey()`. لا يوجد fallback إلى localStorage داخل Tauri عند فشل الـ Keychain (مُنع عمدًا). في المتصفح يعود التخزين إلى localStorage.

### 5) جسر React ↔ Rust — النمط الأساسي
**[src/lib/tauri-bridge.ts](src/lib/tauri-bridge.ts)**: كل دالة تفحص `isTauriApp()` (`'__TAURI_INTERNALS__' in window`) ثم إمّا `invoke()` لأمر Rust أو بديل متصفّح (localStorage / fetch). **أي كود يلمس واجهات Tauri يجب أن يعمل في الوضعين** — احمِه دائمًا بهذا الفحص.

### 6) جانب Rust ([src-tauri/src/lib.rs](src-tauri/src/lib.rs))
خمسة أوامر: `save/get/delete/has_api_key` (عبر `keyring` باسم خدمة `muharrir-desktop`) و`test_api_connection` (عبر `reqwest` إلى `{base_url}/models` — يُنفَّذ في Rust **لتجاوز CORS**). إضافةً إلى: أيقونة شريط النظام (إظهار/إخفاء/خروج، والنقر الأيسر يبدّل النافذة)، اختصار عام `Ctrl+Shift+K`، تحديث تلقائي موقَّع من إصدارات GitHub (tauri-plugin-updater، pubkey في tauri.conf.json)، إعادة تشغيل بعد التحديث (tauri-plugin-process)، فتح الروابط الخارجية (tauri-plugin-opener)، وإغلاق-إلى-الدرج (زر X يُخفي بدل الإنهاء). `main.rs` يستدعي `run()` فقط. الـ CSP المقيّد مضبوط في `tauri.conf.json`.

### 7) i18n والتصدير الثابت
next-intl باللغتين `['ar','en']`، الافتراضية `ar`، `localePrefix: 'as-needed'` ([routing.ts](src/i18n/routing.ts)). الصفحات تحت `src/app/[locale]/`. التصدير الثابت يفرض `generateStaticParams` + `setRequestLocale` في [layout.tsx](src/app/[locale]/layout.tsx)، وفيه يُضبط اتجاه RTL والخطّ (Cairo للعربية). الجذر [src/app/page.tsx](src/app/page.tsx) يعيد التوجيه حسب اللغة المحفوظة في `preferred-locale` ثم لغة المتصفّح ثم الافتراضية.

**كل النصوص الظاهرة موطّنة** في [src/i18n/locales/ar.json](src/i18n/locales/ar.json) و[en.json](src/i18n/locales/en.json) عبر مساحات أسماء (`common`, `a11y`, `toasts`, `chat`, `settings`, `promptProposal`, `enhancementForm`, `fileUpload`, `demo`, `favorites`, `spotlight`, `updater`, …). لا تُضِف نصًّا عربيًّا ثابتًا في JSX/الإشعارات/التلميحات — أضِف مفتاحًا للّغتين واستعمل `t('namespace.key')`. الاستثناءات المقصودة الوحيدة: اسم المؤلّف وحقوق النشر، والنصوص الموجَّهة للنموذج (الـ system prompt وموجّه تصحيح الصيغة وفواصل التنسيق الداخلية).

### 8) وحدات مساعدة وميزات واجهة إضافية
- **منطق مساعد في `src/lib/`:** [providers.ts](src/lib/providers.ts) كتالوج المزوّدين المتوافقين مع OpenAI (بما فيها **Ollama المحلي** `localhost:11434/v1` الذي يعمل بلا مفتاح — تُحذف ترويسة `Authorization` عند غياب المفتاح) + دوال البحث/الإضافة اليدوية • [preset-modes.ts](src/lib/preset-modes.ts) 19 قالبًا جاهزًا مصنّفًا وثنائي اللغة لبدء الموجّهات • [token-estimate.ts](src/lib/token-estimate.ts) تقدير عدد الرموز • [text-diff.ts](src/lib/text-diff.ts) فرق نصّي لمقارنة الموجّهات • [decorator-engine.ts](src/lib/decorator-engine.ts) • [export-utils.ts](src/lib/export-utils.ts)/[import-utils.ts](src/lib/import-utils.ts) تصدير/استيراد الإعدادات والمفضّلة • [logger.ts](src/lib/logger.ts) تسجيل موحّد (استعمل `log.*` بدل `console.*`).
- **مكوّنات واجهة بارزة:** معرض الأنماط ([preset-gallery.tsx](src/components/preset-gallery.tsx)) • مقارنة الموجّهات ([compare-dialog.tsx](src/components/compare-dialog.tsx)) • بحث Spotlight (`Ctrl+K`، [spotlight-search.tsx](src/components/spotlight-search.tsx)) • شارة الإصدار/التحديث ([version-badge.tsx](src/components/version-badge.tsx)) • مبدّل اللغة ودليل الاختصارات • مكوّنات shadcn/ui في [src/components/ui/](src/components/ui/) (Radix + Tailwind). التطبيق قابل للتثبيت كـ **PWA** (`manifest.webmanifest`) — لا يوجد service worker بعد، فلا دعم للعمل دون اتصال. مع عناية بإمكانية الوصول (`aria-*`/`a11y`).

## التطوير والجودة والنشر

- **التنسيق والأنماط:** TypeScript صارم (`strict: true`) مع alias `@/* → ./src/*`؛ ESLint 9 بإعداد `eslint-config-next/core-web-vitals` وتُفرَض قواعد React Compiler الأربع (`react-hooks/refs` و`preserve-manual-memoization` و`set-state-in-effect` و`static-components`) — اكتشاف «العميل فقط» يكون عبر `useSyncExternalStore`، وإعادة الضبط عند فتح الحوارات عبر نمط adjust-state-during-render، والقيم المشتقّة تُحسب أثناء التصيير. Tailwind CSS 3 + tailwindcss-animate + class-variance-authority.
- **CI ([ci.yml](.github/workflows/ci.yml))** على كل PR ودفع إلى main/master: فحص الأسرار (Gitleaks بكامل التاريخ) → بناء الويب (`npm ci` → lint → typecheck → test:unit → build → Playwright smoke بعامل واحد) → فحص Rust (`cargo check` على ubuntu مع إنشاء `out/` وهمي). يجب أن تمرّ كل هذه البوابات قبل أي دمج.
- **النشر:** تاج `v*` → [build-desktop.yml](.github/workflows/build-desktop.yml) يبني مثبّتات الأنظمة الثلاثة موقّعة للتحديث التلقائي ويرفعها إلى GitHub Releases. سجلّ التغييرات في [CHANGELOG.md](CHANGELOG.md) (عربي، من الأحدث للأقدم) وملاحظات الإصدارات في [docs/releases/](docs/releases/).
- **سكربتات مساعدة:** تسجيل ديمو/GIF عبر Puppeteer في [scripts/](scripts/) (`record-demo`، `record-gif`)، وأدوات تحقق في [scripts/tests/](scripts/tests/).

## قيود وأخطاء شائعة (مهم)

| القيد | التفصيل |
|---|---|
| نسخ PDF worker | سكربتا `dev`/`build` يشغّلان `copy-pdf-worker` أولًا (ينسخ `pdf.worker.min.mjs` إلى `public/`). إن شغّلت `next` مباشرةً سينكسر تحليل PDF. |
| التصدير الثابت | ممنوع: API routes، middleware، أي عمل ديناميكي في الخادم. مفعَّل: `images: { unoptimized: true }` و`trailingSlash: true`. |
| ازدواجية المتصفّح/Tauri | لا تفترض وجود واجهات Tauri — احمِها بـ `isTauriApp()` ووفّر بديل متصفّح. |
| CORS | النداء المباشر للمزوّد يعمل في Tauri لكنه قد يفشل في متصفّح عادي؛ لذا `test_api_connection` يُنفَّذ في Rust. |
| بناء Linux | يتطلب `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `libsecret-1-dev`, `libssl-dev`, `pkg-config` (مثبَّتة في [ci.yml](.github/workflows/ci.yml)). |
| `tauri build` محليًّا | ينتهي بـ `Error: ...no private key` عند خطوة توقيع التحديث التلقائي، لأن `createUpdaterArtifacts: true` + `pubkey` يتطلّبان `TAURI_SIGNING_PRIVATE_KEY` (سرّ CI). **هذا ليس فشل بناء**: المثبّتات (`.msi`/`.exe`) تُنتَج قبل التوقيع وتكون صالحة. للنشر الموقَّع (مع `.sig` للتحديث) استخدم دفع تاج `v*` عبر Actions. |
| المزوّدون | أي واجهة متوافقة مع OpenAI. الافتراضي في المتجر DeepSeek (`https://api.deepseek.com`، نموذج `deepseek-chat`)؛ المفتاح `'demo'` يفعّل وضعًا تجريبيًا بلا نداء فعلي؛ Ollama المحلي يعمل بلا مفتاح. |
| الاعتماديات | لا تحذف أيًّا من اعتماديات `package.json`؛ القائمة مقصودة. |
