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

- [ ] تحديد هل سنفتح المستودع الحالي أم ننشئ نسخة عامة جديدة.
- [ ] تحديد الرخصة: MIT أو Apache-2.0.
- [ ] تحديد هل سيبقى الاسم `muharrir` أم يستخدم اسم عرض `Muharrir` فقط.
- [ ] تحديد هل ننشر نسخة Desktop release الآن أم لاحقا.
- [ ] تحديد هل نحتاج Demo URL أم يكفي local + screenshots.
- [ ] تحديد هل نستخدم شعار/أيقونة المشروع الحالية أم نحدثها.

قرار موصى به:

- افتح المستودع الحالي فقط بعد تنظيف الرخصة والخصوصية.
- استخدم MIT إذا كان الهدف تبني واسع وسرعة قبول مساهمات.
- استخدم Apache-2.0 إذا كنت تريد صياغة مؤسسية أقوى.

---

## المرحلة 1: تنظيف الرخصة والهوية

### مهام

- [ ] مراجعة `LICENSE` الحالي.
- [ ] إصلاح التعارض بين README وLICENSE.
- [ ] تحديث `package.json`:
  - [ ] تغيير `name` من `app` إلى `muharrir` أو `@3ssiri/muharrir` إذا كان سينشر لاحقا.
  - [ ] مراجعة `private: true`.
  - [ ] إضافة description مناسب.
  - [ ] إضافة repository, license, keywords.
- [ ] البحث عن أي نص `proprietary`, `confidential`, `all rights reserved`.
- [ ] حذف أو تعديل النصوص المغلقة إذا كان القرار فتح المصدر.
- [ ] إضافة `NOTICE` إذا لزم.

### شروط القبول

- لا يوجد تعارض بين README وLICENSE.
- أي شخص يزور المستودع يفهم الرخصة خلال 10 ثوان.
- لا توجد صياغة قانونية متناقضة.

---

## المرحلة 2: ملفات الحوكمة المفتوحة المصدر

### ملفات مطلوبة

