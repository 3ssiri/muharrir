# Arabic Prompt Templates & Prompt Packs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make prompt proposals read naturally in Arabic (system-prompt template + localized demo) and add four persona prompt packs to the preset gallery.

**Architecture:** Demo content moves from hardcoded constants in `chat-client.ts` into a new `demo` namespace in the locale JSONs; `streamChat` gains an optional `locale` param (passed from `page.tsx` via `useLocale()`). The default system prompt gains a concrete Arabic structure section. Four new modes join `PRESET_MODES` with localized entries. Spec: `docs/superpowers/specs/2026-07-24-arabic-prompt-templates-design.md`.

**Tech Stack:** Next.js 16 (static export), next-intl 4 (`ar`/`en`), Vitest, Playwright, TypeScript.

---

### Task 1: Localized demo mode (locale files + chat-client plumbing)

**Files:**
- Modify: `src/i18n/locales/en.json` (add `demo` namespace)
- Modify: `src/i18n/locales/ar.json` (add `demo` namespace)
- Modify: `src/lib/chat-client.ts` (`StreamChatParams.locale`, `getDemoContent`, `buildDemoResponse(locale)`, delete `DEMO_*` constants)
- Test: `src/lib/__tests__/chat-client.test.ts`

- [ ] **Step 1: Write the failing tests**

In `src/lib/__tests__/chat-client.test.ts`, extend the imports and the existing
`describe('streamChat demo mode')` block:

```ts
// Add to the imports at the top of the file:
import { validateToolCall } from '@/lib/format-validator'
```

```ts
// Add inside describe('streamChat demo mode'):
  it('returns the Arabic demo sample when locale is ar', async () => {
    const response = await streamChat({
      messages: [{ role: 'user', content: 'حوّل فكرة دورة إلى موجه' }],
      apiKey: 'demo',
      baseUrl: 'https://example.invalid/v1',
      locale: 'ar',
    })

    const result = await consumeChatStream(response, () => {})

    expect(result.content).toContain('الوضع التجريبي')
    expect(result.toolInvocations).toHaveLength(2)
    expect(result.toolInvocations[1].args).toMatchObject({
      title: 'مساعد تحويل المستندات إلى موجّهات',
      finalPrompt: expect.stringContaining('{{الفكرة_الأولية}}'),
    })
  })

  it('falls back to the English demo sample for unknown or missing locales', async () => {
    for (const locale of [undefined, 'fr']) {
      const response = await streamChat({
        messages: [{ role: 'user', content: 'demo please' }],
        apiKey: 'demo',
        baseUrl: 'https://example.invalid/v1',
        locale,
      })
      const result = await consumeChatStream(response, () => {})
      expect(result.toolInvocations[1].args).toMatchObject({
        title: 'Document-to-Prompt Assistant',
      })
    }
  })

  it('streams demo tool args that pass format validation in both locales', async () => {
    for (const locale of ['ar', 'en']) {
      const response = await streamChat({
        messages: [{ role: 'user', content: 'demo' }],
        apiKey: 'demo',
        baseUrl: 'https://example.invalid/v1',
        locale,
      })
      const result = await consumeChatStream(response, () => {})
      for (const tool of result.toolInvocations) {
        expect(validateToolCall(tool.toolName, tool.args).valid).toBe(true)
      }
    }
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/chat-client.test.ts`
Expected: FAIL — `locale` is not part of `StreamChatParams` (TS error) and the
Arabic demo content does not exist.

- [ ] **Step 3: Add the `demo` namespace to `en.json` (verbatim move)**

In `src/i18n/locales/en.json`, add a top-level `demo` key (keep alphabetical
neighbors sensible; the existing top-level order is not strict). Content is the
current hardcoded demo moved verbatim:

