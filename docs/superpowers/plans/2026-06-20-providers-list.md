# Providers List + Manual Provider — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** استبدال قائمة النماذج القديمة بكتالوج 15 مزوّدًا متوافقًا مع OpenAI، مع منتقي مزوّد في الإعدادات وإمكانية إضافة مزوّد يدويًّا وحفظه.

**Architecture:** كتالوج ثابت في `src/lib/providers.ts` + مزوّدات مخصّصة محفوظة في متجر Zustand (localStorage). منتقي المزوّد في تبويب «الاتصال» يملأ `baseUrl`/النماذج/النموذج؛ الحقول اليدوية تبقى للتجاوز. لا تغيير في تدفّق الدردشة (`baseUrl` يبقى مصدر الحقيقة للـ API).

**Tech Stack:** Next.js 14 (static export) · TypeScript · Zustand (persist) · shadcn/ui (Select/Input/Button) · next-intl.

**ملاحظة عن الاختبارات:** لا يوجد مُشغِّل اختبارات وحدة في المشروع (Playwright E2E فقط، ويتطلّب خادم تطوير). لذا التحقّق لكل مهمة عبر `npm run build` (فحص أنواع TypeScript كامل) و`npm run lint`، مع قائمة تحقّق يدوية في المهمة الأخيرة. **لا نُضيف إطار اختبارات جديدًا** (قيد المشروع — راجع CLAUDE.md).

**التنفيذ:** على فرع `master` الحالي (سير عمل المستخدم المعتمد)، بلا worktree.

---

## File Structure

| الملف | المسؤولية | الإجراء |
|---|---|---|
| `src/lib/providers.ts` | كتالوج المزوّدات + دوال البحث/التطبيع | إنشاء |
| `src/lib/store.ts` | حالة `customProviders` + إجراءاتها + تحديث الافتراضيات | تعديل |
| `src/i18n/locales/ar.json`, `en.json` | مفاتيح ترجمة منتقي المزوّد | تعديل |
| `src/components/settings-dialog.tsx` | منتقي المزوّد + نموذج الإضافة اليدوية + الحذف + تنظيف الكود الميت | تعديل |

---

## Task 0: التزام عمل قسم «حول» المعلّق (تنظيف شجرة العمل)

قسم «حول» مكتمل ومُتحقَّق منه لكنه غير ملتزَم بعد. التزمه أولًا حتى تبدأ مهام المزوّدات بشجرة عمل نظيفة.

**Files:** (معدّلة سابقًا) `settings-dialog.tsx`, `tauri-bridge.ts`, `lib.rs`, `Cargo.toml`, `capabilities/default.json`, `package.json`, `package-lock.json`, `ar.json`, `en.json`.

- [ ] **Step 1: تأكّد من الملفات المعدّلة**

Run: `git status --short`
Expected: تظهر ملفات قسم «حول» المذكورة أعلاه كـ modified (M) دون غيرها.

- [ ] **Step 2: التزِم**

```bash
git add -A
git commit -m "feat(about): تبويب «حول» (حقوق النشر + البريد + الموقع) مع فتح روابط خارجية عبر opener"
```

---

## Task 1: كتالوج المزوّدات `src/lib/providers.ts`

**Files:**
- Create: `src/lib/providers.ts`

- [ ] **Step 1: أنشئ الملف بالمحتوى الكامل**

