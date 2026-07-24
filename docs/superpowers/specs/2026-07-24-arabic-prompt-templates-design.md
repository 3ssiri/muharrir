# Arabic Prompt Templates & Prompt Packs — Design

Date: 2026-07-24
Status: Approved (design), pending implementation
Tracks: ROADMAP "Next" items — *Improve Arabic-first prompt proposal templates and examples* + *Add prompt packs for developers, educators, researchers, and creators*; community Issue #21 (Improve Arabic prompt proposal templates).

## 1. Problem

Muharrir is Arabic-first (default locale `ar`), but the prompt-proposal flow has
no concrete Arabic template:

1. `DEFAULT_SYSTEM_PROMPT` (in `src/lib/chat-client.ts`) is English with a single
   "Bilingual care" line. When the user writes Arabic, the model has no explicit
   structure to follow, so `propose_prompt` output varies in quality and often
   reads like translated English.
2. Demo mode (`DEMO_INTRO` / `DEMO_ENHANCEMENTS` / `DEMO_PROMPT`) is hardcoded
   English in `chat-client.ts`, so Arabic users get an English first-run
   experience, and the strings live outside the i18n files (against the project
   i18n rule for user-visible text).
3. ROADMAP promises prompt packs for developers, educators, researchers, and
   creators; the preset gallery has no persona-targeted entries for them.

## 2. Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Prompt packs shape | New modes in the existing preset gallery (`PRESET_MODES` + locale entries), no new UI section |
| Demo localization | Full per-locale demo; content moved to a `demo` namespace in `ar.json` / `en.json`; `streamChat` receives `locale` |
| System prompt Arabic guidance | Concrete Arabic template section (fixed headers + phrasing rules + mini example) |

Approach A chosen: `locale` param + i18n-owned demo content. Rejected: passing
demo content from the page (fat API, duplicated wiring), and runtime
`document.documentElement.lang` detection (hidden global, untestable).

## 3. Design

### 3.1 System prompt Arabic template

Append an `Arabic prompt structure` section to `DEFAULT_SYSTEM_PROMPT` in
`src/lib/chat-client.ts` (model-directed text — the documented exception to the
i18n rule, stays in code):

````markdown
# Arabic prompt structure

When the user writes in Arabic, fill every `propose_prompt` field in natural
Modern Standard Arabic — write natively, never word-by-word translation.

## Section headers in `finalPrompt`

Use these exact Arabic headers, in this order, each on its own line:

الدور:
الهدف:
السياق:
القيود:
خطوات العمل:
صيغة المخرجات:

Skip السياق or خطوات العمل only when they add no value.

## Phrasing rules

- Full, explicit sentences — no telegram style.
- Widely-used technical terms stay in English (API, SDK, JSON) with a short
  Arabic gloss on first use.
- User-fillable slots use double-brace placeholders: {{موضوع_المقال}}.
- RTL-friendly layout: one header per line, numbered steps, bulleted constraints.
- Address the reader with imperative masculine singular (اكتب، لخّص، صمّم).

## Mini example (skeleton)

الدور: أنت خبير تسويق رقمي متخصص في السوق الخليجي.
الهدف: صياغة إعلان قصير مقنع لمنتج {{اسم_المنتج}}.
القيود:
- لا تتجاوز 50 كلمة.
- نبرة ودّية بلا مبالغة.
صيغة المخرجات: عنوان جذّاب + نصّ الإعلان + 3 وسوم مقترحة.
````

### 3.2 Localized demo mode

**Namespace `demo`** added to both locale files with shape:

```jsonc
{
  "demo": {
    "intro": "…",
    "enhancements": { "dimensions": [ /* suggest_enhancements args */ ] },
    "prompt": {
      "title": "…", "role": "…", "objective": "…", "context": "…",
      "constraints": ["…"], "workflow": ["…"],
      "outputFormat": "…", "finalPrompt": "…"
    }
  }
}
```

- `en.json`: current `DEMO_INTRO` / `DEMO_ENHANCEMENTS` / `DEMO_PROMPT` content
  moved verbatim (English behavior unchanged).
- `ar.json`: new Arabic-first sample:

