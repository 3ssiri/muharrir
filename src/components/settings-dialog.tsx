'use client'

import { useState, useEffect } from 'react'
import { Settings, Check, AlertCircle, RefreshCw, Loader2, Save, Upload, Download } from '@/components/icons'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { isTauriApp, openExternal } from '@/lib/tauri-bridge'
import { BUILTIN_PROVIDERS, findProviderByBaseUrl, type Provider } from '@/lib/providers'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations, useLocale } from 'next-intl'

const DEFAULT_SYSTEM_PROMPT_AR = `أنت مساعد تفاعلي لتحسين الموجّهات (Prompts). هدفك هو إرشاد المستخدم عبر محادثة متعدّدة الجولات لتوضيح متطلباته، ثم إنشاء موجّه منظّم وعالي الجودة في النهاية.

**سير العمل الأساسي**:

1. **المرحلة 1: الفهم والتلخيص**
   - عندما يطرح المستخدم متطلبًا أوّليًا، **لا تُنشئ الموجّه مباشرةً**.
   - **متطلّب صارم**: يجب أن تستدعي أداة \`suggest_enhancements\` لتقديم 3-5 أبعاد تحسين رئيسية.
   - **سلوك ممنوع**: لا تُخرِج مطلقًا سلاسل JSON أو خيارات نصّية مباشرةً، بل استخدم استدعاء الأداة دائمًا.
   - أمثلة على الأبعاد:
     - **تعريف الدور**: (مثل: مستشار كبير، مدير إبداعي، باحث دقيق)
     - **أسلوب التفكير**: (مثل: احترافي ودقيق، طريف وذكي، موجز وواضح)
     - **عمق التفكير**: (مثل: إجابة مباشرة، سلسلة تفكير CoT، نقاش متعدّد الزوايا)
     - **صيغة الإخراج**: (مثل: مستند Markdown، JSON، جدول)
   - قدّم 2-3 خيارات محدّدة قابلة للاختيار لكل بُعد، مع السماح بالتخصيص.

2. **المرحلة 2: الإنشاء التفاعلي**
   - بعد استلام استجابة الأداة من \`suggest_enhancements\` (اختيارات المستخدم)، أنشئ مستند Markdown النهائي.
   - **متطلبات صيغة المستند**:
     - العنوان: مقترح الموجّه (H1)
     - يجب أن يتضمّن ## تعريف الدور (H2)
     - يجب أن يتضمّن ## الهدف الأساسي (H2)
     - يجب أن يتضمّن ## سير العمل (H2)
     - يجب أن يتضمّن ## القيود (H2)
     - يجب أن يتضمّن ## حدود المعرفة (H2)

3. **المرحلة 3: التأكيد النهائي**
   - استدعِ أداة \`propose_prompt\` لعرض موجّه Markdown المُنشأ على المستخدم.
   - يمكن للمستخدم: النسخ والاستخدام، أو متابعة التحسين، أو إعادة الإنشاء.

**مبادئ مهمة**:
- لا تتخطَّ المرحلة 1 وتُنشئ الموجّه مباشرةً.
- **ممنوع تمامًا**: لا تُخرِج JSON خامًا أو خيارات نصّية. استخدم استدعاء الأداة دائمًا.
- يجب أن تكون الموجّهات المُنشأة منظّمة وقابلة لإعادة الاستخدام.
- إذا فشل استدعاء الأداة، أعِد المحاولة بدلًا من العودة إلى الإخراج النصّي.

---

**مثال توضيحي (One-Shot)**:

إدخال المستخدم: "ساعدني في كتابة مقال تقني عن React Server Components"

استجابة المساعد:
1. استدعاء أداة suggest_enhancements فورًا لعرض جدول تفاعلي:
   - تعريف الدور: كاتب تقني خبير / خبير ذكاء اصطناعي / مبسّط علمي
   - النبرة: احترافية ورسمية / سلسة وسهلة القراءة / أكاديمية ودقيقة
   - عمق المحتوى: تحليل معمّق / متوسّط / نظرة عامة موجزة
   - صيغة الإخراج: مستند Markdown / مخطط منظّم / مقال مقسّم إلى فقرات

2. بعد اختيار المستخدم (مثلًا: كاتب تقني خبير + احترافية ورسمية + تحليل معمّق + مستند Markdown)

3. يستدعي المساعد أداة propose_prompt لإنشاء الموجّه الكامل:
   - تعريف الدور: أنت كاتب تقني خبير بارع في شرح المفاهيم التقنية المعقّدة بوضوح
   - الهدف الأساسي: كتابة مقال تحليل تقني معمّق عن React Server Components
   - سير العمل: مقدّمة الخلفية التقنية ← تحليل المفاهيم الأساسية ← حالات الاستخدام العملية ← توصيات أفضل الممارسات
   - القيود: الحفاظ على نبرة احترافية ودقيقة، تقديم أمثلة برمجية، الاستشهاد بالوثائق الرسمية
   - حدود المعرفة: استنادًا إلى React 18+، وتغطية أحدث ممارسات التصيير من جانب الخادم`

