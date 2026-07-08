import { afterEach, describe, it, expect, vi } from 'vitest'
import { consumeChatStream } from '@/lib/chat-stream'
import { mapError, extractProviderMessage, normalizeApiKey, streamChat } from '@/lib/chat-client'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('extractProviderMessage', () => {
  it('extracts error.message from a provider JSON body', () => {
    const raw = JSON.stringify({ error: { message: 'Insufficient credits', code: 402 } })
    expect(extractProviderMessage(raw)).toBe('Insufficient credits')
  })

  it('returns the raw string when it is not JSON', () => {
    expect(extractProviderMessage('plain error text')).toBe('plain error text')
  })
})

describe('mapError', () => {
  it('maps 401 to a clear invalid-key message', () => {
    // DeepSeek phrasing is "Authentication Fails ..." — status drives the mapping.
    expect(mapError(401, 'Authentication Fails, Your api key is invalid')).toMatch(/Invalid API Key/i)
  })

  it('maps 402 insufficient-credits to a clear short message, not the raw body', () => {
    const raw = JSON.stringify({
      error: {
        message:
          'This request requires more credits, or fewer max_tokens. You requested up to 16384 tokens, but can only afford 59. To increase, visit https://openrouter.ai/settings/credits and upgrade to a paid account',
        code: 402,
      },
    })
    const msg = mapError(402, raw)
    expect(msg).toMatch(/insufficient|credits|balance/i)
    expect(msg.length).toBeLessThan(200)
  })

  it('detects an insufficient-credits body even without a 402 status', () => {
    const raw = JSON.stringify({ error: { message: 'This request requires more credits' } })
    expect(mapError(400, raw)).toMatch(/insufficient|credits|balance/i)
  })

  it('maps 404 to model-not-found', () => {
    expect(mapError(404, 'model_not_found', 'foo-model')).toMatch(/Model Not Found/i)
  })

  it('truncates very long unmapped error bodies', () => {
    const longRaw = 'x'.repeat(5000)
    const msg = mapError(418, longRaw)
    expect(msg.length).toBeLessThanOrEqual(320)
  })
})

describe('normalizeApiKey', () => {
  it('trims surrounding whitespace and newlines', () => {
    expect(normalizeApiKey('  sk-abc123 \n')).toBe('sk-abc123')
  })
})

describe('streamChat demo mode', () => {
  it('returns a local structured prompt workflow without calling a provider', async () => {
    const response = await streamChat({
      messages: [{ role: 'user', content: 'حوّل فكرة تطبيق تعليم إلى prompt' }],
      apiKey: ' demo ',
      baseUrl: 'https://example.invalid/v1',
    })

    expect(response.ok).toBe(true)
    expect(response.headers.get('X-Vercel-AI-Data-Stream')).toBe('v1')

    const result = await consumeChatStream(response, () => {})

    expect(result.content).toContain('Demo Mode')
    expect(result.content).toContain('No external AI provider is called')
    expect(result.toolInvocations).toHaveLength(2)
    expect(result.toolInvocations.map((tool) => tool.toolName)).toEqual([
      'suggest_enhancements',
      'propose_prompt',
    ])
    expect(result.toolInvocations[0].args).toMatchObject({
      dimensions: expect.arrayContaining([
        expect.objectContaining({ key: 'audience' }),
        expect.objectContaining({ key: 'output_style' }),
      ]),
    })
    expect(result.toolInvocations[1].args).toMatchObject({
      title: 'Document-to-Prompt Assistant',
      finalPrompt: expect.stringContaining('{{user_idea}}'),
    })
  })
})

describe('streamChat local providers', () => {
  it('allows local OpenAI-compatible providers without an API key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('data: [DONE]\n\n'))
    vi.stubGlobal('fetch', fetchMock)

    const response = await streamChat({
      messages: [{ role: 'user', content: 'اكتب موجهًا قصيرًا' }],
      apiKey: '',
      baseUrl: 'http://localhost:11434/v1',
      model: 'qwen2.5:7b',
    })

    expect(response.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:11434/v1/chat/completions',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('adds a local-model note when no tool call is streamed', async () => {
    const chunk = {
      choices: [
        {
          delta: {
            content: 'هذا رد نصي عادي.',
          },
        },
      ],
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`))
    )

    const response = await streamChat({
      messages: [{ role: 'user', content: 'حوّل فكرة تطبيق ملاحظات إلى موجه منظم' }],
      apiKey: '',
      baseUrl: 'http://localhost:11434/v1',
      model: 'qwen2.5:7b',
    })

    const result = await consumeChatStream(response, () => {})

    expect(result.content).toContain('هذا رد نصي عادي.')
    expect(result.content).toContain('النموذج المحلي رد كنص عادي')
    expect(result.content).toContain('The local model replied with plain text')
  })
})
