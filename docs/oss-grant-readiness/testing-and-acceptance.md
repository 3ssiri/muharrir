# الاختبارات وضوابط القبول لمحرر

## الهدف

هذا الملف يحدد كيف نعرف أن Muharrir جاهز للنشر المفتوح والتقديم للمنح. لا يكفي أن يعمل محليا على جهاز واحد. يجب أن يكون قابلا للتشغيل، الاختبار، البناء، والمراجعة من طرف خارجي.

## مبدأ الاختبار

- لا تعتمد الاختبارات على مفاتيح API حقيقية.
- لا تعتمد الاختبارات على مزود خارجي.
- لا ترسل ملفات المستخدم إلى خادم.
- لا تكسر static export.
- لا تكسر Tauri.
- لا تكسر العربية أو RTL.

## أوامر التحقق الأساسية

ينبغي أن تعمل هذه الأوامر قبل أي تقديم:

```bash
npm install
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

إذا كان `typecheck` غير موجود، أضفه إلى `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

اختبارات Playwright:

```bash
npm run dev
npm test
```

## مصفوفة القبول

| المجال | شرط القبول | أداة التحقق |
|---|---|---|
| التثبيت | `npm install` ينجح | محلي/CI |
| Lint | لا توجد أخطاء lint | `npm run lint` |
| TypeScript | لا توجد أخطاء typecheck | `npm run typecheck` |
| Unit tests | كل اختبارات الوحدة تمر | `npm run test:unit` |
| Build | static export ينجح | `npm run build` |
| العربية | `/ar` يفتح وRTL صحيح | Playwright/manual |
| الإنجليزية | `/en` يفتح وLTR صحيح | Playwright/manual |
| Demo mode | يعمل بدون API key حقيقي | unit/e2e/manual |
| الخصوصية | لا يوجد تسريب API key | code review |
| Desktop | Tauri behavior موثق ولا ينكسر | manual/CI عند الإمكان |

## اختبارات وحدة مطلوبة

### chat-stream

اختبر:

- استقبال chunk نصي.
- استقبال tool call.
- استقبال tool result.
- استقبال error event.
- التعامل مع chunk ناقص أو غير صالح.
- عدم انهيار الواجهة عند خطأ غير معروف.

### error classification

اختبر:

- 401 => auth.
- 429 => quota.
- 404 model/provider => server أو config.
- Network/CORS => network.
- 5xx => server.
- unknown => unknown.

### provider handling

اختبر:

- provider preset صحيح.
- custom provider يحفظ baseUrl/model.
- لا يتم طباعة API key.
- demo mode لا يستخدم fetch خارجي.

### settings import/export

اختبر:

- export settings بدون أسرار غير مقصودة.
- import settings لا يكسر state.
- invalid JSON يعطي رسالة مفهومة.

### file parsing helpers

اختبر بملفات صغيرة جدا أو mocks:

- PDF parse returns text.
- DOCX parse returns text.
- unsupported file type يعطي خطأ واضح.
- oversized file warning إن وجدت.

## اختبارات واجهة مقترحة

### smoke: Arabic home

- افتح `/ar`.
- تحقق من وجود عنوان التطبيق.
- تحقق من `dir=rtl` أو سلوك RTL.
- افتح الإعدادات.
- أغلق الإعدادات.

### smoke: English home

- افتح `/en`.
- تحقق من LTR.
- افتح language switch.
- بدّل للعربية.

### demo prompt flow

- فعّل demo mode.
- اكتب فكرة غامضة.
- أرسل.
- تحقق أن التطبيق يعرض سؤالا أو اقتراح تحسين أو prompt نهائي.
- انسخ النتيجة.
- احفظها في المفضلة.

### settings flow

- افتح settings.
- أدخل baseUrl وهمي.
- أدخل model.
- احفظ.
- أعد فتح settings وتأكد من القيم.

### file upload flow

- ارفع ملف نصي/صغير إن كانت الواجهة تسمح.
- تحقق أن النص المستخرج يظهر أو يدخل في السياق.
- لا تعتمد على ملف كبير في CI.

## مراجعة الأمان