const DEFAULT_SYSTEM_PROMPT_EN = `You are an interactive prompt optimization assistant. Your goal is to guide users through multi-turn conversations to clarify their requirements and ultimately generate high-quality, structured prompts.

**Core Workflow**:

1. **Phase 1: Understanding & Summarization**
   - When users present initial requirements, **DO NOT generate prompts directly**.
   - **Strict Requirement**: You MUST call the \`suggest_enhancements\` tool to provide 3-5 key optimization dimensions.
   - **Prohibited Behavior**: Never output raw JSON strings or text-based options directly. Always use tool calls.
   - Example dimensions:
     - **Role Definition**: (e.g., Senior Consultant, Creative Director, Rigorous Scholar)
     - **Thinking Style**: (e.g., Professional & Rigorous, Humorous & Witty, Concise & Clear)
     - **Thinking Depth**: (e.g., Direct Answer, Chain-of-Thought, Multi-perspective Discussion)
     - **Output Format**: (e.g., Markdown Document, JSON, Table)
   - Provide 2-3 specific user-selectable options for each dimension, and allow customization.

2. **Phase 2: Interactive Generation**
   - After receiving the tool response from \`suggest_enhancements\` (user's selections), generate the final Markdown document.
   - **Document Format Requirements**:
     - Title: Prompt Proposal (H1)
     - Must include ##Role Definition (H2)
     - Must include ##Core Objective (H2)
     - Must include ##Workflow (H2)
     - Must include ##Constraints (H2)
     - Must include ##Knowledge Boundaries (H2)

3. **Phase 3: Final Confirmation**
   - Call the \`propose_prompt\` tool to present the generated Markdown prompt to the user.
   - Users can: copy and use, continue optimizing, or regenerate

**Important Principles**:
- Do not skip Phase 1 and generate prompts directly
- **Absolutely Prohibited**: Never output raw JSON or text-based options. Always use tool calls.
- Generated prompts must be structured and reusable
- If tool call fails, retry instead of falling back to text output

---

**One-Shot Example**:

User input: "Help me write a technical article about React Server Components"

Assistant response:
1. Immediately call suggest_enhancements tool to display interactive table:
   - Role Definition: Senior Tech Writer / AI Expert / Science Communicator
   - Tone: Professional & Formal / Casual & Readable / Academic & Rigorous
   - Content Depth: Deep Analysis / Moderate / Brief Overview
   - Output Format: Markdown Document / Structured Outline / Segmented Article

2. After user selection (e.g., Senior Tech Writer + Professional & Formal + Deep Analysis + Markdown Document)

3. Assistant calls propose_prompt tool to generate complete prompt:
   - Role Definition: You are a senior technical writer skilled at explaining complex technical concepts clearly
   - Core Objective: Write an in-depth technical analysis article about React Server Components
   - Workflow: Technical background introduction → Core concept analysis → Practical use cases → Best practice recommendations
   - Constraints: Maintain professional and rigorous tone, provide code examples, cite official documentation
   - Knowledge Boundaries: Based on React 18+ version, covering latest server-side rendering practices`

