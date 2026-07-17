# قائمة تنفيذ تجهيز محرر للمنح وOSS

## طريقة القراءة

استخدم هذه القائمة كلوحة تنفيذ. لا تنتقل للمرحلة التالية حتى تنهي شروط القبول للمرحلة الحالية.

الحالات المقترحة:

- `[ ]` لم يبدأ
- `[~]` قيد التنفيذ
- `[x]` مكتمل
- `[!]` يحتاج قرارا من المالك

---

## المرحلة 0: قرارات قبل التنفيذ

- [x] تحديد هل سنفتح المستودع الحالي أم ننشئ نسخة عامة جديدة: تجهيز المستودع الحالي داخليا وفتحه لاحقا بعد بوابة الجاهزية.
- [x] تحديد الرخصة: MIT.
- [x] تحديد هل سيبقى الاسم `muharrir` أم يستخدم اسم عرض `Muharrir` فقط: `muharrir` للحزمة و`Muharrir` كاسم عرض.
- [x] تحديد هل ننشر نسخة Desktop release الآن أم لاحقا: لاحقا بعد اكتمال بوابة الجاهزية.
- [x] تحديد هل نحتاج Demo URL أم يكفي local + screenshots: يكفي local + screenshots/GIF مبدئيا، ويعاد تقييم Demo URL لاحقا.
- [x] تحديد هل نستخدم شعار/أيقونة المشروع الحالية أم نحدثها: استخدام الهوية الحالية في أول تمريرة جاهزية.

قرار موصى به:

- افتح المستودع الحالي فقط بعد تنظيف الرخصة والخصوصية.
- استخدم MIT إذا كان الهدف تبني واسع وسرعة قبول مساهمات.
- استخدم Apache-2.0 إذا كنت تريد صياغة مؤسسية أقوى.

سجل القرارات المعتمد: [DECISIONS.md](DECISIONS.md).

---

## المرحلة 1: تنظيف الرخصة والهوية

### مهام

- [x] مراجعة `LICENSE` الحالي.
- [x] إصلاح التعارض بين README وLICENSE.
- [x] تحديث `package.json`:
  - [x] تغيير `name` من `app` إلى `muharrir` أو `@3ssiri/muharrir` إذا كان سينشر لاحقا.
  - [x] مراجعة `private: true`.
  - [x] إضافة description مناسب.
  - [x] إضافة repository, license, keywords.
- [x] البحث عن أي نص `proprietary`, `confidential`, `all rights reserved`: المتبقي سياق تخطيطي أو مقارنة سوقية، لا صياغة ترخيص نشطة.
- [x] حذف أو تعديل النصوص المغلقة إذا كان القرار فتح المصدر.
- [x] إضافة `NOTICE` إذا لزم: غير لازم حاليا؛ لا توجد إشعارات طرف ثالث مخصصة تتطلب ملف NOTICE.

### شروط القبول

- لا يوجد تعارض بين README وLICENSE.
- أي شخص يزور المستودع يفهم الرخصة خلال 10 ثوان.
- لا توجد صياغة قانونية متناقضة.

---

## المرحلة 2: ملفات الحوكمة المفتوحة المصدر

### ملفات مطلوبة

- [x] `CONTRIBUTING.md`
- [x] `SECURITY.md`
- [x] `CODE_OF_CONDUCT.md`
- [x] `GOVERNANCE.md`
- [x] `PRIVACY.md`
- [x] `CHANGELOG.md`
- [x] `docs/ROADMAP.md`
- [x] `docs/PRIVACY.md`
- [x] `.github/PULL_REQUEST_TEMPLATE.md`
- [x] `.github/ISSUE_TEMPLATE/bug_report.yml`
- [x] `.github/ISSUE_TEMPLATE/feature_request.yml`
- [x] `.github/ISSUE_TEMPLATE/documentation.yml`

### محتوى مهم

- [x] شرح أن المشروع local-first.
- [x] تحذير من نشر مفاتيح API في Issues.
- [x] توضيح الفرق بين Web وTauri في حفظ المفاتيح.
- [x] طريقة تشغيل الاختبارات.
- [x] طريقة إضافة ترجمة جديدة.
- [x] طريقة إضافة مزود AI جديد.

### شروط القبول

- مساهم جديد يستطيع تشغيل المشروع وفتح PR من خلال التعليمات فقط.
- سياسة الأمان واضحة ومختصرة.
- خارطة الطريق لا تعد بما لا نستطيع تنفيذه.