```ts
// كتالوج المزوّدات المتوافقة مع OpenAI + أدوات البحث عنها.
// النماذج هنا اقتراحات للبدء؛ «اختبار الاتصال» يجلب القائمة الحيّة من /models.

export interface Provider {
  id: string
  name: string
  baseUrl: string
  models: string[]
  docsUrl?: string   // رابط الحصول على مفتاح API (اختياري)
  isLocal?: boolean  // محلي (Ollama/LM Studio) — لا يحتاج مفتاحًا
}

export const BUILTIN_PROVIDERS: Provider[] = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o3', 'o4-mini'], docsUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic (Claude)', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-opus-4', 'claude-sonnet-4', 'claude-3-5-haiku'], docsUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'google', name: 'Google (Gemini)', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'], docsUrl: 'https://aistudio.google.com/apikey' },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', models: ['deepseek-chat', 'deepseek-reasoner'], docsUrl: 'https://platform.deepseek.com/api_keys' },
  { id: 'xai', name: 'xAI (Grok)', baseUrl: 'https://api.x.ai/v1', models: ['grok-4', 'grok-3', 'grok-3-mini'], docsUrl: 'https://console.x.ai' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', models: ['openai/gpt-4o', 'anthropic/claude-sonnet-4', 'google/gemini-2.5-pro'], docsUrl: 'https://openrouter.ai/keys' },
  { id: 'huggingface', name: 'Hugging Face', baseUrl: 'https://router.huggingface.co/v1', models: ['meta-llama/Llama-3.3-70B-Instruct', 'Qwen/Qwen2.5-72B-Instruct', 'deepseek-ai/DeepSeek-V3'], docsUrl: 'https://huggingface.co/settings/tokens' },
  { id: 'nvidia', name: 'NVIDIA NIM', baseUrl: 'https://integrate.api.nvidia.com/v1', models: ['nvidia/llama-3.1-nemotron-70b-instruct', 'meta/llama-3.3-70b-instruct', 'deepseek-ai/deepseek-r1'], docsUrl: 'https://build.nvidia.com' },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'], docsUrl: 'https://console.groq.com/keys' },
  { id: 'mistral', name: 'Mistral', baseUrl: 'https://api.mistral.ai/v1', models: ['mistral-large-latest', 'mistral-small-latest'], docsUrl: 'https://console.mistral.ai/api-keys' },
  { id: 'qwen', name: 'Alibaba (Qwen)', baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1', models: ['qwen-max', 'qwen-plus', 'qwen-turbo'], docsUrl: 'https://bailian.console.alibabacloud.com' },
  { id: 'moonshot', name: 'Moonshot (Kimi)', baseUrl: 'https://api.moonshot.ai/v1', models: ['kimi-k2', 'moonshot-v1-128k'], docsUrl: 'https://platform.moonshot.ai/console/api-keys' },
  { id: 'zhipu', name: 'Zhipu (GLM)', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4.6', 'glm-4-plus', 'glm-4-air'], docsUrl: 'https://open.bigmodel.cn/usercenter/apikeys' },
  { id: 'ollama', name: 'Ollama', baseUrl: 'http://localhost:11434/v1', models: [], isLocal: true },
  { id: 'lmstudio', name: 'LM Studio', baseUrl: 'http://localhost:1234/v1', models: [], isLocal: true },
]

/** تطبيع Base URL للمقارنة (إزالة المسافات والشرطة المائلة الأخيرة) */
export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

/** البحث عن مزوّد (مدمج أو مخصّص) يطابق Base URL المعطى */
export function findProviderByBaseUrl(
  baseUrl: string,
  customProviders: Provider[] = []
): Provider | undefined {
  const target = normalizeBaseUrl(baseUrl)
  return [...BUILTIN_PROVIDERS, ...customProviders].find(
    (p) => normalizeBaseUrl(p.baseUrl) === target
  )
}
```

- [ ] **Step 2: تحقّق من التصريف**

Run: `npm run build`
Expected: PASS (exit 0). `next build` يفحص أنواع كل ملفات `**/*.ts` بما فيها الملف الجديد.

- [ ] **Step 3: التزِم**

```bash
git add src/lib/providers.ts
git commit -m "feat(providers): كتالوج 15 مزوّدًا متوافقًا مع OpenAI + دوال البحث"
```

---

## Task 2: حالة المزوّدات المخصّصة في `src/lib/store.ts`

**Files:**
- Modify: `src/lib/store.ts`

- [ ] **Step 1: استورد نوع Provider**

أضف بعد سطر الاستيراد الأول الموجود (`import { isTauriApp, ... } from './tauri-bridge'`):

```ts
import type { Provider } from './providers'
```

- [ ] **Step 2: أضف الحقل إلى واجهة الإعدادات**

في `interface AppSettings { ... }`، أضف بعد `maxRetries: number`:

```ts
  customProviders: Provider[] // مزوّدات أضافها المستخدم يدويًّا (محفوظة)
```

- [ ] **Step 3: أضف الإجراءات إلى واجهة الحالة**

في `interface AppState extends AppSettings { ... }`، أضف قبل `resetSettings`:

```ts
  addCustomProvider: (provider: Provider) => void
  removeCustomProvider: (id: string) => void
```

- [ ] **Step 4: حدّث الافتراضيات**