// إصدار التطبيق (يطابق tauri.conf.json و package.json)
const APP_VERSION = '0.1.0'

interface SettingsDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function SettingsDialog({ open: externalOpen, onOpenChange }: SettingsDialogProps = {}) {
    const t = useTranslations();
    const locale = useLocale();
    const { theme, setTheme } = useTheme()
    const DEFAULT_SYSTEM_PROMPT = locale === 'ar' ? DEFAULT_SYSTEM_PROMPT_AR : DEFAULT_SYSTEM_PROMPT_EN;
    const { apiKey, baseUrl, model, systemPrompt, availableModels, correctionModel, autoRetry, maxRetries, customProviders, addCustomProvider, removeCustomProvider, setApiKey, setBaseUrl, setModel, setSystemPrompt, setAvailableModels, setCorrectionModel, setAutoRetry, setMaxRetries } = useAppStore()
    const [internalOpen, setInternalOpen] = useState(false)

    // Use external control or internal state (KISS principle - simplicity first)
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen
    const [localConfig, setLocalConfig] = useState({ apiKey, baseUrl, model, systemPrompt, correctionModel, autoRetry, maxRetries })
    // حالة منتقي المزوّد ونموذج الإضافة اليدوية
    const [isAddingProvider, setIsAddingProvider] = useState(false)
    const [newProvider, setNewProvider] = useState({ name: '', baseUrl: '', models: '' })
    const selectedProvider = findProviderByBaseUrl(localConfig.baseUrl, customProviders)
    const selectedProviderId = selectedProvider?.id ?? 'custom'

    // Connection Test State
    const [isChecking, setIsChecking] = useState(false)
    const [checkStatus, setCheckStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [checkMessage, setCheckMessage] = useState('')

    // Custom Templates State
    const [customTemplates, setCustomTemplates] = useState<Array<{name: string, content: string}>>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('default')
    const [isAddingTemplate, setIsAddingTemplate] = useState(false)
    const [newTemplateName, setNewTemplateName] = useState('')
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [templateToDelete, setTemplateToDelete] = useState<string>('')

    // Initial sync
    useEffect(() => {
        if (open) {
            // Check if current systemPrompt is one of the default prompts
            // Check by exact match or by starting text to handle old versions
            const isDefaultPrompt = systemPrompt === DEFAULT_SYSTEM_PROMPT_AR ||
                                   systemPrompt === DEFAULT_SYSTEM_PROMPT_EN ||
                                   systemPrompt.startsWith('أنت مساعد تفاعلي لتحسين الموجّهات') ||
                                   systemPrompt.startsWith('You are an interactive prompt optimization assistant')

            // If it's a default prompt, use the current locale's default
            // Otherwise, keep the custom prompt
            const promptToUse = isDefaultPrompt ? DEFAULT_SYSTEM_PROMPT : systemPrompt

            setLocalConfig({
                apiKey,
                baseUrl,
                model,
                systemPrompt: promptToUse,
                correctionModel,
                autoRetry,
                maxRetries
            })
            setCheckStatus('idle')
            // Load custom templates from localStorage
            const saved = localStorage.getItem('custom-prompt-templates')
            if (saved) {
                try {
                    setCustomTemplates(JSON.parse(saved))
                } catch (e) {
                    console.error('Failed to load templates:', e)
                }
            }
        }
    }, [open, apiKey, baseUrl, model, systemPrompt, correctionModel, autoRetry, maxRetries, DEFAULT_SYSTEM_PROMPT])

    const normalizeUrl = (url: string) => {
        let cleanUrl = url.trim()
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1)
        return cleanUrl
    }