قبل النشر:

- [ ] ابحث عن `console.log` يطبع أسرار.
- [ ] ابحث عن `localStorage` لمفتاح API داخل Tauri.
- [ ] ابحث عن `dangerouslySetInnerHTML` وتأكد من عدم إدخال محتوى مستخدم غير منظف.
- [ ] راجع أي use of external URLs.
- [ ] تأكد من أن upload parsing محلي.
- [ ] راجع `.gitignore` للأسرار.
- [ ] تأكد من عدم وجود `.env` في المستودع.

أوامر بحث مقترحة:

```bash
rg "console\.log|apiKey|API_KEY|localStorage|dangerouslySetInnerHTML|innerHTML|eval\(" src src-tauri
rg "\.env|secret|private key|token" .
```

## مراجعة الخصوصية

يجب أن تكون هذه الإجابات واضحة في README أو docs/PRIVACY.md:

1. أين تخزن المحادثات؟
2. أين يخزن مفتاح API في المتصفح؟
3. أين يخزن مفتاح API في Tauri؟
4. هل يرسل المشروع بيانات إلى خادم خاص بالمشروع؟
5. ماذا يحدث عند رفع PDF أو DOCX؟
6. ما حدود CORS في نسخة المتصفح؟
7. كيف يحذف المستخدم بياناته؟

## ضوابط عدم كسر Tauri

أي تعديل يجب أن يراعي:

- `output: 'export'` في Next.js.
- عدم إضافة API routes.
- عدم إضافة middleware.
- حماية أي Tauri API بـ `isTauriApp()`.
- بديل browser لأي وظيفة Tauri.
- عدم الاعتماد على Node APIs في client components.

## ضوابط i18n وRTL

أي نص جديد:

- يجب أن يضاف إلى `src/i18n/locales/ar.json` و`en.json`.
- لا تكتب نصا ظاهرا hardcoded في JSX إلا عند الضرورة.
- استخدم Tailwind logical properties قدر الإمكان.
- اختبر `/ar` بعد أي تغيير UI.

## مراجعة الأداء

قبل النشر:

- [ ] لا يتم تحميل مكتبات ثقيلة إلا عند الحاجة.
- [ ] PDF/DOCX parsing لا يتسبب في تجميد طويل دون رسالة loading.
- [ ] المحادثات الطويلة لا تجعل الواجهة غير قابلة للاستخدام.
- [ ] IndexedDB operations لا تفشل بصمت.

## قابلية القبول كمنحة

راجع هذه الأسئلة قبل التقديم:

1. هل المشروع مفتوح المصدر فعلا؟
2. هل المشكلة التي يحلها واضحة؟
3. هل له فئة مستخدمين محددة؟
4. هل له تميز واضح؟
5. هل يمكن تجربته بسرعة؟
6. هل توجد اختبارات؟
7. هل توجد مساهمات أو على الأقل بيئة مساهمة جاهزة؟
8. هل توجد خطة 6 أشهر؟
9. هل الخصوصية واضحة؟
10. هل المشروع يبدو قابلا للنمو وليس مجرد تجربة شخصية؟

## تقرير الجاهزية النهائي

قبل التقديم، أنشئ تقريرا بعنوان:

`docs/oss-grant-readiness/final-readiness-review.md`

يحتوي:

- الدرجة من 100.
- ماذا اكتمل.
- ماذا بقي.
- هل ننصح بالتقديم الآن؟
- أكبر 5 مخاطر للرفض.
- أكبر 5 نقاط قوة.
- رابط الإصدار.
- رابط demo أو screenshots.
- حالة CI.

## حدود دنيا للتقديم

لا تقدم إذا:

- الرخصة متعارضة.
- المستودع خاص.
- README لا يشرح المشروع بوضوح.
- لا يوجد build ناجح.
- لا توجد تجربة demo.
- لا توجد وثائق خصوصية.
- لا توجد طريقة مساهمة.

يمكن التقديم إذا:

- كل ما سبق محلول.
- المشروع Public.
- هناك release واضح.
- هناك screenshots أو demo.
- CI أخضر.
- توجد خطة 6 أشهر.