| Field | Arabic text |
|---|---|
| title | مساعد تحويل المستندات إلى موجّهات |
| role | أنت مساعد متخصص في هندسة الموجّهات باللغتين العربية والإنجليزية. |
| objective | تحويل فكرة غامضة أو ملخّص مستند مرفوع إلى موجّه ذكاء اصطناعي واضح قابل لإعادة الاستخدام. |
| context | قد يكون المستخدم مطوّرًا أو معلّمًا أو كاتبًا أو صانع منتجات، ويحتاج إرشادًا دون إرسال بياناته إلى خادم خارجي. |
| constraints | اطرح أسئلة التوضيح الضرورية فقط. / حافظ على وضوح العربية وبنية RTL عندما يكتب المستخدم بالعربية. / صرّح بالافتراضات بوضوح. / أعد موجّهًا يمكن نسخه مباشرة. |
| workflow | حدّد هدف المستخدم والسياق الناقص. / اعرض خيارات تحسين للجمهور ونمط المخرجات ومعيار الجودة. / أنشئ الموجّه النهائي بأقسام: الدور، الهدف، القيود، صيغة المخرجات. |
| outputFormat | Markdown بأقسام: الدور، الهدف، السياق، القيود، خطوات العمل، صيغة المخرجات، الموجّه النهائي. |
| finalPrompt | أنت مساعد متخصص في هندسة الموجّهات باللغتين. ساعدني في تحويل الفكرة الأولية التالية إلى موجّه ذكاء اصطناعي منظّم. اطرح حتى ثلاثة أسئلة توضيحية عند الحاجة، ثم أنشئ موجّهًا جاهزًا للنسخ بأقسام: الدور، الهدف، السياق، القيود، خطوات العمل، صيغة المخرجات. حافظ على وضوح العربية عند استخدامها. الفكرة الأولية: {{الفكرة_الأولية}} |

Arabic demo intro:

```
الوضع التجريبي

هذه محاكاة محلية — لا يجري أي اتصال بمزوّد ذكاء اصطناعي خارجي.

اختر اتجاهًا من جدول التحسينات، ثم راجع نموذج الموجّه المنظّم أدناه.
```

Arabic demo enhancement dimensions keep the same keys as English (`audience`,
`output_style`, `quality_bar`) and the same option values. Titles in the AR
file are Arabic-only (الجمهور، نمط المخرجات، معيار الجودة); the EN file keeps
its current bilingual titles (e.g. "Audience / الجمهور"):

- `audience` — الجمهور: مطوّرون / معلّمون / فرق منتجات
- `output_style` — نمط المخرجات: موجز منظّم / تعليمات وكيل / عربي أول
- `quality_bar` — معيار الجودة: مسودة سريعة / جاهز للمراجعة / درجة إنتاجية

**Flow:** `page.tsx` passes `locale` (from `useLocale()`) →
`streamChat({ locale })` → `buildDemoResponse(locale)` reads the `demo`
namespace from imported `ar.json` / `en.json`; unknown or missing locale falls
back to English.

### 3.3 New persona presets (prompt packs)

Four modes added to `PRESET_MODES` in `src/lib/preset-modes.ts`, with
`presets.<id>.{name,description,starter}` entries in both locale files:

| id | Icon | Persona | AR name / EN name | Decorators |
|---|---|---|---|---|
| `code_review` | 🔍 | Developers | مراجعة الشيفرة / Code review | `step_by_step, technical, code, critique` |
| `lesson_plan` | 📚 | Educators | إعداد الدروس / Lesson planning | `step_by_step, friendly, structured` |
| `paper_summary` | 📑 | Researchers | تلخيص الأوراق البحثية / Paper summarization | `reasoning, formal, structured, cite_sources` |
| `video_script` | 🎬 | Creators | سيناريو الفيديو / Video scripting | `none, creative, markdown, refine` |

Arabic starters (same placeholder style as existing modes):

- `code_review` — description: فحص الجودة والأداء والأمان

  ```
  الدور: [مراجع شيفرة خبير]
  الشيفرة: [الصقها هنا]
  السياق: [اللغة والإطار والغرض]
  المطلوب: [راجع الجودة والأداء والأمان واقترح تحسينات]
  صيغة المخرجات: [ملاحظات مصنّفة حسب الخطورة + شيفرة محسّنة]
  ```