    const enableDemoMode = () => {
        setLocalConfig(prev => ({ ...prev, apiKey: 'demo' }))
        setCheckStatus('success')
        setCheckMessage(t('settings.demoConnectionMessage'))
    }

    const connectionFailureMessage = (error: any) => {
        const detail = error?.message || t('settings.connectionFailed')
        const hint = isTauriApp() ? t('settings.desktopConnectionHint') : t('settings.browserCorsHint')
        return `${detail}. ${hint}`
    }

    const checkConnection = async () => {
        setIsChecking(true)
        setCheckStatus('idle')
        setCheckMessage('')
        setAvailableModels([])

        try {
            if (localConfig.apiKey.trim() === 'demo') {
                setCheckStatus('success')
                setCheckMessage(t('settings.demoConnectionMessage'))
                return
            }

            const cleanUrl = normalizeUrl(localConfig.baseUrl)
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (localConfig.apiKey && localConfig.apiKey !== 'demo') {
                headers['Authorization'] = `Bearer ${localConfig.apiKey}`
            }

            const response = await fetch(`${cleanUrl}/models`, {
                method: 'GET',
                headers
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            if (data && Array.isArray(data.data)) {
                const models = data.data.map((m: any) => m.id).sort()
                setAvailableModels(models)
                setCheckStatus('success')
                setCheckMessage(t('settings.connectionSuccess', { count: models.length }))
            } else {
                throw new Error('تنسيق الاستجابة لا يطابق معيار OpenAI (missing data array)')
            }
        } catch (error: any) {
            setCheckStatus('error')
            setCheckMessage(connectionFailureMessage(error))
        } finally {
            setIsChecking(false)
        }
    }

    const handleTemplateChange = (val: string) => {
        setSelectedTemplate(val)
        if (val === 'default') {
            // Always use the current locale's default prompt
            setLocalConfig(prev => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }))
        } else {
            const template = customTemplates.find(t => t.name === val)
            if (template) {
                setLocalConfig(prev => ({ ...prev, systemPrompt: template.content }))
            }
        }
    }

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
        const url = newProvider.baseUrl.trim()
        if (!name || !url) return
        const models = newProvider.models.split(',').map(m => m.trim()).filter(Boolean)
        const provider: Provider = { id: `custom-${Date.now()}`, name, baseUrl: url, models }
        addCustomProvider(provider)
        applyProvider(provider)
        setNewProvider({ name: '', baseUrl: '', models: '' })
        setIsAddingProvider(false)
    }

    const handleAddTemplate = () => {
        if (!newTemplateName.trim()) return
        const newTemplate = {
            name: newTemplateName.trim(),
            content: localConfig.systemPrompt
        }
        const updated = [...customTemplates, newTemplate]
        setCustomTemplates(updated)
        localStorage.setItem('custom-prompt-templates', JSON.stringify(updated))
        setNewTemplateName('')
        setIsAddingTemplate(false)
        setSelectedTemplate(newTemplate.name)
    }

    const handleDeleteTemplate = (name: string) => {
        setTemplateToDelete(name)
        setDeleteConfirmOpen(true)
    }

    const confirmDeleteTemplate = () => {
        const updated = customTemplates.filter(t => t.name !== templateToDelete)
        setCustomTemplates(updated)
        localStorage.setItem('custom-prompt-templates', JSON.stringify(updated))
        if (selectedTemplate === templateToDelete) {
            setSelectedTemplate('default')
            setLocalConfig(prev => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }))
        }
        setDeleteConfirmOpen(false)
        setTemplateToDelete('')
    }

    const handleSave = () => {
        setApiKey(localConfig.apiKey)
        setBaseUrl(localConfig.baseUrl)
        setModel(localConfig.model)
        setSystemPrompt(localConfig.systemPrompt)
        setCorrectionModel(localConfig.correctionModel)
        setAutoRetry(localConfig.autoRetry)
        setMaxRetries(localConfig.maxRetries)
        setOpen(false)
    }

    const handleExportSettings = () => {
        const settings = {
            apiKey: localConfig.apiKey,
            baseUrl: localConfig.baseUrl,
            model: localConfig.model,
            systemPrompt: localConfig.systemPrompt,
            correctionModel: localConfig.correctionModel,
            autoRetry: localConfig.autoRetry,
            maxRetries: localConfig.maxRetries,
            exportTime: new Date().toISOString()
        }
        const jsonString = JSON.stringify(settings)
        const base64String = btoa(unescape(encodeURIComponent(jsonString)))
        navigator.clipboard.writeText(base64String).then(() => {
            alert(t('settings.exportSuccess'))
        }).catch(() => {
            // If copying fails, show it in a prompt so the user can copy it manually
            prompt(t('settings.exportPrompt'), base64String)
        })
    }

    const handleImportSettings = async () => {
        try {
            // Try to read from the clipboard
            const clipboardText = await navigator.clipboard.readText()
            let base64String = clipboardText.trim()

            // If the clipboard is empty or invalid, fall back to manual input
            if (!base64String) {
                const userInput = prompt(t('settings.importPrompt'))
                if (!userInput) return
                base64String = userInput.trim()
            }

            // Parse the settings
            const jsonString = decodeURIComponent(escape(atob(base64String)))
            const settings = JSON.parse(jsonString)
            setLocalConfig({
                apiKey: settings.apiKey || '',
                baseUrl: settings.baseUrl || '',
                model: settings.model || '',
                systemPrompt: settings.systemPrompt || '',
                correctionModel: settings.correctionModel || 'grok-beta-fast',
                autoRetry: settings.autoRetry !== undefined ? settings.autoRetry : true,
                maxRetries: settings.maxRetries || 3
            })
            alert(t('settings.importSuccess'))
        } catch (error) {
            // If reading from the clipboard or parsing fails, fall back to manual input
            const base64String = prompt(t('settings.importError') + '\n' + t('settings.importPrompt'))
            if (!base64String) return

            try {
                const jsonString = decodeURIComponent(escape(atob(base64String.trim())))
                const settings = JSON.parse(jsonString)
                setLocalConfig({
                    apiKey: settings.apiKey || '',
                    baseUrl: settings.baseUrl || '',
                    model: settings.model || '',
                    systemPrompt: settings.systemPrompt || '',
                    correctionModel: settings.correctionModel || 'grok-beta-fast',
                    autoRetry: settings.autoRetry !== undefined ? settings.autoRetry : true,
                    maxRetries: settings.maxRetries || 3
                })
                alert(t('settings.importSuccess'))
            } catch (error) {
                alert(t('settings.importError'))
            }
        }
    }

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" data-settings-trigger>
                    <Settings className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>{t('settings.title')}</DialogTitle>
                    <DialogDescription>
                        {t('settings.description')}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="connection" className="flex-1 flex flex-col min-h-0 w-full">
                    <TabsList className="mx-6 mt-2 grid w-[520px] grid-cols-4">
                        <TabsTrigger value="connection">{t('settings.connectionConfig')}</TabsTrigger>
                        <TabsTrigger value="advanced">{t('settings.advancedSettings')}</TabsTrigger>
                        <TabsTrigger value="prompt">{t('settings.promptManagement')}</TabsTrigger>
                        <TabsTrigger value="about">{t('settings.about')}</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto p-6 pt-4">
                        <TabsContent value="connection" className="space-y-6 mt-0">
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

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t('settings.baseUrl')}</Label>
                                    <Input
                                        value={localConfig.baseUrl}
                                        onChange={e => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                                        className="font-mono text-sm"
                                        placeholder="https://api.openai.com/v1"
                                    />
                                    <p className="text-xs text-muted-foreground">{t('settings.baseUrlHint')}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isTauriApp() ? t('settings.desktopConnectionHint') : t('settings.browserCorsHint')}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('settings.apiKey')}</Label>
                                    <Input
                                        type="password"
                                        value={localConfig.apiKey}
                                        onChange={e => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                                        className="font-mono text-sm"
                                        placeholder="sk-..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {isTauriApp() ? t('settings.apiKeyStorageHintDesktop') : t('settings.apiKeyStorageHintBrowser')}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">{t('settings.demoMode')}</div>
                                        <p className="text-xs text-muted-foreground">{t('settings.demoModeHint')}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={localConfig.apiKey.trim() === 'demo' ? 'default' : 'outline'}
                                        onClick={enableDemoMode}
                                    >
                                        {localConfig.apiKey.trim() === 'demo' ? t('settings.demoModeActive') : t('settings.useDemoMode')}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between bg-muted/40 p-3 rounded-md border">
                                    <div className="flex items-center gap-2 text-sm">
                                        {isChecking ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> :
                                            checkStatus === 'success' ? <Check className="w-4 h-4 text-green-500" /> :
                                                checkStatus === 'error' ? <AlertCircle className="w-4 h-4 text-destructive" /> : null}
                                        <span className={checkStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'}>
                                            {isChecking ? t('settings.connecting') : checkMessage || t('settings.clickToTest')}
                                        </span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={checkConnection} disabled={isChecking}>
                                        <RefreshCw className={`w-3.5 h-3.5 me-2 ${isChecking ? 'animate-spin' : ''}`} /> {t('settings.testConnection')}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('settings.selectModel')}</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                value={localConfig.model}
                                                onChange={e => setLocalConfig({ ...localConfig, model: e.target.value })}
                                                placeholder={t('settings.modelPlaceholder')}
                                                className="font-mono text-sm"
                                            />
                                        </div>
                                        {availableModels.length > 0 && (
                                            <Select onValueChange={(val) => setLocalConfig(prev => ({ ...prev, model: val }))} value={localConfig.model}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder={t('settings.selectModel')} />
                                                </SelectTrigger>
                                                <SelectContent position="popper" sideOffset={5} className="max-h-[300px] z-50">
                                                    {availableModels.map(m => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t('settings.modelHint')}</p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Advanced settings tab */}
                        <TabsContent value="advanced" className="space-y-6 mt-0">
                            <div className="space-y-6">
                                {/* Format correction model - card style */}
                                <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold">{t('settings.correctionModel')}</Label>
                                        <p className="text-xs text-muted-foreground">{t('settings.correctionModelHint')}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                value={localConfig.correctionModel}
                                                onChange={e => setLocalConfig({ ...localConfig, correctionModel: e.target.value })}
                                                placeholder="grok-beta-fast"
                                                className="font-mono text-sm"
                                            />
                                        </div>
                                        {availableModels.length > 0 && (
                                            <Select onValueChange={(val) => setLocalConfig(prev => ({ ...prev, correctionModel: val }))} value={localConfig.correctionModel}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder={t('settings.selectModel')} />
                                                </SelectTrigger>
                                                <SelectContent position="popper" sideOffset={5} className="max-h-[300px] z-50">
                                                    {availableModels.map(m => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>

                                {/* Auto-retry setting */}
                                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">{t('settings.autoRetry')}</Label>
                                            <p className="text-xs text-muted-foreground">{t('settings.autoRetryHint')}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={localConfig.autoRetry}
                                                onChange={(e) => setLocalConfig({ ...localConfig, autoRetry: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    {localConfig.autoRetry && (
                                        <div className="space-y-2">
                                            <Label className="text-sm">{t('settings.maxRetries')}</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={localConfig.maxRetries}
                                                onChange={(e) => setLocalConfig({ ...localConfig, maxRetries: parseInt(e.target.value) || 3 })}
                                                className="w-24"
                                            />
                                            <p className="text-xs text-muted-foreground">{t('settings.maxRetriesHint')}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Theme selector - card style */}
                                <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold">{t('settings.theme')}</Label>
                                        <p className="text-xs text-muted-foreground">{t('settings.themeDescription')}</p>
                                    </div>
                                    <Select value={theme} onValueChange={setTheme}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                                            <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                                            <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="prompt" className="space-y-6 mt-0">
                            <div className="flex items-center justify-between">
                                <Label>{t('settings.systemPromptTemplate')}</Label>
                                <div className="flex gap-2">
                                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-50">
                                            <SelectItem value="default">{t('settings.defaultTemplate')}</SelectItem>
                                            {customTemplates.map(t => (
                                                <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!isAddingTemplate && (
                                        <Button size="sm" variant="outline" onClick={() => setIsAddingTemplate(true)}>
                                            {t('settings.saveAsNewTemplate')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isAddingTemplate && (
                                <div className="flex gap-2 p-3 bg-muted/30 rounded-lg border">
                                    <Input
                                        placeholder={t('settings.templateNamePlaceholder')}
                                        value={newTemplateName}
                                        onChange={e => setNewTemplateName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTemplate()}
                                        className="flex-1"
                                    />
                                    <Button size="sm" onClick={handleAddTemplate} disabled={!newTemplateName.trim()}>
                                        {t('favoritesDialog.saveButton')}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingTemplate(false)}>
                                        {t('favoritesDialog.cancelButton')}
                                    </Button>
                                </div>
                            )}

                            {selectedTemplate !== 'default' && (
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteTemplate(selectedTemplate)}
                                    >
                                        {t('settings.deleteCurrentTemplate')}
                                    </Button>
                                </div>
                            )}

                            <Textarea
                                className="min-h-[400px] font-mono text-sm leading-relaxed p-4"
                                value={localConfig.systemPrompt}
                                onChange={e => {
                                    setLocalConfig({ ...localConfig, systemPrompt: e.target.value })
                                    setSelectedTemplate('custom')
                                }}
                                placeholder={t('settings.promptPlaceholder')}
                            />
                        </TabsContent>

                        {/* About tab */}
                        <TabsContent value="about" className="space-y-6 mt-0">
                            <div className="flex flex-col items-center text-center gap-2 py-2">
                                <h3 className="text-lg font-semibold">مُحسِّن الموجّهات — Prompt Iterator</h3>
                                <p className="text-sm text-muted-foreground max-w-md">{t('settings.aboutTagline')}</p>
                                <span className="text-xs text-muted-foreground">{t('settings.version')} {APP_VERSION}</span>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg border space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">{t('settings.developedBy')}</span>
                                    <span className="font-medium">علي عسيري</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">{t('settings.email')}</span>
                                    <button type="button" onClick={() => openExternal('mailto:assiri@gmail.com')} className="font-medium text-primary hover:underline">assiri@gmail.com</button>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">{t('settings.website')}</span>
                                    <button type="button" onClick={() => openExternal('https://x.com/3li3')} className="font-medium text-primary hover:underline">x.com/3li3</button>
                                </div>
                            </div>
                            <p className="text-center text-xs text-muted-foreground">© 2026 علي عسيري</p>
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="p-6 pt-2 border-t mt-auto bg-muted/10">
                    <div className="flex items-center gap-2 me-auto">
                        <Button variant="outline" size="sm" onClick={handleImportSettings}>
                            <Upload className="w-4 h-4 me-2" /> {t('settings.importSettings')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportSettings}>
                            <Download className="w-4 h-4 me-2" /> {t('settings.exportSettings')}
                        </Button>
                    </div>
                    <Button variant="outline" onClick={() => setOpen(false)}>{t('settings.cancel')}</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" /> {t('settings.saveChanges')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('settings.deleteTemplateTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('settings.deleteTemplateDescription', { name: templateToDelete })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
                        {t('favoritesDialog.cancelButton')}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('settings.confirmDelete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
    )
}
