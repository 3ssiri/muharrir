import { describe, it, expect } from 'vitest'
import { estimateTokens } from '@/lib/token-estimate'

describe('estimateTokens', () => {
  it('returns 0 for empty input', () => {
    expect(estimateTokens('')).toBe(0)
  })

  it('returns at least 1 for any non-empty text', () => {
    expect(estimateTokens('a')).toBe(1)
  })

  it('approximates ~4 characters per token', () => {
    expect(estimateTokens('a'.repeat(40))).toBe(10)
  })

  it('handles Arabic text', () => {
    expect(estimateTokens('مرحبا بالعالم')).toBeGreaterThan(0)
  })
})
