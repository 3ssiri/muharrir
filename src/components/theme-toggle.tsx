'use client'

import { Moon, Sun } from '@/components/icons'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useSyncExternalStore } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // Hydration-safe "mounted" flag without setState-in-effect
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const handleThemeChange = () => {
    // Use the View Transitions API (if the browser supports it)
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
      })
    } else {
      // Fallback: add a gradient overlay layer
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
      `
      document.body.appendChild(overlay)

      // Fade the overlay in gradually
      requestAnimationFrame(() => {
        overlay.style.opacity = '1'
      })

      // Switch the theme
      setTimeout(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark')

        // Fade the overlay out gradually
        setTimeout(() => {
          overlay.style.opacity = '0'
          setTimeout(() => {
            document.body.removeChild(overlay)
          }, 300)
        }, 100)
      }, 300)
    }
  }

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9" disabled />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 relative overflow-hidden"
      onClick={handleThemeChange}
    >
      <Sun className={`h-4 w-4 absolute transition-all [transition-duration:800ms] ease-in-out ${
        theme === 'dark'
          ? 'rotate-0 scale-100 opacity-100'
          : 'rotate-90 scale-0 opacity-0'
      }`} />
      <Moon className={`h-4 w-4 absolute transition-all [transition-duration:800ms] ease-in-out ${
        theme === 'dark'
          ? '-rotate-90 scale-0 opacity-0'
          : 'rotate-0 scale-100 opacity-100'
      }`} />
    </Button>
  )
}