- `lesson_plan` — description: خطط دروس وأنشطة صفّية

  ```
  الدور: [معلّم خبير في تصميم المناهج]
  المادة والموضوع: [...]
  المرحلة والمدّة: [...]
  المطلوب: [خطة درس بأهداف تعلّم وأنشطة وتقييم]
  صيغة المخرجات: [أقسام: الأهداف، التمهيد، الأنشطة، التقييم، الواجب]
  ```

- `paper_summary` — description: ملخّصات منهجية للأبحاث

  ```
  الدور: [باحث متخصص]
  الورقة: [الصق النصّ أو الملخّص]
  المطلوب: [ملخّص منهجي: المشكلة، المنهجية، النتائج، الحدود]
  المتطلّبات: [الاستشهاد بالمصادر عند الإشارة لأعمال أخرى]
  صيغة المخرجات: [أقسام منظّمة + تقييم نقدي موجز]
  ```

- `video_script` — description: سيناريوهات يوتيوب ومنصّات قصيرة

  ```
  الدور: [كاتب سيناريو فيديو]
  الموضوع والمنصّة: [...]
  المدّة المستهدفة: [...]
  الجمهور: [...]
  المطلوب: [سيناريو بمشاهد: خطّاف افتتاحي، محتوى، خاتمة بدعوة لإجراء]
  صيغة المخرجات: [جدول: زمن، مشهد، نصّ، إرشادات تصوير]
  ```

English entries mirror the same structure (Code review / Lesson planning /
Paper summarization / Video scripting).

### 3.4 Wiring changes

1. `src/lib/chat-client.ts`
   - `StreamChatParams` gains `locale?: string`.
   - Delete `DEMO_INTRO`, `DEMO_ENHANCEMENTS`, `DEMO_PROMPT` constants.
   - Import both locale JSONs; `getDemoContent(locale)` returns the `demo`
     namespace for `ar`, English for anything else.
   - `buildDemoResponse(locale?)` uses `getDemoContent`; the streamed
     `suggest_enhancements` / `propose_prompt` args come from the locale file.
   - Append the §3.1 Arabic section to `DEFAULT_SYSTEM_PROMPT`.
2. `src/app/[locale]/page.tsx` — call `useLocale()` and pass `locale` at both
   `streamChat` call sites (~line 416 and ~802).
3. `src/i18n/locales/{ar,en}.json` — add the `demo` namespace and the four new
   `presets` entries.

### 3.5 Tests

- **Vitest** (`src/lib/__tests__/chat-client.test.ts`, existing):
  - `streamChat` with `apiKey: 'demo'` and `locale: 'ar'` → stream contains
    «مساعد تحويل المستندات إلى موجّهات».
  - `locale: 'en'` and omitted `locale` → stream contains
    `Document-to-Prompt Assistant` (fallback).
  - Demo args from both locales pass `validateToolCall` for
    `suggest_enhancements` and `propose_prompt`.
- **Playwright** (`tests/ui-optimization.spec.js`, runs on `/ar`): replace the
  three `'Document-to-Prompt Assistant'` assertions with the Arabic demo title.
- Verification: `npm run test:unit`, `npm run lint`, `npm run typecheck`,
  `npx playwright test tests/ui-optimization.spec.js`.

### 3.6 Docs

- `docs/releases/unreleased.md`: add entries under Added/Changed.
- No `AGENTS.md` change (the change aligns with the existing i18n rule).

## 4. Acceptance criteria

- Arabic UI demo mode shows the full Arabic sample (intro, enhancement table,
  proposal card); English UI shows the previous English content verbatim.
- No user-visible string is hardcoded outside the locale files (Issue #21).
- English behavior unchanged when `locale` is `'en'` or omitted.
- Preset gallery shows 23 modes; the four new modes seed localized starters.
- All gates green: lint, typecheck, unit tests, the touched Playwright spec,
  static export (`npm run build`).

## 5. Out of scope

- A standalone "packs" UI section or multi-template bundles.
- Localizing the model-directed system prompt itself (stays English + Arabic
  template section).
- Real-key provider smoke tests (tracked separately in NEXT_STEPS).
