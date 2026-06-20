'use client'

import { PRESET_MODES } from '@/lib/preset-modes'
import { useTranslations } from 'next-intl'

interface PresetGalleryProps {
  /** Called with a starter prompt when the user picks a mode. */
  onSelect: (starter: string) => void
}

/**
 * Browsable gallery of starter "modes" (previously the unused PRESET_MODES
 * config). Picking one seeds the input with a mode-appropriate starter so the
 * conversation kicks off in the right direction.
 */
export function PresetGallery({ onSelect }: PresetGalleryProps) {
  const t = useTranslations()
  const modes = Object.values(PRESET_MODES)

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center">
        {t('welcome.modes')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            aria-label={mode.name}
            onClick={() => onSelect(t('welcome.modeStarter', { mode: mode.name }))}
            className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center transition-colors hover:border-primary hover:bg-accent/40"
          >
            <span className="text-2xl" aria-hidden="true">{mode.icon}</span>
            <span className="text-xs font-semibold group-hover:text-primary transition-colors">
              {mode.name}
            </span>
            <span className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
              {mode.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