```json
"demo": {
  "intro": "Demo Mode\n\nThis is a local simulated run. No external AI provider is called.\n\nPick a direction from the enhancement table, then review the sample structured prompt below.",
  "enhancements": {
    "dimensions": [
      {
        "key": "audience",
        "title": "Audience / الجمهور",
        "options": [
          { "label": "Developers", "value": "developers", "description": "Use technical language, constraints, and implementation details." },
          { "label": "Educators", "value": "educators", "description": "Use learning goals, examples, and assessment criteria." },
          { "label": "Product teams", "value": "product-teams", "description": "Use goals, trade-offs, acceptance criteria, and user impact." }
        ],
        "allowCustom": true
      },
      {
        "key": "output_style",
        "title": "Output style / نمط المخرجات",
        "options": [
          { "label": "Structured brief", "value": "structured-brief", "description": "Concise sections with context, task, constraints, and output format." },
          { "label": "Agent instructions", "value": "agent-instructions", "description": "Step-by-step instructions suitable for coding or research agents." },
          { "label": "Arabic-first", "value": "arabic-first", "description": "Arabic phrasing with clear RTL-friendly structure." }
        ],
        "allowCustom": true
      },
      {
        "key": "quality_bar",
        "title": "Quality bar / معيار الجودة",
        "options": [
          { "label": "Fast draft", "value": "fast-draft", "description": "Prioritize a usable first version." },
          { "label": "Review-ready", "value": "review-ready", "description": "Include assumptions, risks, and verification steps." },
          { "label": "Production-grade", "value": "production-grade", "description": "Add strict constraints, examples, and acceptance checks." }
        ],
        "allowCustom": true
      }
    ]
  },
  "prompt": {
    "title": "Document-to-Prompt Assistant",
    "role": "You are a bilingual Arabic/English prompt engineering assistant.",
    "objective": "Turn a vague user idea or uploaded document summary into a clear, reusable AI prompt.",
    "context": "The user may be a developer, educator, writer, or product builder. They need guidance without sending data to a Muharrir server.",
    "constraints": [
      "Ask only essential clarification questions.",
      "Preserve Arabic RTL readability when the user writes in Arabic.",
      "State assumptions explicitly.",
      "Return a prompt the user can copy directly."
    ],
    "workflow": [
      "Identify the user goal and missing context.",
      "Offer enhancement choices for audience, output style, and quality bar.",
      "Generate a final prompt with role, task, constraints, and output format."
    ],
    "outputFormat": "Markdown with sections: Role, Objective, Context, Constraints, Workflow, Output Format, and Final Prompt.",
    "finalPrompt": "You are a bilingual prompt engineering assistant. Help me transform the following rough idea into a structured AI prompt. Ask up to three clarification questions if needed, then produce a copy-ready prompt with Role, Objective, Context, Constraints, Workflow, and Output Format. Preserve Arabic readability when Arabic is used. Rough idea: {{user_idea}}"
  }
}
```

- [ ] **Step 4: Add the `demo` namespace to `ar.json` (new Arabic sample)**

In `src/i18n/locales/ar.json`, add the same-shaped top-level `demo` key:

```json
"demo": {
  "intro": "الوضع التجريبي\n\nهذه محاكاة محلية — لا يجري أي اتصال بمزوّد ذكاء اصطناعي خارجي.\n\nاختر اتجاهًا من جدول التحسينات، ثم راجع نموذج الموجّه المنظّم أدناه.",
  "enhancements": {
    "dimensions": [
      {
        "key": "audience",
        "title": "الجمهور",
        "options": [
          { "label": "مطوّرون", "value": "developers", "description": "لغة تقنية وقيود وتفاصيل تنفيذية." },
          { "label": "معلّمون", "value": "educators", "description": "أهداف تعلّم وأمثلة ومعايير تقييم." },
          { "label": "فرق منتجات", "value": "product-teams", "description": "أهداف ومفاضلات ومعايير قبول وأثر على المستخدم." }
        ],
        "allowCustom": true
      },
      {
        "key": "output_style",
        "title": "نمط المخرجات",
        "options": [
          { "label": "موجز منظّم", "value": "structured-brief", "description": "أقسام موجزة: السياق والمهمة والقيود وصيغة المخرجات." },
          { "label": "تعليمات وكيل", "value": "agent-instructions", "description": "تعليمات خطوة بخطوة تناسب وكلاء البرمجة والبحث." },
          { "label": "عربي أول", "value": "arabic-first", "description": "صياغة عربية ببنية واضحة ملائمة لاتجاه RTL." }
        ],
        "allowCustom": true
      },
      {
        "key": "quality_bar",
        "title": "معيار الجودة",
        "options": [
          { "label": "مسودة سريعة", "value": "fast-draft", "description": "أولوية لنسخة أولى قابلة للاستخدام." },
          { "label": "جاهز للمراجعة", "value": "review-ready", "description": "يتضمّن الافتراضات والمخاطر وخطوات التحقق." },
          { "label": "درجة إنتاجية", "value": "production-grade", "description": "قيود صارمة وأمثلة واختبارات قبول." }
        ],
        "allowCustom": true
      }
    ]
  },
  "prompt": {
    "title": "مساعد تحويل المستندات إلى موجّهات",
    "role": "أنت مساعد متخصص في هندسة الموجّهات باللغتين العربية والإنجليزية.",
    "objective": "تحويل فكرة غامضة أو ملخّص مستند مرفوع إلى موجّه ذكاء اصطناعي واضح قابل لإعادة الاستخدام.",
    "context": "قد يكون المستخدم مطوّرًا أو معلّمًا أو كاتبًا أو صانع منتجات، ويحتاج إرشادًا دون إرسال بياناته إلى خادم خارجي.",
    "constraints": [
      "اطرح أسئلة التوضيح الضرورية فقط.",
      "حافظ على وضوح العربية وبنية RTL عندما يكتب المستخدم بالعربية.",
      "صرّح بالافتراضات بوضوح.",
      "أعد موجّهًا يمكن نسخه مباشرة."
    ],
    "workflow": [
      "حدّد هدف المستخدم والسياق الناقص.",
      "اعرض خيارات تحسين للجمهور ونمط المخرجات ومعيار الجودة.",
      "أنشئ الموجّه النهائي بأقسام: الدور، الهدف، القيود، صيغة المخرجات."
    ],
    "outputFormat": "Markdown بأقسام: الدور، الهدف، السياق، القيود، خطوات العمل، صيغة المخرجات، الموجّه النهائي.",
    "finalPrompt": "أنت مساعد متخصص في هندسة الموجّهات باللغتين. ساعدني في تحويل الفكرة الأولية التالية إلى موجّه ذكاء اصطناعي منظّم. اطرح حتى ثلاثة أسئلة توضيحية عند الحاجة، ثم أنشئ موجّهًا جاهزًا للنسخ بأقسام: الدور، الهدف، السياق، القيود، خطوات العمل، صيغة المخرجات. حافظ على وضوح العربية عند استخدامها. الفكرة الأولية: {{الفكرة_الأولية}}"
  }
}
```

- [ ] **Step 5: Wire `locale` through `chat-client.ts`**

In `src/lib/chat-client.ts`:

1. Add imports at the top (after the existing two imports):

```ts
import arMessages from '@/i18n/locales/ar.json';
import enMessages from '@/i18n/locales/en.json';
```

2. Add `locale?: string;` to `StreamChatParams` (after `correctionModel?: string;`):

```ts
  // Model used by the format-correction loop (configurable in Settings)
  correctionModel?: string;
  // UI locale — selects the localized demo-mode sample ('ar' or 'en')
  locale?: string;
```

3. Delete the `DEMO_INTRO`, `DEMO_ENHANCEMENTS`, and `DEMO_PROMPT` constants
   (lines 67-162) and replace them with:

```ts
// Demo-mode content is localized — see the `demo` namespace in
// src/i18n/locales/{ar,en}.json. Unknown locales fall back to English.
function getDemoContent(locale?: string) {
  return (locale === 'ar' ? arMessages : enMessages).demo;
}
```

4. Change `buildDemoResponse()` to accept the locale and read from it:

```ts
// Demo mode stream
function buildDemoResponse(locale?: string): Response {
  const demo = getDemoContent(locale);
  const encoder = new TextEncoder();
  const chunks = [
    `0:${JSON.stringify(demo.intro)}\n`,
    `9:${JSON.stringify({ toolCallId: 'demo_enhancements', toolName: 'suggest_enhancements', args: demo.enhancements })}\n`,
    `9:${JSON.stringify({ toolCallId: 'demo_prompt', toolName: 'propose_prompt', args: demo.prompt })}\n`,
  ];
  // …rest of the function (stream + Response) stays unchanged…
}
```

5. In `streamChat`, pass the locale through:

```ts
  // Demo mode
  if (apiKey === 'demo') {
    return buildDemoResponse(params.locale);
  }
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/chat-client.test.ts`
Expected: PASS — all demo-mode tests, including the pre-existing English one
(it calls `streamChat` without `locale` → English fallback).