---

## المرحلة 3: README وتجربة أول دقيقة

### README

- [x] تحديث وصف المشروع بالإنجليزية والعربية.
- [x] إضافة عنوان واضح:
  - `Local-first Arabic/English prompt engineering workspace`
- [x] إضافة صور أو placeholders للصور.
- [x] إضافة Quick Start.
- [x] إضافة Demo Mode.
- [x] إضافة Web vs Desktop table.
- [x] إضافة Privacy section.
- [x] إضافة Architecture مختصرة.
- [x] إضافة Contributing section.
- [x] إضافة Roadmap مختصر.

### تجربة المستخدم

- [x] المستخدم يعرف كيف يبدأ بدون API key عبر demo mode.
- [x] الإعدادات مفهومة.
- [x] رسالة CORS مفهومة في المتصفح.
- [x] رسالة Tauri/desktop واضحة.
- [x] أول prompt final يمكن نسخه بسهولة.

### شروط القبول

- يمكن فهم المشروع من README فقط.
- يمكن تشغيله خلال 5 دقائق.
- يمكن تجربته بدون مزود حقيقي.

---

## المرحلة 4: تحسين المنتج

### Demo Mode

- [x] تحقق أن `demo` يعمل بلا اتصال خارجي.
- [x] أضف زر أو خيار واضح لتفعيل demo mode.
- [x] أضف رسالة توضح أن demo لا يستخدم مزود AI حقيقي.
- [x] أضف بيانات مثال جيدة بالعربية والإنجليزية.

### Prompt Workflow

- [x] تحسين `ask_questions` لأسئلة مختصرة ومفيدة.
- [x] تحسين `suggest_enhancements` لخيارات قابلة للفهم.
- [x] تحسين `propose_prompt` لنسخة نهائية منظمة.
- [x] إضافة زر Copy واضح.
- [x] إضافة Save to favorites.
- [x] إضافة Export prompt.

### Multi-provider

- [x] مراجعة قائمة المزودين.
- [x] إضافة provider presets واضحة.
- [x] إضافة custom provider docs.
- [x] توضيح أن بعض المزودين قد لا يسمحون بالنداء من المتصفح بسبب CORS.

### الملفات

- [x] اختبار PDF صغير.
- [x] اختبار DOCX صغير.
- [x] توضيح حدود حجم الملفات.
- [x] إضافة تحذير الخصوصية: الملفات تحلل محليا في المتصفح.

### شروط القبول

- تجربة الاستخدام لا تتطلب معرفة تقنية عالية.
- لا يتم كسر static export.
- لا يتم إضافة backend.

---

## المرحلة 5: CI والاختبارات

### package scripts

- [x] إضافة `typecheck`:
  - `tsc --noEmit`
- [x] التأكد من `lint` يعمل أو تحديثه إذا `next lint` deprecated لاحقا.
- [x] التأكد من `test:unit`.
- [x] التأكد من `build`.

### GitHub Actions

- [x] workflow للويب:
  - checkout
  - setup node
  - npm ci
  - lint
  - typecheck
  - test:unit
  - build
- [x] workflow اختياري Playwright smoke.
- [x] workflow اختياري desktop build عند tags فقط، مع تخطي beta tags وفحص مبكر لسر توقيع Tauri.

### اختبارات وحدة

- [x] chat stream parser.
- [x] format validator.
- [x] error classification.
- [x] providers.
- [x] import/export utils.
- [x] token estimate.
- [x] text diff.

### اختبارات واجهة

- [x] `/ar` يعمل.
- [x] `/en` يعمل.
- [x] settings dialog.
- [x] demo message.
- [x] language switch.
- [x] prompt proposal copy/save.
- [x] file upload smoke إن أمكن.

### شروط القبول

- CI الأساسي أخضر بدون أسرار؛ بناء سطح المكتب الموقّع يتطلب أسرار Tauri صحيحة ولا يدخل بوابة التقديم الحالية.
- الاختبارات لا تحتاج API key.
- build ينجح.

---

## المرحلة 6: الأمان والخصوصية

### فحص حساس

- [x] عدم طباعة API key في console.
- [x] عدم حفظ API key في localStorage داخل Tauri: فشل Keychain لا يفعّل fallback محلي في تطبيق سطح المكتب.
- [x] عدم إرسال الملفات إلى خادم المشروع.
- [x] عدم وجود telemetry افتراضي.
- [x] عدم وجود مفاتيح أو أسرار في repo.
- [x] `.gitignore` يغطي `.env`, build outputs, Tauri secrets, logs.
- [x] توثيق نتيجة التدقيق في `docs/oss-grant-readiness/security-privacy-audit.md`.

