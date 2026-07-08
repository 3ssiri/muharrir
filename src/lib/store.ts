import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'
import { isTauriApp, saveApiKey as keychainSave, getApiKey as keychainGet } from './tauri-bridge'
import { log } from './logger'
import type { Provider } from './providers'

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
  customProviders: Provider[] // مزوّدات أضافها المستخدم يدويًّا (محفوظة)
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
  addCustomProvider: (provider: Provider) => void
  removeCustomProvider: (id: string) => void
  resetSettings: () => void
}

const defaultSettings: AppSettings = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  correctionModel: '', // فارغ = استخدم نموذج المحادثة نفسه للتصحيح (الأكثر أمانًا عبر المزوّدين)
  autoRetry: true, // Enable automatic retry by default
  maxRetries: 3, // The default maximum number of attempts is 3
  customProviders: [],
  systemPrompt: 'أنت مساعد تفاعلي لتحسين الموجّهات. هدفك هو إرشاد المستخدم عبر محادثة متعدّدة الجولات لتوضيح متطلباته، ثم إنشاء موجّه منظّم وعالي الجودة في النهاية.\n\nملاحظات مهمة:\n1. عندما يرفع المستخدم صورة، حلّل محتواها بعناية واربطها بوصفه النصّي لفهم احتياجه الحقيقي\n2. عندما يرفع المستخدم مستندًا (PDF/DOCX)، يُقدَّم محتوى المستند كنصّ؛ حسّن الموجّه بناءً على محتوى المستند وتعليمات المستخدم\n3. ينبغي أن تقدّم اقتراحات بشكل استباقي، مستخدمًا نموذجًا تفاعليًا ليختار المستخدم اتجاهات التحسين',
  availableModels: ['deepseek-chat', 'deepseek-reasoner']
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setApiKey: (apiKey) => {
        set({ apiKey })
        // داخل Tauri: نخزّن المفتاح في OS Keychain فقط. إذا تعذّر الوصول إليه
        // لا نحفظ المفتاح في localStorage.
        if (isTauriApp() && apiKey) {
          keychainSave(KEYCHAIN_PROVIDER, apiKey)
            .catch((e) => {
              log.error('فشل حفظ المفتاح:', e)
              toast.error(
                'فشل حفظ مفتاح API في مخزن مفاتيح النظام. لن يُحفظ المفتاح محليًا داخل تطبيق سطح المكتب.'
              )
            })
        }
      },
      // تحميل المفتاح المحفوظ من الـ Keychain (يُستدعى مرّة عند بدء التطبيق)
      hydrateApiKey: async () => {
        if (!isTauriApp()) return
        try {
          const key = await keychainGet(KEYCHAIN_PROVIDER)
          if (key) set({ apiKey: key })
        } catch (e) {
          log.error('فشل تحميل المفتاح من الـ Keychain:', e)
        }
      },
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      setModel: (model) => set({ model }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setAvailableModels: (availableModels) => set({ availableModels }),
      setCorrectionModel: (correctionModel) => set({ correctionModel }),
      setAutoRetry: (autoRetry) => set({ autoRetry }),
      setMaxRetries: (maxRetries) => set({ maxRetries }),
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