- [ ] **Step 7: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/ar.json src/lib/chat-client.ts src/lib/__tests__/chat-client.test.ts
git commit -m "feat: localize demo mode with full Arabic sample"
```

---

### Task 2: Arabic prompt structure in the default system prompt

**Files:**
- Modify: `src/lib/chat-client.ts` (`DEFAULT_SYSTEM_PROMPT`)
- Test: `src/lib/__tests__/chat-client.test.ts`

- [ ] **Step 1: Write the failing test**

Add a new describe block at the end of `src/lib/__tests__/chat-client.test.ts`:

```ts
describe('default system prompt', () => {
  it('includes the Arabic prompt structure section', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('data: [DONE]\n\n'))
    vi.stubGlobal('fetch', fetchMock)

    await streamChat({
      messages: [{ role: 'user', content: 'حوّل فكرة إلى موجه' }],
      apiKey: 'test-key',
      baseUrl: 'https://example.invalid/v1',
      model: 'test-model',
    })

    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body as string)
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[0].content).toContain('# Arabic prompt structure')
    expect(body.messages[0].content).toContain('الدور:')
    expect(body.messages[0].content).toContain('صيغة المخرجات:')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/chat-client.test.ts -t "Arabic prompt structure"`
Expected: FAIL — the current system prompt has no such section.

- [ ] **Step 3: Append the Arabic section to `DEFAULT_SYSTEM_PROMPT`**

In `src/lib/chat-client.ts`, append the following to the end of the
`DEFAULT_SYSTEM_PROMPT` template literal (after principle 5 "Bilingual care",
before the closing backtick). Note: this is model-directed text — the documented
exception to the i18n rule; it stays in code.

**Critical:** `DEFAULT_SYSTEM_PROMPT` is a JS template literal, so every
backtick in the appended text MUST be escaped as `` \` `` (the existing prompt
already does this, e.g. `` \`suggest_enhancements\` ``). The block below shows
the escaped form exactly as it should appear in the source:

```markdown

# Arabic prompt structure

When the user writes in Arabic, fill every \`propose_prompt\` field in natural
Modern Standard Arabic — write natively, never word-by-word translation.

## Section headers in \`finalPrompt\`

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
```

