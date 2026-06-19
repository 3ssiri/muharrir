import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AppSettings {
  apiKey: string
  baseUrl: string
  model: string
  systemPrompt: string
  availableModels: string[]
  correctionModel: string
  autoRetry: boolean // إعداد إعادة المحاولة التلقائية
  maxRetries: number // أقصى عدد لمحاولات الإعادة
}

interface AppState extends AppSettings {
  setApiKey: (key: string) => void
  setBaseUrl: (url: string) => void
  setModel: (model: string) => void
  setSystemPrompt: (prompt: string) => void
  setAvailableModels: (models: string[]) => void
  setCorrectionModel: (model: string) => void
  setAutoRetry: (enabled: boolean) => void // ضبط إعادة المحاولة التلقائية
  setMaxRetries: (count: number) => void // ضبط أقصى عدد للمحاولات
  resetSettings: () => void
}

const defaultSettings: AppSettings = {
  apiKey: 'sk-Mdj54E4QkE5dQi6jV4TUli6kEN4fsPQKuIjchrBl6hIjvws1',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-v3.2-exp',
  correctionModel: 'grok-beta-fast',
  autoRetry: true, // تفعيل إعادة المحاولة التلقائية افتراضيًا
  maxRetries: 3, // أقصى عدد للمحاولات افتراضيًا هو 3
  systemPrompt: 'أنت مساعد تفاعلي لتحسين الموجّهات. هدفك هو إرشاد المستخدم عبر محادثة متعدّدة الجولات لتوضيح متطلباته، ثم إنشاء موجّه منظّم وعالي الجودة في النهاية.\n\nملاحظات مهمة:\n1. عندما يرفع المستخدم صورة، حلّل محتواها بعناية واربطها بوصفه النصّي لفهم احتياجه الحقيقي\n2. عندما يرفع المستخدم مستندًا (PDF/DOCX)، يُقدَّم محتوى المستند كنصّ؛ حسّن الموجّه بناءً على محتوى المستند وتعليمات المستخدم\n3. ينبغي أن تقدّم اقتراحات بشكل استباقي، مستخدمًا نموذجًا تفاعليًا ليختار المستخدم اتجاهات التحسين',
  availableModels: [
    // سلسلة OpenAI
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'o1',
    'o1-mini',
    // سلسلة Anthropic Claude
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    // النماذج الكبيرة المحلية
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
      setApiKey: (apiKey) => set({ apiKey }),
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
    }
  )
)
