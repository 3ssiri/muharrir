import { describe, it, expect } from 'vitest'
import { mapError, extractProviderMessage, normalizeApiKey } from '@/lib/chat-client'

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
