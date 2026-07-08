import { describe, expect, it } from 'vitest'
import { exportToJSON, exportToMarkdown } from '@/lib/export-utils'
import { importFromJSON, importFromMarkdown } from '@/lib/import-utils'
import type { FavoritePrompt } from '@/lib/db'

const favorite: FavoritePrompt = {
  id: 1,
  title: 'Prompt title',
  content: 'Use a structured output format.',
  tags: ['demo', 'arabic'],
  createdAt: new Date('2026-07-08T10:00:00.000Z'),
  updatedAt: new Date('2026-07-08T11:00:00.000Z'),
}

describe('favorites import/export utilities', () => {
  it('exports favorites to JSON without database ids', () => {
    const data = JSON.parse(exportToJSON([favorite]))

    expect(data).toMatchObject({
      version: '1.0',
      count: 1,
      favorites: [
        {
          title: 'Prompt title',
          content: 'Use a structured output format.',
          tags: ['demo', 'arabic'],
        },
      ],
    })
    expect(data.favorites[0].id).toBeUndefined()
  })

  it('imports favorites from JSON and restores date fields', () => {
    const [imported] = importFromJSON(exportToJSON([favorite]))

    expect(imported.title).toBe('Prompt title')
    expect(imported.content).toBe('Use a structured output format.')
    expect(imported.tags).toEqual(['demo', 'arabic'])
    expect(imported.createdAt).toBeInstanceOf(Date)
    expect(imported.updatedAt).toBeInstanceOf(Date)
  })

  it('exports and imports Arabic markdown favorites', () => {
    const markdown = exportToMarkdown([favorite])
    const [imported] = importFromMarkdown(markdown)

    expect(markdown).toContain('# الموجّهات المفضّلة')
    expect(imported).toMatchObject({
      title: 'Prompt title',
      content: 'Use a structured output format.',
      tags: ['demo', 'arabic'],
    })
  })

  it('rejects invalid JSON import payloads', () => {
    expect(() => importFromJSON('{"favorites": "not-an-array"}')).toThrow('فشل تحليل JSON')
  })
})