في `const defaultSettings: AppSettings = { ... }`:
- غيّر `model: 'deepseek-v3.2-exp'` إلى `model: 'deepseek-chat'`
- أضف `customProviders: []`
- استبدل قائمة `availableModels` الطويلة بالكامل بـ:

```ts
  availableModels: ['deepseek-chat', 'deepseek-reasoner']
```

(أي يصبح كائن `defaultSettings` يحوي `customProviders: []` و`model: 'deepseek-chat'` و`availableModels: ['deepseek-chat', 'deepseek-reasoner']`، مع بقية الحقول كما هي.)

- [ ] **Step 5: نفّذ الإجراءات داخل المتجر**

في جسم `create(...)`، أضف قبل `resetSettings: () => set(defaultSettings),`:

```ts
      addCustomProvider: (provider) =>
        set((state) => ({
          customProviders: [
            ...state.customProviders.filter((p) => p.id !== provider.id),
            provider,
          ],
        })),
      removeCustomProvider: (id) =>
        set((state) => ({
          customProviders: state.customProviders.filter((p) => p.id !== id),
        })),
```

> ملاحظة: `customProviders` يُحفظ تلقائيًّا (الـ `partialize` الحالي يستثني `apiKey` فقط في Tauri؛ `customProviders` ضمن `rest`). إضافة الحقل آمنة على الحالة المحفوظة القديمة (الدمج السطحي يستخدم `[]`).

- [ ] **Step 6: تحقّق**

Run: `npm run build`
Expected: PASS (exit 0).

- [ ] **Step 7: التزِم**

```bash
git add src/lib/store.ts
git commit -m "feat(store): مزوّدات مخصّصة محفوظة + تحديث النماذج الافتراضية"
```

---

## Task 3: مفاتيح الترجمة `ar.json` + `en.json`

**Files:**
- Modify: `src/i18n/locales/ar.json`
- Modify: `src/i18n/locales/en.json`

- [ ] **Step 1: أضف مفاتيح العربية**

في `src/i18n/locales/ar.json`، داخل كائن `"settings"`، استبدل السطر:

```json
    "website": "الموقع"
  },
```

بـ:

```json
    "website": "الموقع",
    "provider": "المزوّد",
    "providerHint": "اختر مزوّدًا لتعبئة الإعدادات تلقائيًّا، أو أضِف واحدًا يدويًّا",
    "addProviderManually": "➕ إضافة مزوّد يدويًّا",
    "providerName": "اسم المزوّد",
    "providerModels": "النماذج (اختياري، مفصولة بفواصل)",
    "saveProvider": "حفظ المزوّد",
    "deleteProvider": "حذف المزوّد",
    "customProvider": "مخصّص"
  },
```

- [ ] **Step 2: أضف مفاتيح الإنجليزية**

في `src/i18n/locales/en.json`، داخل كائن `"settings"`، استبدل السطر:

```json
    "website": "Website"
  },
```

بـ:

```json
    "website": "Website",
    "provider": "Provider",
    "providerHint": "Pick a provider to auto-fill settings, or add one manually",
    "addProviderManually": "➕ Add provider manually",
    "providerName": "Provider name",
    "providerModels": "Models (optional, comma-separated)",
    "saveProvider": "Save provider",
    "deleteProvider": "Delete provider",
    "customProvider": "Custom"
  },
```

- [ ] **Step 3: تحقّق (JSON صالح + بناء)**

Run: `npm run build`
Expected: PASS (exit 0). أي فاصلة ناقصة/زائدة في JSON تُفشل البناء.

- [ ] **Step 4: التزِم**

```bash
git add src/i18n/locales/ar.json src/i18n/locales/en.json
git commit -m "i18n: مفاتيح منتقي المزوّد (ar/en)"
```

---

## Task 4: منتقي المزوّد + الإضافة اليدوية في `settings-dialog.tsx`

**Files:**
- Modify: `src/components/settings-dialog.tsx`

- [ ] **Step 1: أضف استيراد الكتالوج**

بعد السطر `import { openExternal } from '@/lib/tauri-bridge'`، أضف:

```ts
import { BUILTIN_PROVIDERS, findProviderByBaseUrl, type Provider } from '@/lib/providers'
```

- [ ] **Step 2: احذف الكود الميت (TEST_CONFIG)**