- [ ] `CONTRIBUTING.md`
- [ ] `SECURITY.md`
- [ ] `CODE_OF_CONDUCT.md`
- [ ] `CHANGELOG.md`
- [ ] `docs/ROADMAP.md`
- [ ] `docs/PRIVACY.md`
- [ ] `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] `.github/ISSUE_TEMPLATE/bug_report.yml`
- [ ] `.github/ISSUE_TEMPLATE/feature_request.yml`
- [ ] `.github/ISSUE_TEMPLATE/documentation.yml`

### محتوى مهم

- [ ] شرح أن المشروع local-first.
- [ ] تحذير من نشر مفاتيح API في Issues.
- [ ] توضيح الفرق بين Web وTauri في حفظ المفاتيح.
- [ ] طريقة تشغيل الاختبارات.
- [ ] طريقة إضافة ترجمة جديدة.
- [ ] طريقة إضافة مزود AI جديد.

### شروط القبول

- مساهم جديد يستطيع تشغيل المشروع وفتح PR من خلال التعليمات فقط.
- سياسة الأمان واضحة ومختصرة.
- خارطة الطريق لا تعد بما لا نستطيع تنفيذه.

---

## المرحلة 3: README وتجربة أول دقيقة

### README

- [ ] تحديث وصف المشروع بالإنجليزية والعربية.
- [ ] إضافة عنوان واضح:
  - `Local-first Arabic/English prompt engineering workspace`
- [ ] إضافة صور أو placeholders للصور.
- [ ] إضافة Quick Start.
- [ ] إضافة Demo Mode.
- [ ] إضافة Web vs Desktop table.
- [ ] إضافة Privacy section.
- [ ] إضافة Architecture مختصرة.
- [ ] إضافة Contributing section.
- [ ] إضافة Roadmap مختصر.

### تجربة المستخدم

- [ ] المستخدم يعرف كيف يبدأ بدون API key عبر demo mode.
- [ ] الإعدادات مفهومة.
- [ ] رسالة CORS مفهومة في المتصفح.
- [ ] رسالة Tauri/desktop واضحة.
- [ ] أول prompt final يمكن نسخه بسهولة.

### شروط القبول

- يمكن فهم المشروع من README فقط.
- يمكن تشغيله خلال 5 دقائق.
- يمكن تجربته بدون مزود حقيقي.

---

## المرحلة 4: تحسين المنتج

### Demo Mode

- [ ] تحقق أن `demo` يعمل بلا اتصال خارجي.
- [ ] أضف زر أو خيار واضح لتفعيل demo mode.
- [ ] أضف رسالة توضح أن demo لا يستخدم مزود AI حقيقي.
- [ ] أضف بيانات مثال جيدة بالعربية والإنجليزية.

### Prompt Workflow

- [ ] تحسين `ask_questions` لأسئلة مختصرة ومفيدة.
- [ ] تحسين `suggest_enhancements` لخيارات قابلة للفهم.
- [ ] تحسين `propose_prompt` لنسخة نهائية منظمة.
- [ ] إضافة زر Copy واضح.
- [ ] إضافة Save to favorites.
- [ ] إضافة Export prompt.

### Multi-provider

- [ ] مراجعة قائمة المزودين.
- [ ] إضافة provider presets واضحة.
- [ ] إضافة custom provider docs.
- [ ] توضيح أن بعض المزودين قد لا يسمحون بالنداء من المتصفح بسبب CORS.

### الملفات

- [ ] اختبار PDF صغير.
- [ ] اختبار DOCX صغير.
- [ ] توضيح حدود حجم الملفات.
- [ ] إضافة تحذير الخصوصية: الملفات تحلل محليا في المتصفح.

### شروط القبول

- تجربة الاستخدام لا تتطلب معرفة تقنية عالية.
- لا يتم كسر static export.
- لا يتم إضافة backend.

---

## المرحلة 5: CI والاختبارات

### package scripts

- [ ] إضافة `typecheck`:
  - `tsc --noEmit`
- [ ] التأكد من `lint` يعمل أو تحديثه إذا `next lint` deprecated لاحقا.
- [ ] التأكد من `test:unit`.
- [ ] التأكد من `build`.

### GitHub Actions

- [ ] workflow للويب:
  - checkout
  - setup node
  - npm ci
  - lint
  - typecheck
  - test:unit
  - build
- [ ] workflow اختياري Playwright smoke.
- [ ] workflow اختياري desktop build عند tags فقط.

### اختبارات وحدة

- [ ] chat stream parser.
- [ ] format validator.
- [ ] error classification.
- [ ] providers.
- [ ] import/export utils.
- [ ] token estimate.
- [ ] text diff.

### اختبارات واجهة

- [ ] `/ar` يعمل.
- [ ] `/en` يعمل.
- [ ] settings dialog.
- [ ] demo message.
- [ ] language switch.
- [ ] prompt proposal copy/save.
- [ ] file upload smoke إن أمكن.

### شروط القبول

- CI أخضر بدون أسرار.
- الاختبارات لا تحتاج API key.
- build ينجح.

---

## المرحلة 6: الأمان والخصوصية

### فحص حساس

- [ ] عدم طباعة API key في console.
- [ ] عدم حفظ API key في localStorage داخل Tauri.
- [ ] عدم إرسال الملفات إلى خادم المشروع.
- [ ] عدم وجود telemetry افتراضي.
- [ ] عدم وجود مفاتيح أو أسرار في repo.
- [ ] `.gitignore` يغطي `.env`, build outputs, Tauri secrets, logs.

### وثائق

- [ ] `docs/PRIVACY.md`
- [ ] `SECURITY.md`
- [ ] قسم Privacy في README.

### شروط القبول

- المستخدم يفهم أين تذهب بياناته.
- المساهم يعرف كيف يبلغ عن ثغرة.
- لا توجد مفاتيح أو أسرار في السجل الحالي قدر الإمكان.

---

## المرحلة 7: المجتمع والمساهمات

### Issues مقترحة

- [ ] Add provider preset for OpenRouter.
- [ ] Improve Arabic prompt proposal templates.
- [ ] Add screenshot/GIF to README.
- [ ] Add English README mirror.
- [ ] Add Playwright demo-mode test.
- [ ] Add provider CORS troubleshooting guide.
- [ ] Add prompt template import/export.
- [ ] Add accessibility audit.
- [ ] Add offline PWA support.
- [ ] Add desktop release documentation.

### Labels

- [ ] good first issue
- [ ] help wanted
- [ ] documentation
- [ ] i18n
- [ ] privacy
- [ ] testing
- [ ] desktop
- [ ] provider
- [ ] accessibility

### شروط القبول

- يوجد على الأقل 8 issues مناسبة للمساهمين.
- يوجد 3 مهام `good first issue` لا تحتاج معرفة عميقة.
- يوجد Roadmap واضح.

---

## المرحلة 8: الإصدار العام

### قبل الإصدار

- [ ] حسم رقم الإصدار.
- [ ] تحديث CHANGELOG.
- [ ] تشغيل كل الاختبارات.
- [ ] تشغيل build.
- [ ] التقاط صور/GIF.
- [ ] التأكد من README.
- [ ] التأكد من LICENSE.
- [ ] التأكد من SECURITY.

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

- [ ] المستودع Public.
- [ ] الرخصة مفتوحة.
- [ ] README مقنع.
- [ ] CI أخضر.
- [ ] Release موجود.
- [ ] Demo أو screenshots موجودة.
- [ ] Issues للمساهمين موجودة.
- [ ] Roadmap موجود.
- [ ] وصف قصير وطويل جاهز.

### مواد التقديم

- [ ] وصف 300 حرف.
- [ ] وصف 1000 حرف.
- [ ] خطة 6 أشهر.
- [ ] أثر المشروع على OSS.
- [ ] لماذا Arabic-first مهم.
- [ ] كيف يساعد المطورين.
- [ ] لماذا يحتاج دعم أدوات AI.

### شروط القبول الذاتية

لا تقدم إذا بقي واحد من التالي:

- رخصة متعارضة.
- مستودع خاص.
- README قديم أو غير واضح.
- لا يوجد build ناجح.
- لا توجد طريقة تجربة بدون مفتاح.
- لا توجد وثائق خصوصية.

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
