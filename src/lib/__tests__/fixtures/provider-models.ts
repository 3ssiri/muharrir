// نماذج ثابتة (fixtures) لاستجابات `{baseUrl}/models` بأشكال مزوّدين حقيقيين،
// لاختبار تحليل قوائم النماذج دون مفاتيح API أو اتصال شبكي.

/** معيار OpenAI — يشمل OpenAI وDeepSeek وOpenRouter وGroq وغيرها */
export const openAiModelsResponse = {
  object: 'list',
  data: [
    { id: 'gpt-4o-mini', object: 'model', created: 1720000000, owned_by: 'openai' },
    { id: 'gpt-4o', object: 'model', created: 1710000000, owned_by: 'openai' },
  ],
}

/** Ollama المحلي — نقطة نهاية متوافقة مع OpenAI على localhost:11434 */
export const ollamaModelsResponse = {
  object: 'list',
  data: [
    { id: 'nomic-embed-text:latest', object: 'model', created: 1710000000, owned_by: 'library' },
    { id: 'qwen2.5:3b', object: 'model', created: 1710000001, owned_by: 'library' },
  ],
}

/** Anthropic — GET /v1/models بواجهة Messages الأصلية */
export const anthropicModelsResponse = {
  data: [
    { type: 'model', id: 'claude-haiku-4-5', display_name: 'Claude Haiku 4.5', created_at: '2025-10-15T00:00:00Z' },
    { type: 'model', id: 'claude-sonnet-5', display_name: 'Claude Sonnet 5', created_at: '2025-09-29T00:00:00Z' },
  ],
  has_more: false,
  first_id: 'claude-haiku-4-5',
  last_id: 'claude-sonnet-5',
}

/** جسم خطأ مزوّد (مفتاح غير صالح) — لا يحمل مصفوفة data */
export const errorPayloadResponse = {
  error: { message: 'Invalid API key', type: 'authentication_error' },
}

/** مدخل غير كائني تمامًا (صفحة خطأ بوابة وسيطة مثلًا) */
export const nonObjectResponse = 'Service Unavailable'