(After pasting, verify with `npm run typecheck` — an unescaped backtick breaks
parsing immediately. The `{{موضوع_المقال}}` placeholder contains no backticks
and needs no escaping.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/chat-client.test.ts`
Expected: PASS (whole file green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/chat-client.ts src/lib/__tests__/chat-client.test.ts
git commit -m "feat: add Arabic prompt structure template to default system prompt"
```

---

### Task 3: Pass the UI locale from the page to `streamChat`

**Files:**
- Modify: `src/app/[locale]/page.tsx` (import, hook, both `streamChat` call sites at ~line 416 and ~line 802)

- [ ] **Step 1: Import `useLocale` and read it in the component**

Change line 28 from:

```ts
import { useTranslations } from 'next-intl'
```

to:

```ts
import { useTranslations, useLocale } from 'next-intl'
```

Inside `Home()`, right after `const t = useTranslations();` (line 39), add:

```ts
  const locale = useLocale();
```

- [ ] **Step 2: Pass `locale` at both call sites**

First call site (~line 416, inside `onFormSubmit`):

```ts
      const response = await streamChat({
        messages: [...messages, userMessage],
        model: model,
        systemPrompt: systemPrompt,
        apiKey: apiKey,
        baseUrl: baseUrl,
        correctionModel: correctionModel,
        locale: locale,
        signal: abortController.signal
      })
```

Second call site (~line 802, inside the retry/regenerate handler):

```ts
      const response = await streamChat({
        messages: [...messagesRef.current, userMessage],
        model: model,
        systemPrompt: systemPrompt,
        apiKey: apiKey,
        baseUrl: baseUrl,
        correctionModel: correctionModel,
        locale: locale
      })
```

- [ ] **Step 3: Verify types and lint**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run lint`
Expected: no errors (warnings pre-existing only, if any).

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/page.tsx"
git commit -m "feat: pass UI locale to chat client for localized demo"
```

---

### Task 4: Persona prompt packs (four new preset modes)

**Files:**
- Modify: `src/lib/preset-modes.ts`
- Modify: `src/i18n/locales/ar.json` (`presets` namespace)
- Modify: `src/i18n/locales/en.json` (`presets` namespace)
- Test: `src/lib/__tests__/preset-modes.test.ts` (new)

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/preset-modes.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { PRESET_MODES } from '@/lib/preset-modes'
import arMessages from '@/i18n/locales/ar.json'
import enMessages from '@/i18n/locales/en.json'

type PresetEntry = { name?: string; description?: string; starter?: string }

describe('preset modes locale coverage', () => {
  it('every preset mode has localized name, description, and starter in both locales', () => {
    for (const id of Object.keys(PRESET_MODES)) {
      for (const messages of [arMessages, enMessages]) {
        const entry = (messages.presets as Record<string, PresetEntry>)[id]
        expect(entry, `missing presets.${id}`).toBeDefined()
        expect(entry?.name, `presets.${id}.name`).toBeTruthy()
        expect(entry?.description, `presets.${id}.description`).toBeTruthy()
        expect(entry?.starter, `presets.${id}.starter`).toBeTruthy()
      }
    }
  })

  it('includes the four persona pack modes', () => {
    expect(Object.keys(PRESET_MODES)).toEqual(
      expect.arrayContaining(['code_review', 'lesson_plan', 'paper_summary', 'video_script'])
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/preset-modes.test.ts`
Expected: FAIL — the four persona modes do not exist yet.

- [ ] **Step 3: Add the four modes to `PRESET_MODES`**

In `src/lib/preset-modes.ts`, append inside `PRESET_MODES` (after the
`brainstorm` entry, before the closing brace):

```ts
  // — Persona packs —
  code_review: { id: 'code_review', icon: '🔍', decorators: { thinking_depth: 'step_by_step', tone: 'technical', output_format: 'code', evaluation: ['critique'] } },
  lesson_plan: { id: 'lesson_plan', icon: '📚', decorators: { thinking_depth: 'step_by_step', tone: 'friendly', output_format: 'structured' } },
  paper_summary: { id: 'paper_summary', icon: '📑', decorators: { thinking_depth: 'reasoning', tone: 'formal', output_format: 'structured', validation: ['cite_sources'] } },
  video_script: { id: 'video_script', icon: '🎬', decorators: { thinking_depth: 'none', tone: 'creative', output_format: 'markdown', evaluation: ['refine'] } },
```

- [ ] **Step 4: Add Arabic locale entries**

In `src/i18n/locales/ar.json`, inside the `presets` object (after `brainstorm`),
add:

```json
"code_review": {
  "name": "مراجعة الشيفرة",
  "description": "فحص الجودة والأداء والأمان",
  "starter": "الدور: [مراجع شيفرة خبير]\nالشيفرة: [الصقها هنا]\nالسياق: [اللغة والإطار والغرض]\nالمطلوب: [راجع الجودة والأداء والأمان واقترح تحسينات]\nصيغة المخرجات: [ملاحظات مصنّفة حسب الخطورة + شيفرة محسّنة]"
},
"lesson_plan": {
  "name": "إعداد الدروس",
  "description": "خطط دروس وأنشطة صفّية",
  "starter": "الدور: [معلّم خبير في تصميم المناهج]\nالمادة والموضوع: [...]\nالمرحلة والمدّة: [...]\nالمطلوب: [خطة درس بأهداف تعلّم وأنشطة وتقييم]\nصيغة المخرجات: [أقسام: الأهداف، التمهيد، الأنشطة، التقييم، الواجب]"
},
"paper_summary": {
  "name": "تلخيص الأوراق البحثية",
  "description": "ملخّصات منهجية للأبحاث",
  "starter": "الدور: [باحث متخصص]\nالورقة: [الصق النصّ أو الملخّص]\nالمطلوب: [ملخّص منهجي: المشكلة، المنهجية، النتائج، الحدود]\nالمتطلّبات: [الاستشهاد بالمصادر عند الإشارة لأعمال أخرى]\nصيغة المخرجات: [أقسام منظّمة + تقييم نقدي موجز]"
},
"video_script": {
  "name": "سيناريو الفيديو",
  "description": "سيناريوهات يوتيوب ومنصّات قصيرة",
  "starter": "الدور: [كاتب سيناريو فيديو]\nالموضوع والمنصّة: [...]\nالمدّة المستهدفة: [...]\nالجمهور: [...]\nالمطلوب: [سيناريو بمشاهد: خطّاف افتتاحي، محتوى، خاتمة بدعوة لإجراء]\nصيغة المخرجات: [جدول: زمن، مشهد، نصّ، إرشادات تصوير]"
}
```

- [ ] **Step 5: Add English locale entries**

In `src/i18n/locales/en.json`, inside the `presets` object (after `brainstorm`),
add:

```json
"code_review": {
  "name": "Code Review",
  "description": "Quality, performance, and security checks",
  "starter": "Role: [an expert code reviewer]\nCode: [paste it here]\nContext: [language, framework, and purpose]\nTask: [review quality, performance, and security; suggest improvements]\nOutput format: [findings grouped by severity + improved code]"
},
"lesson_plan": {
  "name": "Lesson Planning",
  "description": "Lesson plans and class activities",
  "starter": "Role: [an expert teacher in curriculum design]\nSubject and topic: [...]\nLevel and duration: [...]\nTask: [a lesson plan with learning goals, activities, and assessment]\nOutput format: [sections: goals, warm-up, activities, assessment, homework]"
},
"paper_summary": {
  "name": "Paper Summarization",
  "description": "Methodical research summaries",
  "starter": "Role: [a specialist researcher]\nPaper: [paste the text or abstract]\nTask: [a methodical summary: problem, methodology, results, limitations]\nRequirements: [cite sources when referencing other work]\nOutput format: [structured sections + a brief critical appraisal]"
},
"video_script": {
  "name": "Video Scripting",
  "description": "Scripts for YouTube and short-form platforms",
  "starter": "Role: [a video scriptwriter]\nTopic and platform: [...]\nTarget duration: [...]\nAudience: [...]\nTask: [a scene-based script: opening hook, content, closing call to action]\nOutput format: [table: time, scene, narration, shot directions]"
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/preset-modes.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/preset-modes.ts src/i18n/locales/ar.json src/i18n/locales/en.json src/lib/__tests__/preset-modes.test.ts
git commit -m "feat: add persona prompt packs to preset gallery"
```

---

### Task 5: Playwright updates, changelog, full verification

**Files:**
- Modify: `tests/ui-optimization.spec.js` (3 assertions)
- Modify: `docs/releases/unreleased.md`

- [ ] **Step 1: Update the three demo-title assertions**

The spec runs on the Arabic UI, which now shows the Arabic demo sample. In
`tests/ui-optimization.spec.js`, replace all three occurrences of:

```js
await expect(page.getByText('Document-to-Prompt Assistant'))
```

with:

```js
await expect(page.getByText('مساعد تحويل المستندات إلى موجّهات'))
```

(Lines ~97, ~109, ~124. Keep each line's own options such as `{ timeout: 10000 }`.)

- [ ] **Step 2: Run the Playwright spec**

Run: `npx playwright test tests/ui-optimization.spec.js`
Expected: PASS (Playwright auto-starts the dev server on port 9173 — no manual
`npm run dev` needed).

- [ ] **Step 3: Update the changelog**

In `docs/releases/unreleased.md`, under `## Added` append:

```markdown
- Arabic prompt structure template in the default system prompt (fixed Arabic section headers, phrasing rules, and a mini example for `propose_prompt`).
- Localized demo mode: a full Arabic sample when the UI locale is Arabic, English otherwise (content now lives in the `demo` i18n namespace).
- Persona prompt packs in the preset gallery: code review (developers), lesson planning (educators), paper summarization (researchers), and video scripting (creators).
- Unit coverage for locale-aware demo content, the Arabic system-prompt section, and preset-mode locale parity.
```

Under `## Changed` append:

```markdown
- Demo mode content moved from hardcoded strings into the `demo` i18n namespace; Playwright demo assertions now match the Arabic sample.
```

- [ ] **Step 4: Run the full gate**

Run each and confirm green:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

Expected: lint clean, typecheck clean, all unit tests pass, static export to
`out/` succeeds.

- [ ] **Step 5: Commit**

```bash
git add tests/ui-optimization.spec.js docs/releases/unreleased.md
git commit -m "test: update demo e2e assertions to Arabic sample; chore: changelog"
```

---

## Notes for the executor

- **JSON validity:** after editing each locale file, a fast sanity check is
  `node -e "require('./src/i18n/locales/ar.json')"`. The Vitest run also fails
  on invalid JSON.
- **Do not touch** `DEFAULT_SYSTEM_PROMPT`'s English part beyond appending the
  Arabic section (Task 2), and do not rename existing preset ids.
- The second `streamChat` call site in `page.tsx` intentionally has no `signal`
  — keep it that way; only add `locale`.
- Commit order matters: Task 1 before Task 3 (page passes `locale` that the
  client must already accept).
