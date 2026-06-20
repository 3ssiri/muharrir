'use client'

import { PRESET_MODES } from '@/lib/preset-modes'
import { useTranslations } from 'next-intl'

interface PresetGalleryProps {
  /** Called with a starter prompt when the user picks a mode. */
  onSelect: (starter: string) => void
}

/**
 * Browsable gallery of starter "modes". Picking one seeds the input with a rich,
 * mode-specific starter (role + context + task + output format) so the
 * conversation kicks off in the right direction.
 *
 * Names, descriptions and starters are localized — see the `presets` namespace
 * in the locale files, keyed by each mode's `id`.
 */
export function PresetGallery({ onSelect }: PresetGalleryProps) {
  const t = useTranslations()
  const modes = Object.values(PRESET_MODES)
  // Dynamic message keys (presets.<id>.*); the locale files define every id.
  const tp = (id: string, field: string) => t(`presets.${id}.${field}` as never)

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center">
        {t('welcome.modes')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            aria-label={tp(mode.id, 'name')}
            onClick={() => onSelect(tp(mode.id, 'starter'))}
            className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center transition-colors hover:border-primary hover:bg-accent/40"
          >
            <span className="text-2xl" aria-hidden="true">{mode.icon}</span>
            <span className="text-xs font-semibold group-hover:text-primary transition-colors">
              {tp(mode.id, 'name')}
            </span>
            <span className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
              {tp(mode.id, 'description')}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
