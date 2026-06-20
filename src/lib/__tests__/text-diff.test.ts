import { describe, it, expect } from 'vitest'
import { diffLines, isIdentical } from '@/lib/text-diff'

describe('diffLines', () => {
  it('reports all-same for identical text', () => {
    const ops = diffLines('a\nb\nc', 'a\nb\nc')
    expect(isIdentical(ops)).toBe(true)
    expect(ops).toHaveLength(3)
  })

  it('detects an added line', () => {
    const ops = diffLines('a\nc', 'a\nb\nc')
    expect(ops.filter((o) => o.type === 'add').map((o) => o.text)).toEqual(['b'])
    expect(ops.filter((o) => o.type === 'remove')).toHaveLength(0)
  })

  it('detects a removed line', () => {
    const ops = diffLines('a\nb\nc', 'a\nc')
    expect(ops.filter((o) => o.type === 'remove').map((o) => o.text)).toEqual(['b'])
  })

  it('detects a changed line as remove + add', () => {
    const ops = diffLines('hello', 'world')
    expect(ops.map((o) => o.type).sort()).toEqual(['add', 'remove'])
    expect(isIdentical(ops)).toBe(false)
  })
})
