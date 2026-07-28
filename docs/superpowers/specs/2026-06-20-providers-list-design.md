# تصميم: تحديث قائمة المزوّدات + إضافة مزوّد يدويًّا

- **التاريخ:** 2026-06-20
- **الحالة:** معتمد (بانتظار مراجعة المواصفات)

## السياق والمشكلة

- قائمة `availableModels` في [store.ts](../../../src/lib/store.ts) ثابتة وقديمة (17 نموذجًا، كثير منها متقادم: `o1`، `claude-3-5-sonnet-20241022`، `yi-lightning`، `GLM-4-Plus`…).
- لا يوجد مفهوم «مزوّد» في الكود — فقط `baseUrl` + قائمة نماذج مسطّحة.
- [settings-dialog.tsx](../../../src/components/settings-dialog.tsx) فيه دالة `applyPreset` (3 مزوّدات) **غير مستخدَمة إطلاقًا** في الواجهة، وبروكسي طرف ثالث قديم داخل `TEST_CONFIG`.
- لا توجد طريقة لإضافة مزوّد جديد وحفظه لإعادة الاستخدام.

## الأهداف

1. كتالوج محدّث للمزوّدات الأكثر انتشارًا (متوافقة مع OpenAI) مع إعداداتها (Base URL + نماذج مقترحة).
2. اختيار مزوّد من القائمة يملأ الإعدادات تلقائيًّا (Base URL + النماذج + النموذج الافتراضي).
3. **إضافة مزوّد يدويًّا وحفظه محليًّا** ليظهر في القائمة لإعادة الاستخدام، مع إمكانية حذفه.
4. تنظيف الكود القديم (`applyPreset`، بروكسي الطرف الثالث القديم).

## غير الأهداف (YAGNI)

- إعادة هيكلة تدفّق الدردشة أو الاستيراد/التصدير.
- جعل `providerId` مصدر الحقيقة — يبقى `baseUrl` هو الأساس الذي يُرسَل للـ API.
- مزامنة المزوّدات المخصّصة عبر الأجهزة (محلي فقط).

## التصميم

### ١) بنية البيانات — `src/lib/providers.ts` (ملف جديد)

```ts
export interface Provider {
  id: string
  name: string
  baseUrl: string
  models: string[]   // نماذج مقترحة فقط؛ «اختبار الاتصال» يجلب القائمة الحيّة
  docsUrl?: string   // رابط الحصول على مفتاح API (اختياري)
  isLocal?: boolean  // محلي (Ollama/LM Studio) — لا يحتاج مفتاحًا
}

export const BUILTIN_PROVIDERS: Provider[] = [ /* 15 مزوّدًا أدناه */ ]
```

الكتالوج المدمج (النماذج اقتراحات قابلة للتعديل، والروابط متوافقة مع OpenAI):

| id | الاسم | Base URL | نماذج مقترحة |
|---|---|---|---|
| `openai` | OpenAI | `https://api.openai.com/v1` | gpt-4o, gpt-4o-mini, gpt-4.1, gpt-4.1-mini, o3, o4-mini |
| `anthropic` | Anthropic (Claude) | `https://api.anthropic.com/v1` | claude-opus-4, claude-sonnet-4, claude-3-5-haiku |
| `google` | Google (Gemini) | `https://generativelanguage.googleapis.com/v1beta/openai` | gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash |
| `deepseek` | DeepSeek | `https://api.deepseek.com` | deepseek-chat, deepseek-reasoner |
| `xai` | xAI (Grok) | `https://api.x.ai/v1` | grok-4, grok-3, grok-3-mini |
| `openrouter` | OpenRouter | `https://openrouter.ai/api/v1` | openai/gpt-4o, anthropic/claude-sonnet-4, google/gemini-2.5-pro |
| `huggingface` | Hugging Face | `https://router.huggingface.co/v1` | meta-llama/Llama-3.3-70B-Instruct, Qwen/Qwen2.5-72B-Instruct, deepseek-ai/DeepSeek-V3 |
| `nvidia` | NVIDIA NIM | `https://integrate.api.nvidia.com/v1` | nvidia/llama-3.1-nemotron-70b-instruct, meta/llama-3.3-70b-instruct, deepseek-ai/deepseek-r1 |
| `groq` | Groq | `https://api.groq.com/openai/v1` | llama-3.3-70b-versatile, llama-3.1-8b-instant |
| `mistral` | Mistral | `https://api.mistral.ai/v1` | mistral-large-latest, mistral-small-latest |
| `qwen` | Alibaba (Qwen) | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` | qwen-max, qwen-plus, qwen-turbo |
| `moonshot` | Moonshot (Kimi) | `https://api.moonshot.ai/v1` | kimi-k2, moonshot-v1-128k |
| `zhipu` | Zhipu (GLM) | `https://open.bigmodel.cn/api/paas/v4` | glm-4.6, glm-4-plus, glm-4-air |
| `ollama` | Ollama (محلي) | `http://localhost:11434/v1` | (محلي — يُجلب عبر اختبار الاتصال) |
| `lmstudio` | LM Studio (محلي) | `http://localhost:1234/v1` | (محلي — يُجلب عبر اختبار الاتصال) |

