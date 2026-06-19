import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { isTauriApp, saveApiKey as keychainSave, getApiKey as keychainGet } from './tauri-bridge'

// اسم المزوّد الافتراضي المستخدَم كمفتاح في الـ OS Keychain
const KEYCHAIN_PROVIDER = 'default'

interface AppSettings {
  apiKey: string
  baseUrl: string
  model: string
  systemPrompt: string
  availableModels: string[]
  correctionModel: string
  autoRetry: boolean // Automatic retry setting
  maxRetries: number // Maximum number of retry attempts
}

interface AppState extends AppSettings {
  setApiKey: (key: string) => void
  hydrateApiKey: () => Promise<void> // تحميل المفتاح من الـ Keychain عند بدء التطبيق (Tauri فقط)
  setBaseUrl: (url: string) => void
  setModel: (model: string) => void
  setSystemPrompt: (prompt: string) => void
  setAvailableModels: (models: string[]) => void
  setCorrectionModel: (model: string) => void
  setAutoRetry: (enabled: boolean) => void // Set automatic retry
  setMaxRetries: (count: number) => void // Set the maximum number of attempts
  resetSettings: () => void
}

const defaultSettings: AppSettings = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-v3.2-exp',
  correctionModel: 'grok-beta-fast',
  autoRetry: true, // Enable automatic retry by default
  maxRetries: 3, // The default maximum number of attempts is 3
  systemPrompt: 'أنت مساعد تفاعلي لتحسين الموجّهات. هدفك هو إرشاد المستخدم عبر محادثة متعدّدة الجولات لتوضيح متطلباته، ثم إنشاء موجّه منظّم وعالي الجودة في النهاية.\n\nملاحظات مهمة:\n1. عندما يرفع المستخدم صورة، حلّل محتواها بعناية واربطها بوصفه النصّي لفهم احتياجه الحقيقي\n2. عندما يرفع المستخدم مستندًا (PDF/DOCX)، يُقدَّم محتوى المستند كنصّ؛ حسّن الموجّه بناءً على محتوى المستند وتعليمات المستخدم\n3. ينبغي أن تقدّم اقتراحات بشكل استباقي، مستخدمًا نموذجًا تفاعليًا ليختار المستخدم اتجاهات التحسين',
  availableModels: [
    // OpenAI series
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'o1',
    'o1-mini',
    // Anthropic Claude series
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    // Local large models
    'deepseek-v3.2-exp',
    'deepseek-chat',
    'deepseek-reasoner',
    'GLM-4-Plus',
    'GLM-4-Air',
    'Qwen-Max',
    'Qwen-Plus',
    'moonshot-v1-128k',
    'yi-lightning',
    'yi-large'
  ]
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setApiKey: (apiKey) => {
        set({ apiKey })
        // داخل Tauri: نخزّن المفتاح بأمان في الـ OS Keychain (لا نتركه في localStorage)
        if (isTauriApp()) {
          keychainSave(KEYCHAIN_PROVIDER, apiKey).catch((e) =>
            console.error('فشل حفظ المفتاح في الـ Keychain:', e)
          )
        }
      },
      // تحميل المفتاح المحفوظ من الـ Keychain (يُستدعى مرّة عند بدء التطبيق)
      hydrateApiKey: async () => {
        if (!isTauriApp()) return
        try {
          const key = await keychainGet(KEYCHAIN_PROVIDER)
          if (key) set({ apiKey: key })
        } catch (e) {
          console.error('فشل تحميل المفتاح من الـ Keychain:', e)
        }
      },
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      setModel: (model) => set({ model }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setAvailableModels: (availableModels) => set({ availableModels }),
      setCorrectionModel: (correctionModel) => set({ correctionModel }),
      setAutoRetry: (autoRetry) => set({ autoRetry }),
      setMaxRetries: (maxRetries) => set({ maxRetries }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'prompt-iterator-storage',
      storage: createJSONStorage(() => localStorage),
      // داخل Tauri: نستثني apiKey من التخزين بنصّ صريح في localStorage
      // (يُحفظ في الـ OS Keychain بدلاً من ذلك). في المتصفح يبقى السلوك كما هو.
      partialize: (state) => {
        if (isTauriApp()) {
          const { apiKey, ...rest } = state
          return rest as AppState
        }
        return state
      },
    }
  )
)