احذف ثابت `TEST_CONFIG` بالكامل (الكائن `const TEST_CONFIG = { ... }` بقيمة `baseUrl: 'https://ai.huan666.de/v1'`).

- [ ] **Step 3: وسّع تفكيك المتجر**

استبدل سطر `useAppStore()` الحالي:

```ts
    const { apiKey, baseUrl, model, systemPrompt, availableModels, correctionModel, autoRetry, maxRetries, setApiKey, setBaseUrl, setModel, setSystemPrompt, setAvailableModels, setCorrectionModel, setAutoRetry, setMaxRetries } = useAppStore()
```

بـ:

```ts
    const { apiKey, baseUrl, model, systemPrompt, availableModels, correctionModel, autoRetry, maxRetries, customProviders, addCustomProvider, removeCustomProvider, setApiKey, setBaseUrl, setModel, setSystemPrompt, setAvailableModels, setCorrectionModel, setAutoRetry, setMaxRetries } = useAppStore()
```

- [ ] **Step 4: أضف حالة نموذج الإضافة اليدوية**

بعد سطر `const [localConfig, setLocalConfig] = useState({ ... })`، أضف:

```ts
    // حالة منتقي المزوّد ونموذج الإضافة اليدوية
    const [isAddingProvider, setIsAddingProvider] = useState(false)
    const [newProvider, setNewProvider] = useState({ name: '', baseUrl: '', models: '' })
    const selectedProvider = findProviderByBaseUrl(localConfig.baseUrl, customProviders)
    const selectedProviderId = selectedProvider?.id ?? 'custom'
```

- [ ] **Step 5: احذف الدالة الميتة `applyPreset`**

احذف دالة `applyPreset` بالكامل (`const applyPreset = (type: 'deepseek' | 'openai' | 'demo') => { ... }`) — غير مستخدَمة.

- [ ] **Step 6: احذف `loadTestConfig` وأضِف معالِجات المزوّد**

استبدل دالة `loadTestConfig` الحالية:

```ts
    const loadTestConfig = () => {
        setLocalConfig(TEST_CONFIG)
        setCheckStatus('idle')
        setCheckMessage('')
    }
```

بـ:

```ts
    // تطبيق مزوّد: ملء Base URL + النماذج + النموذج الافتراضي
    const applyProvider = (provider: Provider) => {
        setLocalConfig(prev => ({ ...prev, baseUrl: provider.baseUrl, model: provider.models[0] ?? prev.model }))
        setAvailableModels(provider.models)
        setCheckStatus('idle')
        setCheckMessage('')
    }

    const handleProviderChange = (value: string) => {
        if (value === '__add__') { setIsAddingProvider(true); return }
        if (value === 'custom') return // عنصر عرض فقط
        const provider = [...BUILTIN_PROVIDERS, ...customProviders].find(p => p.id === value)
        if (provider) applyProvider(provider)
    }

    const handleSaveProvider = () => {
        const name = newProvider.name.trim()
        const baseUrl = newProvider.baseUrl.trim()
        if (!name || !baseUrl) return
        const models = newProvider.models.split(',').map(m => m.trim()).filter(Boolean)
        const provider: Provider = { id: `custom-${Date.now()}`, name, baseUrl, models }
        addCustomProvider(provider)
        applyProvider(provider)
        setNewProvider({ name: '', baseUrl: '', models: '' })
        setIsAddingProvider(false)
    }
```

- [ ] **Step 7: استبدل زرّ «testPreset» بمنتقي المزوّد + نموذج الإضافة**

استبدل كتلة الزرّ الحالية في تبويب الاتصال:

```tsx
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={loadTestConfig} className="flex-1">
                                    {t('settings.testPreset')}
                                </Button>
                            </div>
```

بـ:

```tsx
                            <div className="space-y-2">
                                <Label>{t('settings.provider')}</Label>
                                <div className="flex gap-2">
                                    <Select value={selectedProviderId} onValueChange={handleProviderChange}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder={t('settings.provider')} />
                                        </SelectTrigger>
                                        <SelectContent position="popper" sideOffset={5} className="max-h-[320px] z-50">
                                            {BUILTIN_PROVIDERS.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                            {customProviders.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                            <SelectItem value="custom" disabled>{t('settings.customProvider')}</SelectItem>
                                            <SelectItem value="__add__">{t('settings.addProviderManually')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {selectedProvider && customProviders.some(p => p.id === selectedProvider.id) && (
                                        <Button variant="ghost" size="sm" onClick={() => removeCustomProvider(selectedProvider.id)}>
                                            {t('settings.deleteProvider')}
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">{t('settings.providerHint')}</p>

                                {isAddingProvider && (
                                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                                        <Input placeholder={t('settings.providerName')} value={newProvider.name} onChange={e => setNewProvider({ ...newProvider, name: e.target.value })} />
                                        <Input placeholder="https://api.example.com/v1" value={newProvider.baseUrl} onChange={e => setNewProvider({ ...newProvider, baseUrl: e.target.value })} className="font-mono text-sm" />
                                        <Input placeholder={t('settings.providerModels')} value={newProvider.models} onChange={e => setNewProvider({ ...newProvider, models: e.target.value })} className="font-mono text-sm" />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleSaveProvider} disabled={!newProvider.name.trim() || !newProvider.baseUrl.trim()}>
                                                {t('settings.saveProvider')}
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => { setIsAddingProvider(false); setNewProvider({ name: '', baseUrl: '', models: '' }) }}>
                                                {t('settings.cancel')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
```

> الحقول `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, `Input`, `Label`, `Button` مستورَدة فعلًا في الملف. مفتاح `settings.testPreset` لم يعد مستخدَمًا (اتركه في ملفات الترجمة دون حذف — غير ضارّ).

- [ ] **Step 8: تحقّق (بناء + lint)**

Run: `npm run build`
Expected: PASS (exit 0).

Run: `npm run lint`
Expected: PASS (تحذيرات فقط، بلا أخطاء). لا أخطاء `no-unused-vars` (حُذف `TEST_CONFIG`/`applyPreset`/`loadTestConfig`).

- [ ] **Step 9: التزِم**

```bash
git add src/components/settings-dialog.tsx
git commit -m "feat(settings): منتقي المزوّد + إضافة مزوّد يدويًّا + إزالة الكود الميت والبروكسي القديم"
```

---

## Task 5: التحقّق النهائي + قائمة فحص يدوية

**Files:** لا تعديلات جديدة (تحقّق فقط).

- [ ] **Step 1: بناء + lint نهائي**

Run: `npm run build`
Expected: PASS (exit 0)، توليد `7/7` صفحات.

Run: `npm run lint`
Expected: PASS (تحذيرات فقط).

- [ ] **Step 2: قائمة فحص يدوية (في `npm run dev`)**

افتح الإعدادات → تبويب «الاتصال»:
- [ ] قائمة «المزوّد» تعرض 15 مزوّدًا مدمجًا.
- [ ] اختيار «OpenAI» يملأ `baseUrl = https://api.openai.com/v1` ويغيّر قائمة النماذج إلى نماذج OpenAI.
- [ ] «➕ إضافة مزوّد يدويًّا» يفتح النموذج؛ إدخال اسم + Base URL ثم «حفظ المزوّد» يضيفه ويختاره.
- [ ] إعادة فتح النافذة (أو التطبيق): المزوّد المخصّص ما زال في القائمة (محفوظ).
- [ ] اختيار المزوّد المخصّص يُظهر «حذف المزوّد»؛ الحذف يزيله من القائمة.
- [ ] كتابة Base URL لا يطابق أيًّا منها يعرض «مخصّص» في المنتقي.
- [ ] الحالة الافتراضية (أول تشغيل نظيف) تعرض «DeepSeek» مختارًا.

- [ ] **Step 3: تحديث المهام**

علّم مهمة الخطة (#6) كمكتملة بعد نجاح القائمة اليدوية.

---

## Self-Review (مُنفَّذة أثناء الكتابة)

- **تغطية المواصفات:** الكتالوج (Task 1) ✓ · `customProviders` + الإجراءات + الافتراضيات (Task 2) ✓ · i18n (Task 3) ✓ · منتقي + إضافة يدوية + حذف + تنظيف (Task 4) ✓ · التحقّق (Task 5) ✓.
- **لا عناصر ناقصة:** كل الأكواد كاملة وصريحة.
- **اتّساق الأنواع:** `Provider` معرّف في Task 1 ويُستخدَم بنفس التوقيع في Tasks 2 و4. `addCustomProvider`/`removeCustomProvider`/`applyProvider`/`handleProviderChange`/`handleSaveProvider` متّسقة عبر المهام.
