'use client'

import { IconContext } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

// Applies the "duotone" weight to every Phosphor icon in the app, giving the
// whole UI a distinctive look. Per-icon size still comes from Tailwind classes
// (e.g. `w-4 h-4`), which override the SVG's intrinsic size.
export function IconProvider({ children }: { children: ReactNode }) {
  return (
    <IconContext.Provider
      value={{
        // A complete context value is required: passing only `weight` leaves
        // color/size undefined, which makes Phosphor render icons with a black
        // fill (invisible on dark surfaces). currentColor lets icons inherit
        // the surrounding text color; the 1em size is overridden per-icon by
        // Tailwind width/height classes (e.g. `w-4 h-4`).
        color: 'currentColor',
        size: '1em',
        weight: 'duotone',
        mirrored: false,
      }}
    >
      {children}
    </IconContext.Provider>
  )
}
