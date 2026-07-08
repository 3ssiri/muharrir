import { describe, expect, it } from 'vitest'
import { BUILTIN_PROVIDERS, findProviderByBaseUrl, normalizeBaseUrl } from '@/lib/providers'

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
      expect.arrayContaining(['deepseek', 'openai', 'openrouter', 'ollama', 'lmstudio'])
    )
  })
})

