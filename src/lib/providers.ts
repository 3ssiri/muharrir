// كتالوج المزوّدات المتوافقة مع OpenAI + أدوات البحث عنها.
// النماذج هنا اقتراحات للبدء؛ «اختبار الاتصال» يجلب القائمة الحيّة من /models.

export interface Provider {
  id: string
  name: string
  baseUrl: string
  models: string[]
  docsUrl?: string   // رابط الحصول على مفتاح API (اختياري)
  isLocal?: boolean  // محلي (Ollama/LM Studio) — لا يحتاج مفتاحًا
  apiFormat?: 'openai-compatible' | 'anthropic'
}

export const BUILTIN_PROVIDERS: Provider[] = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o3', 'o4-mini'], docsUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic (Claude)', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-sonnet-5', 'claude-haiku-4-5', 'claude-opus-4-8', 'claude-fable-5'], docsUrl: 'https://console.anthropic.com/settings/keys', apiFormat: 'anthropic' },
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

export function isLocalProviderBaseUrl(baseUrl: string): boolean {
  try {
    const { hostname } = new URL(normalizeBaseUrl(baseUrl))
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return false
  }
}

export function isAnthropicProviderBaseUrl(baseUrl: string): boolean {
  try {
    const { hostname } = new URL(normalizeBaseUrl(baseUrl))
    return hostname === 'api.anthropic.com'
  } catch {
    return false
  }
}

export function getProviderApiFormat(
  baseUrl: string,
  customProviders: Provider[] = []
): NonNullable<Provider['apiFormat']> {
  const provider = findProviderByBaseUrl(baseUrl, customProviders)
  if (provider?.apiFormat) return provider.apiFormat
  return isAnthropicProviderBaseUrl(baseUrl) ? 'anthropic' : 'openai-compatible'
}

const NON_CHAT_LOCAL_MODEL_PATTERN = /(embed|embedding|bge|nomic|ocr|vision|vl|clip|rerank|minicpm)/i
const PREFERRED_LOCAL_CHAT_MODEL_PATTERN = /(qwen2\.5.*7b|qwen3.*8b|qwen.*instruct|llama.*instruct|mistral|gemma.*it)/i

function localChatModelScore(model: string): number {
  if (PREFERRED_LOCAL_CHAT_MODEL_PATTERN.test(model)) return 100
  if (NON_CHAT_LOCAL_MODEL_PATTERN.test(model)) return -100
  if (/(qwen|llama|mistral|gemma|deepseek|phi)/i.test(model)) return 50
  return 0
}

export function selectPreferredLocalChatModel(models: string[]): string {
  const candidates = models.filter(Boolean)
  if (candidates.length === 0) return ''

  return [...candidates].sort((a, b) => {
    const scoreDelta = localChatModelScore(b) - localChatModelScore(a)
    if (scoreDelta !== 0) return scoreDelta
    return a.localeCompare(b)
  })[0]
}
