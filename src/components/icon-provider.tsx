'use client'

import { IconContext } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

// Applies the "duotone" weight to every Phosphor icon in the app, giving the
// whole UI a distinctive look. Per-icon size still comes from Tailwind classes
// (e.g. `w-4 h-4`), which override the SVG's intrinsic size.
export function IconProvider({ children }: { children: ReactNode }) {
  return (
    <IconContext.Provider value={{ weight: 'duotone' }}>
      {children}
    </IconContext.Provider>
  )
}
