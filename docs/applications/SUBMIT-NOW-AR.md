# قدّم المنحة الآن — Codex for Open Source

ملف **عام** للإرشاد فقط. لا يضع بيانات شخصية أو معرفات منظمة.
بياناتك الخاصة موجودة محليًا في `private-submission-data.md` (مستبعد من git).

## الروابط

1. شروط البرنامج (اقرأها أنت — هذا البند الوحيد غير المعلَّم في القائمة):

   https://developers.openai.com/codex/codex-for-oss-terms

2. نموذج التقديم:

   https://openai.com/form/codex-for-oss/

3. صفحة البرنامج:

   https://developers.openai.com/community/codex-for-oss

## ما تملأه من النموذج (قيم عامة جاهزة)

| الحقل | القيمة |
|---|---|
| GitHub username | `3ssiri` |
| Repository | https://github.com/3ssiri/muharrir |
| Role | Primary maintainer |
| License | MIT |
| Interests | API credits ; Codex Security |

الحقول الخاصة (الاسم، البريد المرتبط بحساب ChatGPT، Organization ID):
انسخها من الملف المحلي فقط:

`docs/applications/private-submission-data.md`

**لا تلصقها في Issues أو PR أو commit.**

## الإجابات الجاهزة (≤ 500 حرفًا)

### Why does this repository qualify?

```text
Muharrir is an MIT-licensed, local-first Arabic/English prompt-engineering workspace. It addresses a gap in OSS AI tooling: strong RTL UX, bilingual guided prompting, local document parsing, provider choice, and web/desktop builds without a project-owned backend. The project has automated unit, browser, and Rust checks plus contribution-ready issues. It is early-stage; its ecosystem value is accessibility for Arabic-first and privacy-conscious builders.
```

### How will you use API credits?

```text
We will use API credits for core OSS maintenance: Codex-assisted issue triage and PR review, regression-test generation for Arabic/English flows, release and migration checks, dependency and security remediation, and provider-adapter fixtures. Automation will use repository code and synthetic test data only; no user prompts, API keys, personal data, or private documents will be submitted.
```

### Anything else we should know? (اختياري)

```text
Arabic-first open-source developer tooling remains underrepresented. Muharrir combines a real RTL product experience with local-first storage and provider choice, so contributors can improve multilingual prompting without operating a central user-data service. The project is early-stage and does not claim production traction; support would be used to make maintenance, review, testing, and releases sustainable as the community grows.
```

## لقطة المستودع (حدّث قبل الضغط على Submit)

تحقّق 2026-08-02:

- نجمة: 1 · تفرعات: 0 · قضايا مفتوحة: 9
- إصدارات: 7 (منها `v0.3.0-beta.2`)
- طلبات دمج مدمجة: 18
- CI على master أخضر:
  https://github.com/3ssiri/muharrir/actions/runs/30722771633
- المستودع عام:
  https://github.com/3ssiri/muharrir

**لا تدّعِ** مثبّتات سطح مكتب موقَّعة في النموذج حتى ينجح سير عمل Build Desktop ويُنتج ملفات `.sig`.

## بعد الإرسال

1. احفظ رقم/إيصال التقديم إن وُجد.
2. لا ترفع لقطة شاشة فيها Organization ID أو بريد.
3. حدّث `submission-checklist.md`: علّم «Program terms reviewed» بعد قراءتك للشروط.
