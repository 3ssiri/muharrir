import { describe, it, expect } from 'vitest'
import { classifyChatError, consumeChatStream } from '@/lib/chat-stream'

describe('classifyChatError', () => {
  it('classifies auth errors', () => {
    expect(classifyChatError(new Error('Authentication Failed: bad key')).type).toBe('auth')
    expect(classifyChatError(new Error('HTTP 401')).type).toBe('auth')
  })
  it('classifies network errors', () => {
    expect(classifyChatError(new Error('Connection Failed')).type).toBe('network')
    expect(classifyChatError(new Error('Failed to fetch')).type).toBe('network')
  })
  it('classifies quota errors', () => {
    expect(classifyChatError(new Error('429 rate limit')).type).toBe('quota')
  })
  it('classifies server errors', () => {
    expect(classifyChatError(new Error('500 server error')).type).toBe('server')
  })
  it('falls back to unknown', () => {
    expect(classifyChatError(new Error('something weird')).type).toBe('unknown')
  })
})

// Build a streamed Response from protocol lines for the consumer test.
function streamResponse(lines: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder()
      for (const l of lines) controller.enqueue(enc.encode(l + '\n'))
      controller.close()
    },
  })
  return new Response(body)
}

describe('consumeChatStream', () => {
  it('accumulates text and tool calls', async () => {
    const res = streamResponse([
      '0:"Hello "',
      '0:"world"',
      '9:{"toolCallId":"1","toolName":"propose_prompt","args":{"title":"x"}}',
    ])
    const out = await consumeChatStream(res, () => {})
    expect(out.content).toBe('Hello world')
    expect(out.toolInvocations).toHaveLength(1)
    expect(out.toolInvocations[0].toolName).toBe('propose_prompt')
  })

  it('ignores correction status events (non-fatal)', async () => {
    const res = streamResponse(['e:{"type":"correction","status":"correcting"}', '0:"ok"'])
    const out = await consumeChatStream(res, () => {})
    expect(out.content).toBe('ok')
  })

  it('throws on a fatal error event', async () => {
    const res = streamResponse(['e:{"type":"error","message":"boom"}'])
    await expect(consumeChatStream(res, () => {})).rejects.toThrow('boom')
  })
})