### وثائق

- [x] `docs/PRIVACY.md`
- [x] `SECURITY.md`
- [x] قسم Privacy في README.

### شروط القبول

- المستخدم يفهم أين تذهب بياناته.
- المساهم يعرف كيف يبلغ عن ثغرة.
- لا توجد مفاتيح أو أسرار في السجل الحالي قدر الإمكان.

---

## المرحلة 7: المجتمع والمساهمات

### Issues مقترحة

- [x] Add provider preset for OpenRouter.
- [x] Improve Arabic prompt proposal templates.
- [x] Add screenshot/GIF to README.
- [x] Add English README mirror.
- [x] Add Playwright demo-mode test.
- [x] Add provider CORS troubleshooting guide.
- [x] Add prompt template import/export.
- [x] Add accessibility audit.
- [x] Add offline PWA support.
- [x] Add desktop release documentation.

### Labels

- [x] good first issue
- [x] help wanted
- [x] documentation
- [x] i18n
- [x] privacy
- [x] testing
- [x] desktop
- [x] provider
- [x] accessibility

### شروط القبول

- يوجد على الأقل 8 issues مناسبة للمساهمين.
- يوجد 3 مهام `good first issue` لا تحتاج معرفة عميقة.
- يوجد Roadmap واضح.

---

## المرحلة 8: الإصدار العام

### قبل الإصدار

- [x] حسم رقم الإصدار: `0.3.0-beta.1`.
- [x] تحديث CHANGELOG.
- [x] تشغيل كل الاختبارات.
- [x] تشغيل build.
- [x] التقاط صور/فيديو demo.
- [x] التأكد من README.
- [x] التأكد من LICENSE.
- [x] التأكد من SECURITY.

### Release notes template

```text
Muharrir vX.Y.Z

Highlights:
- Local-first Arabic/English prompt engineering workspace.
- Demo mode for first-time users.
- Web and desktop-ready architecture.
- Multi-provider OpenAI-compatible settings.
- PDF/DOCX parsing in the browser.

Verification:
- lint passed
- typecheck passed
- unit tests passed
- production build passed
```

### شروط القبول

- Release واضح ومفهوم.
- لا توجد أسرار.
- روابط README تعمل.

---

## المرحلة 9: التقديم للمنحة

### قبل التقديم

- [ ] المستودع Public: تحقق GitHub الحالي لا يزال `PRIVATE`.
- [x] الرخصة مفتوحة.
- [x] README مقنع.
- [x] CI أخضر: آخر تشغيل `CI` على `master` نجح في 2026-07-08.
- [x] Release موجود: `v0.3.0-beta.1` منشور كـ prerelease مع demo assets، وليس desktop installers.
- [x] Demo أو screenshots موجودة.
- [x] Issues للمساهمين موجودة.
- [x] Roadmap موجود.
- [x] وصف قصير وطويل جاهز.

### مواد التقديم

- [x] وصف 300 حرف.
- [x] وصف 1000 حرف.
- [x] خطة 6 أشهر.
- [x] أثر المشروع على OSS.
- [x] لماذا Arabic-first مهم.
- [x] كيف يساعد المطورين.
- [x] لماذا يحتاج دعم أدوات AI.

### شروط القبول الذاتية

لا تقدم إذا بقي واحد من التالي:

- رخصة متعارضة.
- مستودع خاص.
- README قديم أو غير واضح.
- لا يوجد build ناجح.
- لا توجد طريقة تجربة بدون مفتاح.
- لا توجد وثائق خصوصية.
- المستودع لا يزال خاصا إذا كان البرنامج يشترط رابط OSS عاما.

---

## مؤشر الجاهزية

امنح المشروع درجة من 100 قبل التقديم:

| البند | النقاط |
|---|---:|
| رخصة وOSS governance | 15 |
| README وتموضع | 15 |
| تجربة أول استخدام | 15 |
| CI واختبارات | 15 |
| خصوصية وأمان | 15 |
| Demo/Screenshots/Release | 10 |
| Community readiness | 10 |
| Roadmap وطلب منحة | 5 |

لا تقدم قبل الوصول إلى **85/100** على الأقل.
