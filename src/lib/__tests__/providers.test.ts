import { describe, expect, it } from 'vitest'
import {
  BUILTIN_PROVIDERS,
  findProviderByBaseUrl,
  getProviderApiFormat,
  isAnthropicProviderBaseUrl,
  isLocalProviderBaseUrl,
  normalizeBaseUrl,
  parseModelsResponse,
  selectPreferredLocalChatModel,
} from '@/lib/providers'
import {
  anthropicModelsResponse,
  errorPayloadResponse,
  nonObjectResponse,
  ollamaModelsResponse,
  openAiModelsResponse,
} from './fixtures/provider-models'

describe('providers', () => {
  it('normalizes whitespace and trailing slashes from base URLs', () => {
    expect(normalizeBaseUrl(' https://api.deepseek.com/// ')).toBe('https://api.deepseek.com')
  })

  it('finds built-in providers by normalized base URL', () => {
    const provider = findProviderByBaseUrl('https://openrouter.ai/api/v1/')

    expect(provider).toMatchObject({
      id: 'openrouter',
      name: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
    })
  })

  it('allows custom providers to extend the built-in list', () => {
    const provider = findProviderByBaseUrl('http://localhost:9999/v1/', [
      {
        id: 'local-test',
        name: 'Local Test',
        baseUrl: 'http://localhost:9999/v1',
        models: ['test-model'],
        isLocal: true,
      },
    ])

    expect(provider?.id).toBe('local-test')
  })

  it('keeps required public provider presets available', () => {
    expect(BUILTIN_PROVIDERS.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(['anthropic', 'deepseek', 'openai', 'openrouter', 'ollama', 'lmstudio'])
    )
  })

  it('marks Anthropic as a native Messages API provider', () => {
    const provider = findProviderByBaseUrl('https://api.anthropic.com/v1/')

    expect(provider?.apiFormat).toBe('anthropic')
    expect(isAnthropicProviderBaseUrl('https://api.anthropic.com/v1')).toBe(true)
    expect(getProviderApiFormat('https://api.anthropic.com/v1')).toBe('anthropic')
    expect(getProviderApiFormat('https://openrouter.ai/api/v1')).toBe('openai-compatible')
  })

  it('detects local provider URLs that do not require API keys', () => {
    expect(isLocalProviderBaseUrl('http://localhost:11434/v1')).toBe(true)
    expect(isLocalProviderBaseUrl('http://127.0.0.1:1234/v1/')).toBe(true)
    expect(isLocalProviderBaseUrl('https://api.deepseek.com')).toBe(false)
  })

  it('prefers chat-capable local models over embedding or OCR models', () => {
    expect(
      selectPreferredLocalChatModel([
        'bge-m3:latest',
        'glm-ocr:latest',
        'nomic-embed-text:latest',
        'qwen2.5:7b',
        'qwen2.5vl:7b',
      ])
    ).toBe('qwen2.5:7b')
  })

  it('falls back to a non-empty local model when no known chat model exists', () => {
    expect(selectPreferredLocalChatModel(['bge-m3:latest'])).toBe('bge-m3:latest')
    expect(selectPreferredLocalChatModel([])).toBe('')
  })
})

describe('parseModelsResponse with provider fixtures', () => {
  it('parses OpenAI-format model lists', () => {
    expect(parseModelsResponse(openAiModelsResponse)).toEqual(['gpt-4o', 'gpt-4o-mini'])
  })

  it('parses Anthropic Messages-format model lists', () => {
    expect(parseModelsResponse(anthropicModelsResponse)).toEqual(['claude-haiku-4-5', 'claude-sonnet-5'])
  })

  it('parses local Ollama lists and feeds preferred chat-model selection', () => {
    const models = parseModelsResponse(ollamaModelsResponse)

    expect(models).toEqual(['nomic-embed-text:latest', 'qwen2.5:3b'])
    expect(selectPreferredLocalChatModel(models ?? [])).toBe('qwen2.5:3b')
  })

  it('rejects malformed payloads instead of throwing', () => {
    expect(parseModelsResponse(errorPayloadResponse)).toBeNull()
    expect(parseModelsResponse(nonObjectResponse)).toBeNull()
    expect(parseModelsResponse(null)).toBeNull()
    expect(parseModelsResponse({ data: 'not-an-array' })).toBeNull()
  })
})
