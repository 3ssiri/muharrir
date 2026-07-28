import { afterEach, describe, it, expect, vi } from 'vitest'
import { consumeChatStream } from '@/lib/chat-stream'
import { mapError, extractProviderMessage, normalizeApiKey, streamChat } from '@/lib/chat-client'
import { validateToolCall } from '@/lib/format-validator'

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

  it('returns the Arabic demo sample when locale is ar', async () => {
    const response = await streamChat({
      messages: [{ role: 'user', content: 'حوّل فكرة دورة إلى موجه' }],
      apiKey: 'demo',
      baseUrl: 'https://example.invalid/v1',
      locale: 'ar',
    })

    const result = await consumeChatStream(response, () => {})

    expect(result.content).toContain('الوضع التجريبي')
    expect(result.toolInvocations).toHaveLength(2)
    expect(result.toolInvocations[1].args).toMatchObject({
      title: 'مساعد تحويل المستندات إلى موجّهات',
      finalPrompt: expect.stringContaining('{{الفكرة_الأولية}}'),
    })
  })

  it('falls back to the English demo sample for unknown or missing locales', async () => {
    for (const locale of [undefined, 'fr']) {
      const response = await streamChat({
        messages: [{ role: 'user', content: 'demo please' }],
        apiKey: 'demo',
        baseUrl: 'https://example.invalid/v1',
        locale,
      })
      const result = await consumeChatStream(response, () => {})
      expect(result.toolInvocations[1].args).toMatchObject({
        title: 'Document-to-Prompt Assistant',
      })
    }
  })

  it('streams demo tool args that pass format validation in both locales', async () => {
    for (const locale of ['ar', 'en']) {
      const response = await streamChat({
        messages: [{ role: 'user', content: 'demo' }],
        apiKey: 'demo',
        baseUrl: 'https://example.invalid/v1',
        locale,
      })
      const result = await consumeChatStream(response, () => {})
      for (const tool of result.toolInvocations) {
        expect(validateToolCall(tool.toolName, tool.args).valid).toBe(true)
      }
    }
  })

  it('keeps demo enhancement keys and option values identical across locales', async () => {
    const streamDemoDimensions = async (locale: string) => {
      const response = await streamChat({
        messages: [{ role: 'user', content: 'demo' }],
        apiKey: 'demo',
        baseUrl: 'https://example.invalid/v1',
        locale,
      })
      const result = await consumeChatStream(response, () => {})
      return (result.toolInvocations[0].args as { dimensions: any[] }).dimensions
    }

    const arDims = await streamDemoDimensions('ar')
    const enDims = await streamDemoDimensions('en')

    // Option values flow back to the model — they must never be translated.
    const keys = (d: any[]) => d.map((x) => x.key)
    const values = (d: any[]) => d.flatMap((x) => x.options.map((o: any) => o.value))
    expect(keys(arDims)).toEqual(keys(enDims))
    expect(values(arDims)).toEqual(values(enDims))
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

describe('streamChat Anthropic provider', () => {
  it('sends a native Messages API request with Anthropic headers and tool schemas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        [
          'event: content_block_start',
          'data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}',
          '',
          'event: content_block_delta',
          'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"hello"}}',
          '',
          'event: message_stop',
          'data: {"type":"message_stop"}',
          '',
        ].join('\n')
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await streamChat({
      messages: [{ role: 'user', content: 'حوّل الفكرة إلى موجه' }],
      apiKey: 'anth-key',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-sonnet-5',
      systemPrompt: 'Use Muharrir tools.',
    })

    expect(response.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers).toMatchObject({
      'Content-Type': 'application/json',
      'x-api-key': 'anth-key',
      'anthropic-version': '2023-06-01',
    })
    expect(init.headers).not.toHaveProperty('Authorization')

    const body = JSON.parse(init.body)
    expect(body).toMatchObject({
      model: 'claude-sonnet-5',
      system: 'Use Muharrir tools.',
      tool_choice: { type: 'any' },
      stream: true,
    })
    expect(body.messages).toEqual([{ role: 'user', content: 'حوّل الفكرة إلى موجه' }])
    expect(body.tools[0]).toMatchObject({
      name: 'ask_questions',
      input_schema: expect.objectContaining({ type: 'object' }),
    })
  })

  it('parses streamed Anthropic tool_use blocks into Muharrir tool calls', async () => {
    const args = {
      dimensions: [
        {
          key: 'audience',
          title: 'Audience',
          options: [
            {
              label: 'Developers',
              value: 'developers',
              description: 'Use technical implementation details.',
            },
          ],
          allowCustom: true,
        },
      ],
    }
    const rawArgs = JSON.stringify(args)
    const splitAt = Math.floor(rawArgs.length / 2)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          [
            'event: content_block_start',
            'data: {"type":"content_block_start","index":0,"content_block":{"type":"tool_use","id":"toolu_1","name":"suggest_enhancements","input":{}}}',
            '',
            'event: content_block_delta',
            `data: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: rawArgs.slice(0, splitAt) } })}`,
            '',
            'event: content_block_delta',
            `data: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: rawArgs.slice(splitAt) } })}`,
            '',
            'event: content_block_stop',
            'data: {"type":"content_block_stop","index":0}',
            '',
            'event: message_stop',
            'data: {"type":"message_stop"}',
            '',
          ].join('\n')
        )
      )
    )

    const response = await streamChat({
      messages: [{ role: 'user', content: 'Build a prompt workflow' }],
      apiKey: 'anth-key',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-sonnet-5',
    })

    const result = await consumeChatStream(response, () => {})

    expect(result.toolInvocations).toHaveLength(1)
    expect(result.toolInvocations[0]).toMatchObject({
      toolCallId: 'toolu_1',
      toolName: 'suggest_enhancements',
      args,
    })
  })
})

describe('default system prompt', () => {
  it('includes the Arabic prompt structure section', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('data: [DONE]\n\n'))
    vi.stubGlobal('fetch', fetchMock)

    await streamChat({
      messages: [{ role: 'user', content: 'حوّل فكرة إلى موجه' }],
      apiKey: 'test-key',
      baseUrl: 'https://example.invalid/v1',
      model: 'test-model',
    })

    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body as string)
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[0].content).toContain('# Arabic prompt structure')
    expect(body.messages[0].content).toContain('الدور:')
    expect(body.messages[0].content).toContain('صيغة المخرجات:')

    const content = body.messages[0].content as string
    const headers = ['الدور:', 'الهدف:', 'السياق:', 'القيود:', 'خطوات العمل:', 'صيغة المخرجات:']
    const positions = headers.map((h) => content.indexOf(h))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect([...positions]).toEqual([...positions].sort((a, b) => a - b))
    expect(content).toContain('## Mini example (skeleton)')
  })
})