`ollama` و`lmstudio`: `models: []` و`isLocal: true`.

### ٢) تغييرات `store.ts`

- إضافة (محفوظة في localStorage عبر `persist` الحالي):
  - `customProviders: Provider[]` (افتراضي `[]`).
  - `addCustomProvider(p: Provider)` — يضيف، أو يستبدل عند تطابق `id`.
  - `removeCustomProvider(id: string)`.
- استبدال قائمة `availableModels` الافتراضية القديمة (17) بنماذج المزوّد الافتراضي DeepSeek: `['deepseek-chat', 'deepseek-reasoner']`، ومواءمة `model` الافتراضي إلى `deepseek-chat` (بدل `deepseek-v3.2-exp`) ليتطابق مع المزوّد الافتراضي والقائمة الجديدة.
- **توافق خلفي:** إضافة `customProviders` آمنة (الدمج السطحي في `persist` يستخدم الافتراضي `[]` للحالة المحفوظة القديمة التي تفتقده). قائمة `availableModels` المحفوظة قديمًا تبقى حتى يختار المستخدم مزوّدًا أو يختبر الاتصال — سلوك غير كاسر.

### ٣) الواجهة — `settings-dialog.tsx` (تبويب «الاتصال»)

- **قائمة «المزوّد»** أعلى حقل Base URL:
  - خياراتها: `BUILTIN_PROVIDERS` + `customProviders` + عنصر **«➕ إضافة مزوّد يدويًّا»**.
  - القيمة المعروضة تُشتقّ بمطابقة `localConfig.baseUrl` (مُطبَّعًا: حذف `/` الأخير) مع قائمة المزوّدات؛ إن لم تطابق شيئًا → تُعرض «مخصّص».
  - عند اختيار مزوّد `p`: `setLocalConfig({ ...localConfig, baseUrl: p.baseUrl, model: p.models[0] ?? localConfig.model })` + `setAvailableModels(p.models)`.
- **«➕ إضافة مزوّد يدويًّا»** يكشف نموذجًا (حالة محليّة في المكوّن):
  - حقول: **الاسم** (إلزامي)، **Base URL** (إلزامي)، **النماذج** (اختياري، نصّ مفصول بفواصل).
  - زر **«حفظ المزوّد»**: ينشئ `Provider` بـ `id = \`custom-${Date.now()}\``، ويستدعي `addCustomProvider`، ثم يختاره (يملأ الحقول).
  - زر **«إلغاء»**.
- عند اختيار مزوّد **مخصّص محفوظ**: يظهر زر **«حذف المزوّد»** (✕) ← `removeCustomProvider`.
- الحقول الحالية (Base URL، مفتاح API، النموذج) تبقى كما هي للتعديل/التجاوز اليدوي المباشر؛ ومنتقي المزوّد طبقة راحة فوقها لا بديل عنها.

### ٤) التنظيف

- حذف دالة `applyPreset` غير المستخدمة.
- إزالة بروكسي الطرف الثالث القديم: حذف كائن `TEST_CONFIG` ودالة `loadTestConfig` وزرّ «testPreset» (يُغني عنها منتقي المزوّد). وضع `demo` (apiKey = `'demo'`) يبقى عاملًا عبر كتابة المفتاح يدويًّا (منطقه في `chat-client.ts` لا يتغيّر).

### ٥) الترجمة (ar/en)

مفاتيح جديدة تحت `settings`: `provider`، `addProviderManually`، `providerName`، `providerModels`، `saveProvider`، `deleteProvider`، `customProvider`. (نعيد استخدام `settings.baseUrl` و`settings.apiKey` القائمَين.)

## الملفات المتأثّرة

- **جديد:** `src/lib/providers.ts`
- **تعديل:** `src/lib/store.ts` · `src/components/settings-dialog.tsx` · `src/i18n/locales/ar.json` · `src/i18n/locales/en.json`

## التحقّق

- `npm run build` (تصدير ثابت) أخضر.
- `npm run lint` أخضر.
- يدويًّا: اختيار مزوّد يملأ Base URL/النماذج؛ إضافة مزوّد يدويًّا يُحفظ ويبقى بعد إعادة فتح النافذة/التطبيق؛ حذف مزوّد مخصّص يعمل؛ التعديل اليدوي لـ Base URL ما زال ممكنًا ويعرض «مخصّص».
