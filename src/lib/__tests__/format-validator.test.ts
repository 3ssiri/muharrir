import { describe, it, expect } from 'vitest'
import { validateToolCall } from '@/lib/format-validator'

describe('validateToolCall', () => {
  it('accepts a valid suggest_enhancements payload', () => {
    const args = {
      dimensions: [
        { key: 'tone', title: 'Tone', options: [{ label: 'Formal', value: 'formal' }] },
      ],
    }
    expect(validateToolCall('suggest_enhancements', args).valid).toBe(true)
  })

  it('rejects suggest_enhancements with a malformed dimension', () => {
    const args = { dimensions: [{ key: 'tone' /* missing title/options */ }] }
    expect(validateToolCall('suggest_enhancements', args).valid).toBe(false)
  })

  it('accepts a valid propose_prompt payload', () => {
    const args = {
      title: 'T',
      role: 'R',
      objective: 'O',
      constraints: ['c1'],
      finalPrompt: 'do the thing',
    }
    expect(validateToolCall('propose_prompt', args).valid).toBe(true)
  })

  it('rejects propose_prompt missing required fields', () => {
    expect(validateToolCall('propose_prompt', { title: 'T' }).valid).toBe(false)
  })

  it('does not validate unknown tools (treated as valid)', () => {
    expect(validateToolCall('ask_questions', { anything: true }).valid).toBe(true)
  })
})
