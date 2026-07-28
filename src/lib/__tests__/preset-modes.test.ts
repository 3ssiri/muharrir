import { describe, it, expect } from 'vitest'
import { PRESET_MODES } from '@/lib/preset-modes'
import arMessages from '@/i18n/locales/ar.json'
import enMessages from '@/i18n/locales/en.json'

type PresetEntry = { name?: string; description?: string; starter?: string }

describe('preset modes locale coverage', () => {
  it('every preset mode has localized name, description, and starter in both locales', () => {
    for (const id of Object.keys(PRESET_MODES)) {
      for (const messages of [arMessages, enMessages]) {
        const entry = (messages.presets as Record<string, PresetEntry>)[id]
        expect(entry, `missing presets.${id}`).toBeDefined()
        expect(entry?.name, `presets.${id}.name`).toBeTruthy()
        expect(entry?.description, `presets.${id}.description`).toBeTruthy()
        expect(entry?.starter, `presets.${id}.starter`).toBeTruthy()
      }
    }
  })

  it('includes the four persona pack modes', () => {
    expect(Object.keys(PRESET_MODES)).toEqual(
      expect.arrayContaining(['code_review', 'lesson_plan', 'paper_summary', 'video_script'])
    )
  })
})
